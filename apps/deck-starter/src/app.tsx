import { resolveTheme, SlidesPlayer } from '@atom63/slides'
import type { SlideDeckItem, SlideDeckMeta } from '@atom63/slides'
import Deck, { frontmatter } from './deck.mdx'

const deck: SlideDeckItem = {
  slug: 'deck',
  meta: frontmatter as unknown as SlideDeckMeta,
  content: Deck,
}

// Present-first reference app: boots straight into the player. The `theme:` line
// in deck.mdx frontmatter drives the look. The optional in-app editor (DeckSurface
// from '@atom63/slides/editor') is documented in the create-deck starter README.
export function App() {
  return (
    <div data-slides-theme={resolveTheme(deck.meta)} style={{ height: '100vh', width: '100vw' }}>
      <SlidesPlayer deck={deck} onBack={() => {}} />
    </div>
  )
}
