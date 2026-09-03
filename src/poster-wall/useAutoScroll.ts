import { useCallback, useEffect, useRef } from 'react'
import type { SpeedVariance } from './types'

export type SettleEdge = 'top' | 'bottom'

interface Options {
  /** The element whose transform we drive. Holds COPIES identical stacked sets. */
  trackRef: React.RefObject<HTMLDivElement | null>
  /** Height of one set of cards, including the gap that trails the last card. */
  setHeight: number
  /** Visible height of the column window. */
  viewportHeight: number
  /** +1 drifts content upward, -1 drifts it downward. */
  direction: 1 | -1
  /** Base drift speed in px/second. */
  speed: number
  /** Optional slow swell applied on top of `speed`. */
  variance?: SpeedVariance
  /**
   * How far inside the window edge a settled card comes to rest. Settling flush
   * would put the card's glow outside the clip and slice it off, so this should
   * be at least the glow's blur radius.
   */
  edgeInset?: number
}

/** Number of stacked copies of the card set. Three gives a full set of head-room
 *  either side of the home band, so a settle can run past a seam without
 *  exposing a gap. */
export const COPIES = 3

const SETTLE_MS = 460
const TAU = Math.PI * 2
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

type Mode = 'drift' | 'settling' | 'held'

/**
 * Drives one column of the poster wall.
 *
 * Geometry: the track renders `COPIES` identical sets stacked vertically and is
 * translated by `-T`. `T` is kept in the "home band" [setHeight, 2*setHeight)
 * while drifting, so wrapping is a silent ±setHeight jump that lands on an
 * identical pixel. During a settle `T` may leave the band; it is renormalised on
 * release, which is again invisible for the same reason.
 *
 * This hook assumes motion is wanted. Reduced-motion and pointer-less contexts
 * never mount the wall at all — see `useShowcaseMode`.
 */
export function useAutoScroll({
  trackRef,
  setHeight,
  viewportHeight,
  direction,
  speed,
  variance,
  edgeInset = 0,
}: Options) {
  const T = useRef(0)
  const mode = useRef<Mode>('drift')
  const lastTs = useRef<number | null>(null)
  const settle = useRef({
    from: 0,
    to: 0,
    start: 0,
    edge: 'top' as SettleEdge,
    done: null as null | ((edge: SettleEdge) => void),
  })
  // Reasons the drift is currently held: paused, focused, or scrolled away.
  const suspended = useRef(false)

  const paint = useCallback(() => {
    const el = trackRef.current
    if (el) el.style.transform = `translate3d(0, ${-T.current}px, 0)`
  }, [trackRef])

  // Park in the home band whenever the measured geometry changes.
  useEffect(() => {
    if (setHeight <= 0) return
    if (T.current < setHeight || T.current >= setHeight * 2) {
      T.current = setHeight
    }
    paint()
  }, [setHeight, paint])

  /**
   * The per-frame step. Rebuilt when its inputs change, then handed to the rAF
   * loop through a ref — so changing speed, direction or geometry never tears
   * the loop down and restarts it, and the loop never captures itself.
   */
  const step = useCallback(
    (ts: number) => {
      const dt = lastTs.current == null ? 0 : (ts - lastTs.current) / 1000
      lastTs.current = ts

      if (mode.current === 'settling') {
        const s = settle.current
        const p = Math.min(1, (ts - s.start) / SETTLE_MS)
        T.current = s.from + (s.to - s.from) * easeOutCubic(p)
        paint()
        if (p >= 1) {
          mode.current = 'held'
          const done = s.done
          s.done = null
          done?.(s.edge)
        }
        return
      }

      if (mode.current === 'drift' && !suspended.current && setHeight > 0) {
        // A slow sinusoidal swell around the base speed. Driven by absolute time
        // rather than accumulated dt, so pausing and resuming never leaves a
        // column stranded at the top or bottom of its swing.
        const swell = variance
          ? 1 +
            variance.amplitude *
              Math.sin((ts / 1000 / variance.periodSec) * TAU + variance.phase)
          : 1

        // dt is clamped: a backgrounded tab can hand us a multi-second delta.
        T.current += direction * speed * swell * Math.min(dt, 0.05)
        if (T.current >= setHeight * 2) T.current -= setHeight
        if (T.current < setHeight) T.current += setHeight
        paint()
      }
    },
    [direction, speed, variance, setHeight, paint],
  )

  const stepRef = useRef(step)
  useEffect(() => {
    stepRef.current = step
  }, [step])

  useEffect(() => {
    let id = 0
    const loop = (ts: number) => {
      stepRef.current(ts)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  // Don't burn frames (or drift past content) while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      suspended.current = document.hidden
      lastTs.current = null
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const setSuspended = useCallback((value: boolean) => {
    suspended.current = value
    lastTs.current = null
  }, [])

  /**
   * Stop the drift and glide the given card to whichever edge of the column
   * window it is already closest to, coming to rest `edgeInset` px inside that
   * edge rather than flush against it. Resolves once it has landed — the caller
   * reveals the card's detail face only after that, so the information appears
   * on a card that has come to rest.
   */
  const settleCard = useCallback(
    (absoluteTop: number, cardHeight: number): Promise<SettleEdge> => {
      if (setHeight <= 0) {
        mode.current = 'held'
        return Promise.resolve('top')
      }

      const screenTop = absoluteTop - T.current
      const screenCentre = screenTop + cardHeight / 2
      const edge: SettleEdge = screenCentre < viewportHeight / 2 ? 'top' : 'bottom'

      const target =
        edge === 'top'
          ? absoluteTop - edgeInset
          : absoluteTop + cardHeight - viewportHeight + edgeInset

      return new Promise<SettleEdge>((resolve) => {
        settle.current = {
          from: T.current,
          to: target,
          start: performance.now(),
          edge,
          done: resolve,
        }
        mode.current = 'settling'
      })
    },
    [setHeight, viewportHeight, edgeInset],
  )

  /** Resume drifting from wherever the column came to rest. */
  const release = useCallback(() => {
    settle.current.done = null
    if (setHeight > 0) {
      // Renormalise into the home band; a ±setHeight shift is pixel-identical.
      while (T.current >= setHeight * 2) T.current -= setHeight
      while (T.current < setHeight) T.current += setHeight
      paint()
    }
    lastTs.current = null
    mode.current = 'drift'
  }, [setHeight, paint])

  return { settleCard, release, setSuspended }
}
