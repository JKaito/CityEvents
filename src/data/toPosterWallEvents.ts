import type { PosterWallEvent } from '../poster-wall'
import { EVENTS, type CityEvent } from './events'

/**
 * Maps this app's event model onto the shape the poster wall wants.
 *
 * This is the whole integration boundary — the component knows nothing about
 * `CityEvent`, and this app keeps its own model. Any project dropping the wall
 * in writes its own version of this function.
 */
export function toPosterWallEvent(event: CityEvent): PosterWallEvent {
  return {
    id: event.id,
    title: event.title,
    badge: event.badge,
    kicker: event.kicker,
    dateLabel: event.dateLabel,
    time: event.time,
    venue: event.venue,
    organizer: event.organizer,
    partners: event.partners,
    price: event.price,
    imageUrl: event.image,
    focal: event.focal,
    shortDate: event.shortDate,
    shortVenue: event.shortVenue,
    url: `/events/${event.id}`,
  }
}

export const posterWallEvents: PosterWallEvent[] =
  Object.values(EVENTS).map(toPosterWallEvent)
