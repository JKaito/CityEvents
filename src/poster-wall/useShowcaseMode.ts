import { useEffect, useState } from 'react'

export type ShowcaseMode = 'wall' | 'grid'

const QUERIES = {
  coarse: '(pointer: coarse)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const

/**
 * The wall depends on hover and on continuous motion. Three separate conditions
 * make it the wrong component, and all three want the same answer — the static
 * grid, where every card's information is already on the surface:
 *
 *   - narrow viewport   → the columns don't fit
 *   - coarse pointer    → no hover exists to trigger the reveal, at any width
 *   - reduced motion    → the drift is the whole point of the wall
 *
 * So the grid is not "the mobile version". It is the wall's fallback, and
 * mobile is one of the three ways you get there.
 *
 * Defaults to `grid` before mount, which is both the safe answer (no motion
 * until we know it is wanted) and the right one for server rendering.
 */
function evaluate(minWallWidth: number): ShowcaseMode {
  if (typeof window === 'undefined') return 'grid'
  const wide = window.matchMedia(`(min-width: ${minWallWidth}px)`).matches
  const coarse = window.matchMedia(QUERIES.coarse).matches
  const reduced = window.matchMedia(QUERIES.reduced).matches
  return wide && !coarse && !reduced ? 'wall' : 'grid'
}

export function useShowcaseMode(minWallWidth: number): ShowcaseMode {
  const [mode, setMode] = useState<ShowcaseMode>(() => evaluate(minWallWidth))

  useEffect(() => {
    const mqs = [
      window.matchMedia(`(min-width: ${minWallWidth}px)`),
      window.matchMedia(QUERIES.coarse),
      window.matchMedia(QUERIES.reduced),
    ]
    const onChange = () => setMode(evaluate(minWallWidth))
    mqs.forEach((mq) => mq.addEventListener('change', onChange))
    onChange()
    return () => mqs.forEach((mq) => mq.removeEventListener('change', onChange))
  }, [minWallWidth])

  return mode
}
