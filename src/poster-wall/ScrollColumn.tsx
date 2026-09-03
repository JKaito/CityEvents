import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import type { WallSlot } from './distribute'
import { EventCard } from './EventCard'
import type { PosterWallLabels } from './labels'
import type { ColumnMotion } from './types'
import { COPIES, useAutoScroll } from './useAutoScroll'

interface Props {
  slots: WallSlot[]
  motion: ColumnMotion
  /** Hold still: the wall is paused, or something inside it has focus. */
  frozen: boolean
  labels: PosterWallLabels
  /**
   * Room a revealed card's glow needs. Applied twice, because the two axes
   * cannot be treated the same way:
   *
   *   - horizontally, the clipping element is bled out by this much, so the
   *     glow spills past the column edge instead of being sliced off;
   *   - vertically we cannot bleed — that would expose partial cards above and
   *     below the window and ruin the loop's clean edge — so instead a settled
   *     card comes to rest this far *inside* the edge.
   */
  glowRoom: number
}

export function ScrollColumn({ slots, motion, frozen, labels, glowRoom }: Props) {
  const windowRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLDivElement>(null)

  const [setHeight, setSetHeight] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [inView, setInView] = useState(true)

  const { settleCard, release, setSuspended } = useAutoScroll({
    trackRef,
    setHeight,
    viewportHeight,
    direction: motion.direction,
    speed: motion.speed,
    variance: motion.variance,
    edgeInset: glowRoom,
  })

  // Measure: one set's height (incl. its trailing gap) and the window height.
  useEffect(() => {
    const measure = () => {
      if (setRef.current) setSetHeight(setRef.current.offsetHeight)
      if (windowRef.current) setViewportHeight(windowRef.current.clientHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (setRef.current) ro.observe(setRef.current)
    if (windowRef.current) ro.observe(windowRef.current)
    return () => ro.disconnect()
  }, [])

  // Don't drift while scrolled out of view.
  useEffect(() => {
    const el = windowRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    setSuspended(frozen || !inView)
  }, [frozen, inView, setSuspended])

  /** The card the pointer/focus is currently on, so a settle that lands after
   *  the pointer has moved on doesn't flip the wrong card. */
  const activeKey = useRef<string | null>(null)

  const engage = useCallback(
    async (key: string, el: HTMLElement) => {
      activeKey.current = key
      await settleCard(el.offsetTop, el.offsetHeight)
      if (activeKey.current === key) setRevealedKey(key)
    },
    [settleCard],
  )

  const disengage = useCallback(
    (key: string) => {
      if (activeKey.current !== key) return
      activeKey.current = null
      setRevealedKey(null)
      release()
    },
    [release],
  )

  const renderSet = (copyIndex: number) => (
    <div
      key={copyIndex}
      ref={copyIndex === 0 ? setRef : undefined}
      className="pw-column__set"
      // Only the first copy is real content; the others are loop padding.
      aria-hidden={copyIndex !== 0}
    >
      {slots.map((slot) => {
        const key = `${copyIndex}-${slot.key}`
        const real = copyIndex === 0
        const revealed = revealedKey === key

        const handlers = {
          className: 'pw-slot',
          onPointerEnter: (e: React.PointerEvent<HTMLElement>) =>
            void engage(key, e.currentTarget),
          onPointerLeave: () => disengage(key),
          onFocus: (e: React.FocusEvent<HTMLElement>) =>
            void engage(key, e.currentTarget),
          onBlur: () => disengage(key),
        }

        const card = (
          <EventCard event={slot.event} labels={labels} revealed={revealed} />
        )

        // A card that links somewhere should be a link, not a div pretending.
        return slot.event.url ? (
          <a
            key={key}
            {...handlers}
            href={slot.event.url}
            tabIndex={real ? undefined : -1}
            aria-expanded={revealed}
          >
            {card}
          </a>
        ) : (
          <div
            key={key}
            {...handlers}
            role="button"
            tabIndex={real ? 0 : -1}
            aria-label={`${slot.event.title} — ${slot.event.dateLabel}`}
            aria-expanded={revealed}
          >
            {card}
          </div>
        )
      })}
    </div>
  )

  return (
    // The outer element does the clipping, bled out by glowRoom on each side so
    // a revealed card's glow survives horizontally; the inner element is the
    // measured window that the scroll maths works against.
    <div
      className="pw-column"
      style={{ '--pw-glow-room': `${glowRoom}px` } as CSSProperties}
    >
      <div ref={windowRef} className="pw-column__window">
        <div ref={trackRef} className="pw-column__track">
          {Array.from({ length: COPIES }, (_, i) => renderSet(i))}
        </div>
      </div>
    </div>
  )
}
