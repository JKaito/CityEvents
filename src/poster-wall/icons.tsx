/**
 * Pause and Play, traced from lucide.dev (ISC licensed) rather than pulled in as
 * a dependency — two glyphs do not justify a package, and a self-contained
 * folder is the point here. Same geometry, same look.
 */

const base = {
  width: 13,
  height: 13,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export function PauseIcon() {
  return (
    <svg {...base}>
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg {...base}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  )
}
