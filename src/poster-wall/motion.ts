import type { ColumnMotion } from './types'

/**
 * Default per-column drift. Three things keep the columns from ever locking
 * together:
 *
 *   1. directions alternate, so the wall never reads as one sliding sheet;
 *   2. base speeds differ slightly — close enough to feel like one system, far
 *      enough apart that the columns don't pair up;
 *   3. each column's speed swells around its base on its own period and phase,
 *      so even two columns at the same rate drift apart over time.
 *
 * The periods are mutually non-harmonic, so the pattern doesn't visibly repeat.
 */
export const DEFAULT_MOTION: ColumnMotion[] = [
  { direction: -1, speed: 22, variance: { amplitude: 0.18, periodSec: 9, phase: 0 } },
  { direction: 1, speed: 25, variance: { amplitude: 0.16, periodSec: 11.5, phase: 2.1 } },
  { direction: -1, speed: 23, variance: { amplitude: 0.2, periodSec: 10.2, phase: 4.3 } },
  { direction: 1, speed: 21, variance: { amplitude: 0.17, periodSec: 12.4, phase: 1.2 } },
]

/** Cycle the motion table, nudging the phase so a reused entry isn't identical. */
export function motionFor(index: number, table: ColumnMotion[]): ColumnMotion {
  const base = table[index % table.length]
  const lap = Math.floor(index / table.length)
  if (lap === 0 || !base.variance) return base
  return {
    ...base,
    variance: { ...base.variance, phase: base.variance.phase + lap * 1.7 },
  }
}
