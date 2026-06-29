import { expect, test } from 'vitest'
import { joinBlocks, splitBlocks } from './slide-blocks'

const DECK = `---
title: "T"
---

import { CoverSlide } from "@atom63/slides";

<CoverSlide title="Hello" />

---

## Markdown slide

- a
- b

---

<StatBento title="Nums" />
`

test('split→join reproduces the source byte-for-byte', () => {
  expect(joinBlocks(splitBlocks(DECK))).toBe(DECK)
})

test('three content slides are identified', () => {
  expect(splitBlocks(DECK).filter(b => b.kind === 'slide').length).toBe(3)
})

test('--- inside fenced code is not a separator', () => {
  const src = '<X />\n\n---\n\n```md\n---\nnot a slide\n---\n```\n'
  const blocks = splitBlocks(src)
  expect(joinBlocks(blocks)).toBe(src)
  expect(blocks.filter(b => b.kind === 'slide').length).toBe(2)
})

test('no frontmatter, single slide', () => {
  const src = '<Cover title="x" />\n'
  const blocks = splitBlocks(src)
  expect(joinBlocks(blocks)).toBe(src)
  expect(blocks.filter(b => b.kind === 'slide').length).toBe(1)
})

// Edge cases

test('trailing separator does not produce an empty phantom slide', () => {
  // A deck ending with --- (no trailing content) should have separator at end
  // and no empty slide after it.
  const src = '<A />\n\n---\n\n<B />\n\n---\n'
  const blocks = splitBlocks(src)
  expect(joinBlocks(blocks)).toBe(src)
  const slides = blocks.filter(b => b.kind === 'slide')
  // Two real slides; the trailing --- is a separator with no following slide
  expect(slides.length).toBe(2)
})

test('tilde fenced code block also shields --- separators', () => {
  const src = '<X />\n\n---\n\n~~~\n---\n~~~\n'
  const blocks = splitBlocks(src)
  expect(joinBlocks(blocks)).toBe(src)
  expect(blocks.filter(b => b.kind === 'slide').length).toBe(2)
})

test('multiple consecutive separators each become their own separator block', () => {
  const src = '<A />\n\n---\n\n---\n\n<B />\n'
  const blocks = splitBlocks(src)
  expect(joinBlocks(blocks)).toBe(src)
  expect(blocks.filter(b => b.kind === 'separator').length).toBe(2)
})
