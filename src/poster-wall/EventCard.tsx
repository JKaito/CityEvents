import micUrl from './mic.svg'
import { formatPrice } from './format'
import type { PosterWallLabels } from './labels'
import type { PosterWallEvent } from './types'

interface Props {
  event: PosterWallEvent
  labels: PosterWallLabels
  /** When true the card shows its detail (amber) face. */
  revealed: boolean
}

/**
 * A poster card. The front is the artwork with the category badge; the back is
 * the amber detail panel. The wall flips a card only once it has come to rest
 * inside an edge of its column.
 *
 * Every measurement on the back face is `calc(N * var(--u))`, where N is the
 * design value in px and `--u` is one design pixel scaled to the card's actual
 * width. So the whole panel — type, leading, tracking, padding, radii, the
 * button, the glow — scales in proportion with the column instead of staying at
 * fixed px and overflowing. See poster-wall.css.
 *
 * The back carries everything except a long description, which belongs on a
 * detail page rather than a card.
 */
export function EventCard({ event, labels, revealed }: Props) {
  const crop = event.focal ? { objectPosition: event.focal } : undefined

  return (
    <div className="pw-card">
      <div className="pw-card__inner" data-flipped={revealed}>
        {/* ---------------- front ---------------- */}
        <div className="pw-card__face pw-card__face--front">
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            className="pw-card__art"
            style={crop}
          />
          <span className="pw-card__badge">{event.badge}</span>
        </div>

        {/* ---------------- back ----------------- */}
        {/* backface-visibility hides this visually but NOT from screen readers,
            so without aria-hidden every card announces its full detail text at
            all times. */}
        <div
          aria-hidden={!revealed}
          className="pw-card__face pw-card__face--back"
        >
          <div aria-hidden className="pw-card__echo">
            <img src={event.imageUrl} alt="" className="pw-card__art" style={crop} />
          </div>

          <div className="pw-card__body">
            <div className="pw-card__stack">
              {event.kicker && (
                <div className="pw-card__kicker">
                  <span className="pw-card__dot" />
                  <p className="pw-card__kicker-text">{event.kicker}</p>
                </div>
              )}

              <div className="pw-card__headline">
                <h3 className="pw-card__title">{event.title}</h3>
                <div className="pw-card__meta">
                  <p className="pw-card__when">
                    {event.dateLabel}
                    <span className="pw-card__sep"> · </span>
                    {event.time}
                  </p>
                  <p className="pw-card__where">{event.venue}</p>
                </div>
              </div>

              <div className="pw-card__rows">
                <div className="pw-card__row">
                  <p className="pw-card__label">{labels.organizer}</p>
                  <p className="pw-card__value">{event.organizer}</p>
                </div>
                {event.partners && event.partners.length > 0 && (
                  <div className="pw-card__row">
                    <p className="pw-card__label">{labels.partners}</p>
                    <div className="pw-card__values">
                      {event.partners.map((p) => (
                        <p key={p} className="pw-card__value">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price sits with the action rather than up among the detail rows —
                it is the last thing you want to know before committing. */}
            <div className="pw-card__footer">
              <span className="pw-card__cta">
                <img src={micUrl} alt="" className="pw-card__cta-icon" />
                <span className="pw-card__cta-text">{labels.book}</span>
              </span>
              <span className="pw-card__price">
                <span className="pw-card__price-label">{labels.price}</span>
                <span className="pw-card__price-value">
                  {formatPrice(event.price, labels)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
