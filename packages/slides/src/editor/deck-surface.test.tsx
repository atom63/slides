/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentType } from 'react'
import { expect, test, vi } from 'vitest'
import * as compileMod from './compile-deck'
import { DeckSurface } from './deck-surface'

// SlidesPlayer relies on browser APIs (matchMedia, ResizeObserver, RAF) that
// jsdom does not implement. Stub it to render the compiled MDX content so the
// test can assert on rendered slide text without hitting missing browser APIs.
vi.mock('../player/slides-player', () => ({
  SlidesPlayer: ({ deck }: { deck: { content?: ComponentType } }) => {
    const Content = deck.content
    return <div data-testid="slides-player">{Content ? <Content /> : null}</div>
  },
}))

const SRC = `---
title: "T"
---

import { CoverSlide } from "@atom63/slides";

<CoverSlide eyebrow="2026" title="Hello" />
`

test('present-only when no onChange: renders preview, no edit chrome', async () => {
  render(<DeckSurface source={SRC} />)
  await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument())
  expect(screen.queryByLabelText('Deck MDX source')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
})

test('with onChange: e enters Edit (textarea shown), Esc returns to Present', async () => {
  const onChange = vi.fn()
  render(<DeckSurface source={SRC} onChange={onChange} />)
  expect(screen.queryByLabelText('Deck MDX source')).not.toBeInTheDocument()
  fireEvent.keyDown(window, { key: 'e' })
  expect(await screen.findByLabelText('Deck MDX source')).toBeInTheDocument()
  fireEvent.keyDown(window, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByLabelText('Deck MDX source')).not.toBeInTheDocument())
})

test('editing the textarea calls onChange', async () => {
  const onChange = vi.fn()
  render(<DeckSurface source={SRC} onChange={onChange} initialMode="edit" />)
  const ta = await screen.findByLabelText('Deck MDX source')
  fireEvent.change(ta, { target: { value: `${SRC}\n<!-- x -->` } })
  expect(onChange).toHaveBeenCalled()
})

test('Cmd/Ctrl-S in edit mode calls onSave with current source', async () => {
  const onSave = vi.fn()
  render(<DeckSurface source={SRC} onChange={() => {}} onSave={onSave} initialMode="edit" />)
  const ta = await screen.findByLabelText('Deck MDX source')
  fireEvent.keyDown(ta, { key: 's', metaKey: true })
  expect(onSave).toHaveBeenCalledWith(SRC)
})

test('Save button absent when onSave not provided', async () => {
  render(<DeckSurface source={SRC} onChange={() => {}} initialMode="edit" />)
  await screen.findByLabelText('Deck MDX source')
  expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
})

test('keeps last good preview and shows error banner when source becomes invalid', async () => {
  const onChange = vi.fn()
  const { rerender } = render(
    <DeckSurface source={SRC} onChange={onChange} initialMode="edit" debounceMs={0} />
  )
  await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument())
  // Break the MDX (unterminated JSX attribute expression).
  const broken = `---\ntitle: "T"\n---\n\n<CoverSlide title={`
  rerender(<DeckSurface source={broken} onChange={onChange} initialMode="edit" debounceMs={0} />)
  // error banner appears…
  await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  // …and the last good preview ("Hello") is still shown
  expect(screen.getByText('Hello')).toBeInTheDocument()
})

test('switching Present→Edit does not trigger a recompile (shared compile)', async () => {
  const spy = vi.spyOn(compileMod, 'compileDeck')
  const onChange = vi.fn()
  render(<DeckSurface source={SRC} onChange={onChange} debounceMs={0} />)
  await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument())
  const callsAfterCompile = spy.mock.calls.length
  fireEvent.keyDown(window, { key: 'e' }) // → edit mode
  await screen.findByLabelText('Deck MDX source')
  expect(spy.mock.calls.length).toBe(callsAfterCompile) // mode switch alone caused no new compile
  spy.mockRestore()
})
