import { resolveTheme, SlidesPlayer } from '@atom63/slides'
import type { SlideDeckItem, SlideDeckMeta } from '@atom63/slides'
import Deck, { frontmatter } from './deck.mdx'

const deck: SlideDeckItem = {
  slug: 'deck',
  meta: frontmatter as unknown as SlideDeckMeta,
  content: Deck,
}

// Present-first: the deck boots straight into the player. The `theme:` line in
// deck.mdx frontmatter drives the look. Want to hand-nudge a slide in a GUI?
// See "Optional: in-app editor" in the README to swap in <DeckSurface>.
export function App() {
  return (
    <div data-slides-theme={resolveTheme(deck.meta)} style={{ height: '100vh', width: '100vw' }}>
      <SlidesPlayer deck={deck} onBack={() => {}} />
    </div>
  )
}
