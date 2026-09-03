# Poster wall

Auto-scrolling wall of event posters. Hovering a card stops its column, glides
the card to rest inside the nearest edge, and only then flips it to reveal the
event details. Falls back to a static grid on touch, narrow viewports and
reduced motion.

Self-contained: **no dependencies** beyond React. Copy the whole `poster-wall/`
folder into your project.

## Use

```tsx
import { PosterWall, type PosterWallEvent } from './poster-wall'

const events: PosterWallEvent[] = /* mapped from your API */

<PosterWall events={events} />
```

That's the whole integration. The component **never fetches** — you own the
request, the loading state, the errors and the caching. Hand it an array.

```tsx
function EventsSection() {
  const { data } = useQuery({ queryKey: ['events'], queryFn: fetchEvents })
  if (!data) return <Skeleton />
  return <PosterWall events={data.map(toPosterWallEvent)} />
}
```

## The event shape

```ts
interface PosterWallEvent {
  id: string
  title: string
  badge: string        // category label on the poster, e.g. "ΘΕΑΤΡΟ"
  kicker?: string      // urgency line, e.g. "ξεκινά σε 2 ημέρες"
  dateLabel: string    // "12 – 15 Σεπτεμβρίου 2026"
  time: string         // "21:15"
  venue: string
  organizer: string
  partners?: string[]
  price: { kind: 'free' } | { kind: 'fixed', amount: number } | { kind: 'from', amount: number }
  imageUrl: string
  focal?: string       // object-position for the crop, e.g. "50% 35%"
  url?: string         // card becomes a link when present
  shortDate?: string   // grid fallback only; falls back to dateLabel
  shortVenue?: string  // grid fallback only; falls back to venue
}
```

Everything is **display-ready**. The component does no date maths and knows no
locale — write one `toPosterWallEvent(row)` function to map your API rows, and
keep formatting on your side where it can be tested.

`price` is the exception, and deliberately so: it is structured because "from
6 €" is a fact about the event's ticketing, not a wording choice. The component
renders it through `labels`.

## Props

| Prop | Default | |
|---|---|---|
| `events` | — | required |
| `columns` | `4` | Cards are dealt round-robin, so no event repeats within a row |
| `motion` | `DEFAULT_MOTION` | Per-column direction, speed and swell. Cycled with a phase nudge if shorter than `columns` |
| `labels` | Greek | Partial override of any string |
| `minWallWidth` | `1024` | Below this the grid is used |
| `glowRoom` | `20` | Room for the revealed card's glow |
| `toolbar` | — | Rendered left of the pause control, on the same row |
| `className` / `style` | — | On the root |

The `toolbar` slot exists so your filters sit on the same row as the pause
button without the wall having to know what filtering means:

```tsx
<PosterWall events={events} toolbar={<CategoryFilters />} />
```

## Theming

Override the custom properties on `.pw-root` from your own CSS:

```css
.pw-root {
  --pw-ink: #0c1b33;
  --pw-accent: #fdb518;
  --pw-accent-deep: #ee9222;
  --pw-muted: #454f5e;
  --pw-font-display: 'Outfit', sans-serif;
  --pw-font-body: 'Manrope', sans-serif;
  --pw-gap: 20px;
  --pw-radius: 14px;
  --pw-card-back: linear-gradient(...);   /* the amber detail face */
}
```

All class names are namespaced `pw-` and scoped under `.pw-root`, so nothing
collides with your styles in either direction.

**Fonts are not loaded by the component** — a component should not inject
`<link>` tags. Load Outfit and Manrope in your document, or point the two font
properties at your own. The stacks fall back to the system UI font, so nothing
breaks if you do neither.

## How it behaves

**Drift.** Columns alternate direction at slightly different speeds, each
swelling around its base on its own non-harmonic period, so they never lock into
step. The loop stacks three copies of each column and wraps by exactly one set
height — a pixel-identical frame, so there is no seam.

**Settle, then reveal.** Hover stops that column, glides the card to rest
`glowRoom` inside the nearest edge (top if the card's centre is in the upper
half, otherwise bottom), and flips it only once it has landed. Information
appears on a card that is already at rest and fully visible.

**The grid is not "the mobile version".** It is the fallback, and there are
three ways to reach it: viewport under `minWallWidth`, a coarse pointer at any
width, or `prefers-reduced-motion`. A touch laptop gets the grid however wide
its screen — a device that cannot hover cannot use the wall. The wall's rAF loop
never mounts when the grid is showing.

## Accessibility

- A pause control (WCAG 2.2.2), since the drift runs indefinitely.
- Any focus inside freezes **every** column, so tabbing happens over a static
  wall rather than firing a settle per card against moving background.
- The hidden card face is `aria-hidden` until revealed — `backface-visibility`
  hides it visually but not from screen readers.
- Cards with a `url` render as real links.
- Loop copies 2 and 3 are `aria-hidden` and out of the tab order.
- Drift suspends when the tab is hidden or the wall scrolls out of view; frame
  deltas are clamped so a backgrounded tab cannot fast-forward it.

## Notes

- `mic.svg` is imported as a URL, which Vite, CRA and webpack 5 all handle. If
  your bundler doesn't, inline it or swap the `<img>` in `EventCard.tsx`.
- Uses container queries and `color-mix()` — both broadly supported since 2023.
- Not tested under SSR. `useShowcaseMode` returns `grid` before mount, so an SSR
  host would render the grid and swap to the wall on hydration.
