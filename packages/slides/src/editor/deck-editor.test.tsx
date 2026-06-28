/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { DeckEditor } from './deck-editor'

// SlidesPlayer needs browser APIs jsdom lacks; stub it (same pattern as deck-surface.test.tsx).
vi.mock('../player/slides-player', () => ({
  SlidesPlayer: () => <div data-testid="slides-player" />,
}))

test('DeckEditor renders the edit two-pane (source textarea) by default', async () => {
  render(<DeckEditor source={'---\ntitle: T\n---\n\n# Hi'} onChange={() => {}} />)
  expect(await screen.findByLabelText('Deck MDX source')).toBeInTheDocument()
})
