import type { PosterWallEvent } from './types'

export interface WallSlot {
  key: string
  event: PosterWallEvent
}

/**
 * The loop stacks three copies of a column and translates the track, which only
 * covers the window if one copy is at least as tall as the window. At the design
 * ratio a column window is ~1.6 card-pitches tall, so two cards would just about
 * do; three leaves margin and keeps a short list from looking obviously cycled.
 */
export const MIN_CARDS_PER_COLUMN = 3

/**
 * Deal an arbitrary list of events across the columns.
 *
 * Round-robin rather than chunking, so neighbouring columns show different
 * events and the same poster never sits at the same row in two columns.
 *
 * Columns shorter than MIN_CARDS_PER_COLUMN are padded by cycling their own
 * events — a wall fed three events still loops rather than showing a gap.
 */
export function distribute(
  events: PosterWallEvent[],
  columnCount: number,
): WallSlot[][] {
  const columns: WallSlot[][] = Array.from({ length: columnCount }, () => [])
  if (events.length === 0) return columns

  events.forEach((event, i) => {
    columns[i % columnCount].push({ key: `${event.id}-${i}`, event })
  })

  return columns.map((column, ci) => {
    // Fewer events than columns: this column got nothing, so give it the lot.
    const source = column.length > 0 ? column : events.map((event, i) => ({
      key: `${event.id}-fill-${ci}-${i}`,
      event,
    }))

    const out = [...source]
    let i = 0
    while (out.length < MIN_CARDS_PER_COLUMN) {
      const { event } = source[i % source.length]
      out.push({ key: `${event.id}-pad-${ci}-${i}`, event })
      i++
    }
    return out
  })
}
