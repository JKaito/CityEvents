/** Ticket price. Structured, so the "from" case is data rather than wording. */
export type EventPrice =
  | { kind: 'free' }
  | { kind: 'fixed'; amount: number }
  | { kind: 'from'; amount: number }

/**
 * One event, as the wall needs it.
 *
 * Everything here is display-ready. Formatting a raw API row into this shape
 * is the host app's job — the wall does no date maths and knows no locale
 * beyond the `labels` it is given.
 */
export interface PosterWallEvent {
  id: string
  title: string
  /** Category label shown on the poster, e.g. "ΘΕΑΤΡΟ". */
  badge: string
  /** Short urgency line, e.g. "ξεκινά σε 2 ημέρες". Optional. */
  kicker?: string
  /** e.g. "12 – 15 Σεπτεμβρίου 2026" */
  dateLabel: string
  /** e.g. "21:15" */
  time: string
  venue: string
  organizer: string
  partners?: string[]
  price: EventPrice
  /** Poster artwork. Any URL the host can serve. */
  imageUrl: string
  /** CSS object-position for the crop, e.g. "50% 35%". Defaults to centre. */
  focal?: string
  /** Where the card links to. Without it the card is not a link. */
  url?: string

  // --- used only by the compact fallback grid ---
  /** Abbreviated date for a small card, e.g. "12 – 15 ΣΕΠ". Falls back to dateLabel. */
  shortDate?: string
  /** Trimmed venue for a small card. Falls back to venue. */
  shortVenue?: string
}

/** Slow swell applied on top of a column's base speed. */
export interface SpeedVariance {
  /** Fraction of the base speed to swing by. 0.2 means ±20%. */
  amplitude: number
  /** Seconds for one full swing. */
  periodSec: number
  /** Radians. Offsets columns so they never breathe in unison. */
  phase: number
}

export interface ColumnMotion {
  direction: 1 | -1
  /** Base drift, px/second. */
  speed: number
  variance?: SpeedVariance
}
