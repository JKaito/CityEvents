import type { PosterWallLabels } from './labels'
import type { EventPrice } from './types'

export function formatPrice(price: EventPrice, labels: PosterWallLabels): string {
  switch (price.kind) {
    case 'free':
      return labels.free
    case 'fixed':
      return labels.fixed(price.amount)
    case 'from':
      return labels.from(price.amount)
  }
}
