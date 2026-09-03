import epitheorisiImg from '../assets/events/epitheorisi.jpg'
import familyFestivalImg from '../assets/events/family-festival.jpg'
import sanStarImg from '../assets/events/san-star-cinema.jpg'
import kinitoMousikoImg from '../assets/events/kinito-mousiko.jpg'
import singerLeavesImg from '../assets/events/singer-leaves.jpg'
import umbrellasImg from '../assets/events/umbrellas.jpg'
import redDancersImg from '../assets/events/red-dancers.jpg'

export type Category =
  | 'Συναυλίες'
  | 'Θέατρο'
  | 'Παιδικά'
  | 'Εκθέσεις'
  | 'Αθλητικά'

/**
 * Ticket price. Stored structured rather than as a display string, because
 * "from" is a property of the event (tiered tickets), not a formatting choice —
 * and because the see-all band promises filtering by price, which a
 * pre-formatted string cannot support.
 */
export type EventPrice =
  | { kind: 'free' }
  | { kind: 'fixed'; amount: number }
  | { kind: 'from'; amount: number }

export interface CityEvent {
  id: string
  title: string
  /** Short urgency line shown above the title, e.g. "ξεκινά σε 2 ημέρες". */
  kicker?: string
  /** Date only. The time lives in `time` so the two can be laid out apart. */
  dateLabel: string
  /** Start time, "21:15". Multi-day events carry their headline start. */
  time: string
  venue: string
  organizer: string
  partners?: string[]
  /** Drives filtering. */
  category: Category
  /** Display form of the category, e.g. "ΘΕΑΤΡΟ". Shown on both card faces. */
  badge: string
  price: EventPrice
  image: string
  /** CSS object-position — the 16:9 sources are cropped hard by the portrait cards. */
  focal?: string

  // --- compact fields, used by the mobile / reduced-motion grid card ---
  /** Abbreviated date for a 165px card, e.g. "7 – 13 ΣΕΠ". */
  shortDate: string
  /** Trimmed venue for a 165px card; falls back to `venue`. */
  shortVenue?: string
}

export const EVENTS: Record<string, CityEvent> = {
  epitheorisi: {
    id: 'epitheorisi',
    title: 'Η επιθεώρηση «Εγώ θα σας τα πω!» στο Θέατρο Άλσους',
    kicker: 'ξεκινά σε 2 ημέρες',
    dateLabel: '12 – 15 Σεπτεμβρίου 2026',
    time: '21:15',
    venue: 'Θέατρο Άλσους «Μελίνα Μερκούρη»',
    organizer: 'ΚΕΠΑ Δήμου Βέροιας',
    partners: ['Θεατρική Ομάδα Βέροιας', 'Σύλλογος Φίλων Θεάτρου'],
    category: 'Θέατρο',
    badge: 'ΘΕΑΤΡΟ',
    price: { kind: 'from', amount: 6 },
    image: epitheorisiImg,
    focal: '50% 50%',
    shortDate: '12 – 15 ΣΕΠ',
    shortVenue: 'Θέατρο Άλσους',
  },
  familyFestival: {
    id: 'familyFestival',
    title: '3ο Veria Family Festival',
    kicker: 'σε εξέλιξη',
    dateLabel: '7 – 13 Σεπτεμβρίου 2026',
    time: '18:00',
    venue: '4 χώροι σε όλη την πόλη',
    organizer: 'Κ.Ε.Π.Α. Δήμου Βέροιας',
    partners: ['Δημοτική Κοινότητα Βέροιας'],
    category: 'Παιδικά',
    badge: 'ΦΕΣΤΙΒΑΛ',
    price: { kind: 'from', amount: 6 },
    image: familyFestivalImg,
    focal: '50% 50%',
    shortDate: '7 – 13 ΣΕΠ',
    shortVenue: '4 χώροι στη Βέροια',
  },
  sanStar: {
    id: 'sanStar',
    title: 'Σαν σταρ του θερινού σινεμά',
    kicker: 'εισιτήριο 2 €',
    dateLabel: '6 – 12 Αυγούστου 2026',
    time: '21:30',
    venue: 'Θερινός Κινηματογράφος Στάρ',
    organizer: 'Κ.Ε.Π.Α. Δήμου Βέροιας',
    category: 'Εκθέσεις',
    badge: 'ΣΙΝΕΜΑ',
    price: { kind: 'fixed', amount: 2 },
    image: sanStarImg,
    focal: '50% 50%',
    shortDate: '9 – 11 ΣΕΠ',
    shortVenue: 'Θερινό σινεμά ΚΕΠΑ',
  },
  kinitoMousiko: {
    id: 'kinitoMousiko',
    title: 'Κινητό Μουσικό Περίπτερο',
    kicker: 'κάθε Σάββατο',
    dateLabel: 'Αύγουστος – Σεπτέμβριος 2026',
    time: '21:00',
    venue: 'Πλατεία Ωρολογίου',
    organizer: 'Κ.Ε.Π.Α. Δήμου Βέροιας',
    category: 'Συναυλίες',
    badge: 'ΜΟΥΣΙΚΗ',
    price: { kind: 'free' },
    image: kinitoMousikoImg,
    focal: '50% 50%',
    shortDate: 'ΠΕΜ 17 ΣΕΠ',
    shortVenue: 'Τσούπελη',
  },
  singerLeaves: {
    id: 'singerLeaves',
    title: 'Φθινοπωρινή συναυλία της Δημοτικής Φιλαρμονικής',
    kicker: 'ξεκινά σε 5 ημέρες',
    dateLabel: 'Παρασκευή 3 Σεπτεμβρίου 2026',
    time: '20:30',
    venue: 'Χώρος Τεχνών Δήμου Βέροιας',
    organizer: 'Δημοτική Φιλαρμονική Βέροιας',
    partners: ['ΚΕΠΑ Δήμου Βέροιας'],
    category: 'Συναυλίες',
    badge: 'ΣΥΝΑΥΛΙΑ',
    price: { kind: 'from', amount: 6 },
    image: singerLeavesImg,
    focal: '50% 35%',
    shortDate: 'ΠΑΡ 18 ΣΕΠ',
    shortVenue: 'Πλατεία Ωρολογίου',
  },
  umbrellas: {
    id: 'umbrellas',
    title: 'Παράσταση δρόμου με ομπρέλες',
    kicker: 'ελεύθερη είσοδος',
    dateLabel: 'Τετάρτη 1 Σεπτεμβρίου 2026',
    time: '21:00',
    venue: 'Πλατεία Ελιάς',
    organizer: 'ΚΕΠΑ Δήμου Βέροιας',
    category: 'Παιδικά',
    badge: 'ΠΑΙΔΙΚΑ',
    price: { kind: 'free' },
    image: umbrellasImg,
    focal: '50% 40%',
    shortDate: 'ΤΕΤ 1 ΣΕΠ',
    shortVenue: 'Πλατεία Ελιάς',
  },
  redDancers: {
    id: 'redDancers',
    title: 'Παραδοσιακοί χοροί παιδικών τμημάτων',
    kicker: 'ξεκινά σε 4 ημέρες',
    dateLabel: 'Παρασκευή 3 Σεπτεμβρίου 2026',
    time: '19:00',
    venue: 'Θέατρο Άλσους «Μελίνα Μερκούρη»',
    organizer: 'Λύκειο Ελληνίδων Βέροιας',
    partners: ['ΚΕΠΑ Δήμου Βέροιας'],
    category: 'Θέατρο',
    badge: 'ΠΑΙΔΙΚΑ',
    price: { kind: 'free' },
    image: redDancersImg,
    focal: '50% 45%',
    shortDate: 'ΣΑΒ 12 ΣΕΠ',
    shortVenue: 'Χώρος Τεχνών',
  },
}

export const FILTERS: { label: string; count: number; id: string }[] = [
  { id: 'all', label: 'Όλες', count: 18 },
  { id: 'music', label: 'Συναυλίες', count: 6 },
  { id: 'theatre', label: 'Θέατρο', count: 3 },
  { id: 'kids', label: 'Παιδικά', count: 4 },
  { id: 'expo', label: 'Εκθέσεις', count: 3 },
  { id: 'sport', label: 'Αθλητικά', count: 2 },
]
