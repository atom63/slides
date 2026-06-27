import { SlidesPlayer } from '@atom63/slides'
import type { SlideDeckItem, SlideDeckMeta } from '@atom63/slides'
import Deck, { frontmatter } from './deck.mdx'

const deck: SlideDeckItem = {
  slug: 'starter',
  meta: frontmatter as unknown as SlideDeckMeta,
  content: Deck,
}

export function App() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <SlidesPlayer deck={deck} onBack={() => {}} />
    </div>
  )
}
