import { DeckSurface } from '@atom63/slides/editor'
import '@atom63/slides/editor/styles'
import { useState } from 'react'
import deckRaw from './deck.mdx?raw'

// Dev-only: persist edits to src/deck.mdx via the deckWriteBackPlugin endpoint.
async function persist(next: string) {
  await fetch('/__write-deck', { method: 'POST', body: next })
}

export function App() {
  const [source, setSource] = useState(deckRaw)
  const editable = import.meta.env.DEV // edit only in dev; production = present-only
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <DeckSurface
        source={source}
        onChange={editable ? setSource : undefined}
        onSave={editable ? persist : undefined}
      />
    </div>
  )
}
