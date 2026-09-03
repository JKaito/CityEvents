import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { distribute } from './distribute'
import { PauseIcon, PlayIcon } from './icons'
import { GREEK_LABELS, type PosterWallLabels } from './labels'
import { DEFAULT_MOTION, motionFor } from './motion'
import { PosterGrid } from './PosterGrid'
import { ScrollColumn } from './ScrollColumn'
import type { ColumnMotion, PosterWallEvent } from './types'
import { useShowcaseMode } from './useShowcaseMode'

export interface PosterWallProps {
  /** The events to show. Fetch them however you like; this component never does. */
  events: PosterWallEvent[]
  /** How many columns the wall runs. Default 4. */
  columns?: number
  /** Per-column motion. Cycled (with a phase nudge) if shorter than `columns`. */
  motion?: ColumnMotion[]
  /** Override any of the Greek defaults. */
  labels?: Partial<PosterWallLabels>
  /** Below this viewport width the fallback grid is used. Default 1024. */
  minWallWidth?: number
  /** Room for a revealed card's glow: horizontal bleed and settle inset. Default 20. */
  glowRoom?: number
  /** Rendered at the start of the toolbar row, left of the pause control. */
  toolbar?: ReactNode
  /** Extra class on the root, for layout/spacing in the host page. */
  className?: string
  /** Extra inline style on the root — handy for overriding --pw-* tokens. */
  style?: CSSProperties
}

/**
 * Auto-scrolling poster wall with a settle-then-reveal interaction, plus a
 * static grid fallback for touch, narrow viewports and reduced motion.
 *
 * Presentational by design: hand it events, it renders them. See README.md.
 */
export function PosterWall({
  events,
  columns = 4,
  motion,
  labels: labelOverrides,
  minWallWidth = 1024,
  glowRoom = 20,
  toolbar,
  className,
  style,
}: PosterWallProps) {
  const mode = useShowcaseMode(minWallWidth)
  const [paused, setPaused] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)

  const labels = useMemo(
    () => ({ ...GREEK_LABELS, ...labelOverrides }),
    [labelOverrides],
  )

  const table = motion && motion.length > 0 ? motion : DEFAULT_MOTION
  const columnSlots = useMemo(
    () => distribute(events, Math.max(1, columns)),
    [events, columns],
  )

  // Tabbing would otherwise fire a settle animation per card against a still
  // drifting background. Any focus inside stops every column, so keyboard
  // traversal happens over a static wall and the focused card is the only thing
  // that moves.
  const frozen = paused || focusWithin

  if (events.length === 0) return null

  return (
    <section
      aria-label={labels.region}
      className={className ? `pw-root ${className}` : 'pw-root'}
      style={style}
    >
      <div className="pw-toolbar">
        <div className="pw-toolbar__start">{toolbar}</div>

        {/* WCAG 2.2.2 — motion running longer than five seconds needs a
            mechanism to stop it. Hover pausing one column is a side effect, not
            a control. Meaningless above a static grid, so wall-only. */}
        {mode === 'wall' && (
          <button
            type="button"
            className="pw-pause"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
            {paused ? labels.resume : labels.pause}
          </button>
        )}
      </div>

      {mode === 'wall' ? (
        // NOTE: the focus handlers live on the column grid, NOT on a wrapper
        // that also contains the pause button — otherwise clicking that button
        // focuses it, pins focusWithin true, and "resume" can never resume.
        <div
          className="pw-wall"
          style={{
            gridTemplateColumns: `repeat(${columnSlots.length}, minmax(0, 1fr))`,
          }}
          onFocus={() => setFocusWithin(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setFocusWithin(false)
            }
          }}
        >
          {columnSlots.map((slots, i) => (
            <ScrollColumn
              key={i}
              slots={slots}
              motion={motionFor(i, table)}
              frozen={frozen}
              labels={labels}
              glowRoom={glowRoom}
            />
          ))}
        </div>
      ) : (
        <PosterGrid events={events} labels={labels} />
      )}
    </section>
  )
}
