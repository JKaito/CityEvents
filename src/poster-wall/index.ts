// Styles ship with the component so a consumer needs one import, not two.
// If your build cannot import CSS from JS, delete this line and include
// poster-wall.css yourself.
import './poster-wall.css'

export { PosterWall } from './PosterWall'
export { DEFAULT_MOTION } from './motion'
export type { PosterWallProps } from './PosterWall'

export { GREEK_LABELS } from './labels'
export type { PosterWallLabels } from './labels'

export { formatPrice } from './format'

export type {
  PosterWallEvent,
  EventPrice,
  ColumnMotion,
  SpeedVariance,
} from './types'
