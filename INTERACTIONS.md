# CityEvents — interaction spec

Behaviour that the Figma file cannot express. This file is the source of truth
for motion; treat it with the same authority as the design frames.

Node ids throughout (`1:511`, `1:537`, …) refer to the source design file,
which is not linked here.

---

## 1. Two presentations, one section

The events section renders as **one of two structurally different components**,
chosen by `useShowcaseMode`:

| Condition | Why the wall is wrong | Result |
|---|---|---|
| viewport < 1024px | the columns don't fit | grid |
| `pointer: coarse` | no hover exists to trigger the reveal, at any width | grid |
| `prefers-reduced-motion` | the drift is the whole point of the wall | grid |
| otherwise | — | wall |

The grid is **not "the mobile version"**. It is the wall's fallback, and mobile
is one of three ways you reach it. Consequences worth keeping in mind:

- The wall's rAF loop never mounts while the grid is showing.
- A touch laptop gets the grid however wide its screen is — a device that
  cannot hover cannot use the wall.
- There is no tap-to-flip fallback inside the wall. Touch users get the grid,
  where nothing is hidden in the first place.

---

## 2. Poster wall — desktop, fine pointer, motion allowed

**Where:** `src/poster-wall/`
**Figma:** node `1:537` (four 405px columns, 20px gaps, column window 1031px).

**Column count is a prop.** `<PosterWall columns={4} />`; the events are
dealt round-robin across that many columns by `distribute()`, so no event
repeats within a row and any length of event list works. Per-column motion
comes from `DEFAULT_MOTION`, cycled with a phase nudge if there are more
columns than entries.

Cards keep their 405:615 proportions whatever the count, so fewer columns means
proportionally larger cards *and* a proportionally taller section at the same
container width — at 1680px, four columns give the design's 405px cards, three
give ~547px cards and a section about 1.35x taller.

**Deviation from the Figma frame, agreed with the designer:** the frame mixes
615px "tall" and 396px "short" cards. Every wall card here is a uniform
**405x615**. The column window stays at **1031px** — deliberately *not* a whole
multiple of the card pitch (615 + 20), so a second card is always part-visible.
That partial card is what makes the top/bottom edge choice below a real
decision rather than a fixed two-slot layout.

### Drift

- Each column drifts vertically and continuously, looping seamlessly.
- Neighbouring columns move in **opposite** directions so the wall never reads
  as one sliding sheet. Current assignment (`PosterWall.tsx`):

  | Column | Direction | Base speed | Swell | Period |
  |--------|-----------|-----------|-------|--------|
  | 1 | down | 22 px/s | ±18% | 9.0s |
  | 2 | up   | 25 px/s | ±16% | 11.5s |
  | 3 | down | 23 px/s | ±20% | 10.2s |
  | 4 | up   | 21 px/s | ±17% | 12.4s |

- Three separate things keep the columns from locking together: alternating
  directions, slightly different base speeds (close enough to feel like one
  system, far enough apart not to pair up), and a slow sinusoidal **swell**
  around each base on its own period and phase. The periods are mutually
  non-harmonic, so the combined pattern does not visibly repeat.
- The swell is driven by absolute time, not accumulated delta, so pausing and
  resuming never strands a column at the top or bottom of its swing.
- The loop stacks **three** identical copies of the card set and translates the
  track. Wrapping shifts by exactly one set height, landing on a
  pixel-identical frame — no visible seam.

### Hover: settle, then reveal

This is the part that is invisible in the static design.

1. Pointer enters a card → that column's drift **stops immediately**.
2. The column **glides** so the hovered card comes to rest just inside one edge
   of the column window — `GLOW_ROOM` (20px) in from it, not flush against it,
   so the card's glow stays within the clip:
   - card's centre currently in the **upper** half of the window → align its
     **top** edge to the window top;
   - otherwise → align its **bottom** edge to the window bottom.
   - Duration 460ms, `easeOutCubic`.
3. **Only once it has landed** does the card flip to its detail face — the
   amber `Back_View`. Flip is 620ms `cubic-bezier(0.22, 1, 0.36, 1)`.

   The back carries everything about the event **except the description**,
   which is too long for a card and belongs on the detail page: category badge
   and urgency line, title, date · time, venue, ΔΙΟΡΓΑΝΩΣΗ, ΣΕ ΣΥΝΕΡΓΑΣΙΑ ΜΕ,
   then the booking button with the price beside it. Price sits with the action
   rather than up among the detail rows — it is the last thing you want to know
   before committing.

   The sequencing matters: information appears on a card that is already at
   rest and fully visible, never on one still in motion or half cropped.

4. Pointer leaves → the card flips back and the column resumes drifting from
   wherever it stopped. It does **not** jump back to where it would have been.

If the pointer moves to another card before the settle finishes, the first card
never reveals — the reveal is bound to the card still under the pointer.

Only the hovered column stops; the other three keep drifting. *(Still open —
see section 6.)*

### Clipping and the card glow

A revealed card carries a `0 0 16px` amber glow, and the column has to clip its
track or the loop falls apart. One constant — `GLOW_ROOM = 20px` in
`ScrollColumn` — gives that glow room, but it has to be applied differently on
each axis:

- **Horizontally**, the clipping element is *bled out* by `GLOW_ROOM` (negative
  margin plus equal padding), so the glow spills past the column edge. The
  clipper sits outside the measured window, so the scroll maths is unaffected.
- **Vertically**, bleeding is not an option — it would expose partial cards
  above and below the window and ruin the loop's clean edge. Instead a settled
  card comes to rest `GLOW_ROOM` *inside* the edge (`edgeInset` in
  `useAutoScroll`), which keeps its glow within the clip.

So a settled card is deliberately **not** flush with the window edge. Cards
entering and leaving during normal drift are still hard-clipped, which is what
makes the window read as a window.

### Accessibility

- **Pause control** (WCAG 2.2.2). Motion running longer than five seconds needs
  a mechanism to stop it. Hover pausing a single column is a side effect, not a
  control — so the section carries an explicit "Παύση κύλισης" toggle, with a
  Pause/Play icon that swaps with the state. The icon is `aria-hidden`; the
  label carries the meaning.
- **Focus freezes the whole wall.** Any focus inside stops every column, so
  tabbing happens over a static wall and the focused card is the only thing
  that moves. Without this, tabbing through 16 cards fired 16 settle animations
  against a still-drifting background.
- **Focus otherwise behaves like hover:** settle, then reveal.
- **The hidden face is `aria-hidden` when not revealed.**
  `backface-visibility: hidden` hides it visually but *not* from screen
  readers; without this, every card announced its full detail text at all times.
- Front artwork is `alt=""` — decorative, since the card wrapper carries the
  label.
- Copies 2 and 3 of each set are `aria-hidden` and out of the tab order.
- Drift suspends while the tab is hidden (`visibilitychange`) and while the wall
  is scrolled out of view (`IntersectionObserver`, 200px margin).
- Frame deltas are clamped to 50ms so a backgrounded tab cannot fast-forward
  the columns on return.

---

## 3. Poster grid — the fallback

**Where:** `src/poster-wall/PosterGrid.tsx`
**Figma:** node `1:905` — 2 columns at 383px, cards 165x326, 13px gaps.

Static. No motion, no reveal, no hidden state. Each card is **one link**, so a
tap does the one thing a tap on an event card ought to do.

Every card shows: category badge on the poster, then short date, price, title
(clamped to 2 lines) and venue. Kicker, organiser, partners and the booking CTA
are deliberately dropped — they belong on the event detail page, not on a 165px
card. This is what the extra `badge` / `shortDate` / `price` / `shortVenue`
fields on `CityEvent` are for.

Columns: 2, then 3 at `sm`, then 4 at `lg` (a wide viewport reaches the grid
only via coarse pointer or reduced motion).

### Why not a carousel

Considered and rejected. A carousel trades hidden-behind-hover for
hidden-behind-swipe, and this section's job is browsing a filterable set of 18
events — burying items 3 and beyond defeats it. A horizontal scroller mid-page
also competes with vertical scrolling on a 4300px page, and it is among the
hardest patterns to make accessible. A carousel would earn its place in the
**Featured** block if that ever holds 3–4 events: small, ordered, one at a time
is the point there.

---

## 4. Tunables

- `motion.ts` → `DEFAULT_MOTION` (direction, speed and swell per column)
- `ScrollColumn.tsx` → `GAP`, `GLOW_ROOM` (horizontal bleed *and* settle inset)
- `index.css` → `--u` on `.flip-scene`, one design pixel relative to the card's
  real width. Every measurement on the card's back face is `calc(N * var(--u))`
  with N taken straight from Figma, so the panel scales with the column instead
  of overflowing when it is narrower than 405px. Raise the `min()` cap to let
  the card scale *up* past its design size.
- `useAutoScroll.ts` → `SETTLE_MS` (460), easing, `COPIES` (3)
- `useShowcaseMode.ts` → the three fallback queries
- `index.css` → `.flip-inner` transition (flip duration/easing)

---

## 5. Not yet built

- Filter chips set local state only; they do not filter the events yet.
- The wall is fed seven fixed demo events. Nothing fetches.

The rest of the landing page — nav, hero, featured event, week calendar,
see-all band, footer — was built and then removed when this repo was cut down
to the poster wall alone. It is in the git history if it is ever wanted back;
the Figma nodes are `1:511` (desktop) and `1:796` (mobile).

---

## 6. Open questions for the designer

1. When one column is hovered, should the other three keep drifting, slow down,
   or stop as well?
2. Is the reveal a **flip** (assumed here, from the `Back_View` node name) or a
   cross-fade / expand?
3. Should a card that is only partially visible be allowed to trigger a reveal,
   or be ignored until more of it is on screen? (Sharper now that every card is
   615px and the peek is 416px.)

**Answered:** a settled card rests `GLOW_ROOM` inside the window edge rather
than flush against it, so its glow is not clipped. See "Clipping and the card
glow" above.
