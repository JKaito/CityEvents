import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './showcase.css'
import { PosterWall } from './poster-wall'
import { posterWallEvents } from './data/toPosterWallEvents'
import { FilterChips } from './components/FilterChips'

/**
 * Standalone showcase — the filter row and the poster wall, nothing else.
 *
 * A separate Vite entry (see vite.config.ts), so it deploys as its own static
 * page while still rendering the real component rather than a copy that drifts.
 */
function Showcase() {
  return (
    <div className="sc-page">
      <div className="sc-shell">
        <PosterWall events={posterWallEvents} toolbar={<FilterChips />} />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Showcase />
  </StrictMode>,
)
