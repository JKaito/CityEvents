import { formatPrice } from './format'
import type { PosterWallLabels } from './labels'
import type { PosterWallEvent } from './types'

/**
 * The compact card. Everything it knows is visible: no hover, no reveal, no
 * hidden state. The whole card is one link where a URL exists, so a tap does
 * the one thing a tap on an event card ought to do.
 */
function GridCard({
  event,
  labels,
}: {
  event: PosterWallEvent
  labels: PosterWallLabels
}) {
  const crop = event.focal ? { objectPosition: event.focal } : undefined

  const body = (
    <>
      <div className="pw-gcard__art-wrap">
        <img
          src={event.imageUrl}
          alt=""
          loading="lazy"
          className="pw-gcard__art"
          style={crop}
        />
        <span className="pw-gcard__badge">{event.badge}</span>
      </div>

      <div className="pw-gcard__body">
        <div className="pw-gcard__row">
          <span className="pw-gcard__date">
            {event.shortDate ?? event.dateLabel}
          </span>
          <span className="pw-gcard__price">
            {formatPrice(event.price, labels)}
          </span>
        </div>
        <h3 className="pw-gcard__title">{event.title}</h3>
        <p className="pw-gcard__venue">{event.shortVenue ?? event.venue}</p>
      </div>
    </>
  )

  return event.url ? (
    <a className="pw-gcard" href={event.url}>
      {body}
    </a>
  ) : (
    <div className="pw-gcard">{body}</div>
  )
}

/**
 * Static, always-legible fallback for the poster wall. Not "the mobile version"
 * — see useShowcaseMode for the three conditions that land here.
 */
export function PosterGrid({
  events,
  labels,
}: {
  events: PosterWallEvent[]
  labels: PosterWallLabels
}) {
  return (
    <ul className="pw-grid">
      {events.map((event) => (
        <li key={event.id}>
          <GridCard event={event} labels={labels} />
        </li>
      ))}
    </ul>
  )
}
