import { useState } from 'react'
import './FilterChips.css'
import { FILTERS } from '../data/events'

export function FilterChips() {
  const [active, setActive] = useState('all')

  return (
    <div className="fc-row">
      {FILTERS.map((f) => {
        const isActive = f.id === active
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(f.id)}
            aria-pressed={isActive}
            className={isActive ? 'fc-chip fc-chip--active' : 'fc-chip'}
          >
            <span>{f.label}</span>
            <span className="fc-count">({f.count})</span>
          </button>
        )
      })}
    </div>
  )
}
