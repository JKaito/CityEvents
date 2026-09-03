/**
 * Every string the wall renders. Greek by default; pass a partial `labels` prop
 * to override. Kept in one object so adding a second language later is one
 * object to write, not a hunt through the JSX.
 */
export interface PosterWallLabels {
  organizer: string
  partners: string
  book: string
  price: string
  free: string
  /** Fixed price, e.g. (2) => "2 €" */
  fixed: (amount: number) => string
  /** Tiered price, e.g. (6) => "Από 6 €" */
  from: (amount: number) => string
  pause: string
  resume: string
  /** Accessible name for the whole section. */
  region: string
}

export const GREEK_LABELS: PosterWallLabels = {
  organizer: 'ΔΙΟΡΓΑΝΩΣΗ',
  partners: 'ΣΕ ΣΥΝΕΡΓΑΣΙΑ ΜΕ',
  book: 'ΚΡΑΤΗΣΕ ΘΕΣΗ',
  price: 'ΤΙΜΗ',
  free: 'Δωρεάν',
  fixed: (amount) => `${amount} €`,
  from: (amount) => `Από ${amount} €`,
  pause: 'Παύση κύλισης',
  resume: 'Συνέχεια κύλισης',
  region: 'Εκδηλώσεις',
}
