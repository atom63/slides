import { expect, test } from 'vitest'
import { getSlideBlock, setSlideProp, slideBlockIndices, switchSlideTemplate } from './slide-edit'
import { joinBlocks, splitBlocks } from './slide-blocks'

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** Two-slide deck with a frontmatter block. */
const TWO_SLIDE = `---
title: T
---

<CoverSlide title="Hello" eyebrow="2026" />

---

<StatBento title="Nums" />
`

/** Single-slide deck without frontmatter. */
const SINGLE = `<CoverSlide title="Solo" />\n`

/** Deck with an empty block between two separators (not a rendered slide). */
const WITH_EMPTY = `<CoverSlide title="A" />

---

---

<CoverSlide title="B" />
`

// ── slideBlockIndices ─────────────────────────────────────────────────────────

test('slideBlockIndices returns one index per non-empty slide block', () => {
  const indices = slideBlockIndices(TWO_SLIDE)
  expect(indices).toHaveLength(2)
})

test('slideBlockIndices skips empty slide blocks between adjacent separators', () => {
  const indices = slideBlockIndices(WITH_EMPTY)
  // Two real slides; the empty block between the two --- is skipped.
  expect(indices).toHaveLength(2)
})

test('slideBlockIndices returns block indices into splitBlocks output', () => {
  const indices = slideBlockIndices(TWO_SLIDE)
  const blocks = splitBlocks(TWO_SLIDE)
  for (const i of indices) {
    const block = blocks.find(b => b.index === i)
    expect(block).toBeDefined()
    expect(block!.kind).toBe('slide')
    expect(block!.text.trim()).not.toBe('')
  }
})

// ── getSlideBlock ─────────────────────────────────────────────────────────────

test('getSlideBlock(source, 0) returns the first rendered slide', () => {
  const result = getSlideBlock(TWO_SLIDE, 0)
  expect(result).not.toBeNull()
  expect(result!.text).toContain('CoverSlide')
  expect(result!.text).toContain('Hello')
})

test('getSlideBlock(source, 1) returns the second rendered slide', () => {
  const result = getSlideBlock(TWO_SLIDE, 1)
  expect(result).not.toBeNull()
  expect(result!.text).toContain('StatBento')
})

test('getSlideBlock returns null for out-of-range ordinal', () => {
  expect(getSlideBlock(TWO_SLIDE, 99)).toBeNull()
  expect(getSlideBlock(TWO_SLIDE, -1)).toBeNull()
})

// ── setSlideProp ──────────────────────────────────────────────────────────────

test('setSlideProp changes the target slide and leaves all other bytes identical', () => {
  const updated = setSlideProp(TWO_SLIDE, 1, 'title', 'NewNums')

  // slide 1 changed
  expect(updated).toContain('title="NewNums"')

  // slide 0 is byte-identical — verify by extracting slide 0 block from both
  const originalBlocks = splitBlocks(TWO_SLIDE)
  const updatedBlocks = splitBlocks(updated)
  const originalSlide0 = originalBlocks.find(b => b.kind === 'slide' && b.text.includes('Hello'))
  const updatedSlide0 = updatedBlocks.find(b => b.kind === 'slide' && b.text.includes('Hello'))
  expect(updatedSlide0!.text).toBe(originalSlide0!.text)

  // frontmatter is byte-identical
  const originalFm = originalBlocks.find(b => b.kind === 'frontmatter')
  const updatedFm = updatedBlocks.find(b => b.kind === 'frontmatter')
  expect(updatedFm!.text).toBe(originalFm!.text)
})

test('setSlideProp on slide 0 leaves slide 1 byte-identical', () => {
  const updated = setSlideProp(TWO_SLIDE, 0, 'title', 'Bye')

  expect(updated).toContain('title="Bye"')

  const originalBlocks = splitBlocks(TWO_SLIDE)
  const updatedBlocks = splitBlocks(updated)
  const originalSlide1 = originalBlocks.find(b => b.kind === 'slide' && b.text.includes('StatBento'))
  const updatedSlide1 = updatedBlocks.find(b => b.kind === 'slide' && b.text.includes('StatBento'))
  expect(updatedSlide1!.text).toBe(originalSlide1!.text)
})

test('setSlideProp is byte-stable round-trip (setting same value reproduces original)', () => {
  // Setting the existing value should reproduce an equivalent output
  const updated = setSlideProp(TWO_SLIDE, 0, 'title', 'Hello')
  // The overall source should still contain "Hello"
  expect(updated).toContain('title="Hello"')
  // And the full source must still round-trip through splitBlocks
  expect(joinBlocks(splitBlocks(updated))).toBe(updated)
})

test('setSlideProp on a single-slide source works', () => {
  const updated = setSlideProp(SINGLE, 0, 'title', 'Changed')
  expect(updated).toContain('title="Changed"')
})

test('setSlideProp returns original source for out-of-range ordinal', () => {
  expect(setSlideProp(TWO_SLIDE, 99, 'title', 'x')).toBe(TWO_SLIDE)
})

// ── switchSlideTemplate ───────────────────────────────────────────────────────

test('switchSlideTemplate swaps the element name and props on slide 0', () => {
  const updated = switchSlideTemplate(TWO_SLIDE, 0, 'StatBento', { title: 'Swapped' })
  expect(updated).toContain('<StatBento title="Swapped" />')
  // Original element gone
  expect(updated).not.toContain('<CoverSlide')
  // Slide 1 untouched
  expect(updated).toContain('<StatBento title="Nums" />')
})

test('switchSlideTemplate preserves leading import lines in the block', () => {
  const src = `---\ntitle: T\n---\n\nimport { CoverSlide } from "@atom63/slides";\n\n<CoverSlide title="Hello" />\n\n---\n\n<StatBento title="Nums" />\n`
  const updated = switchSlideTemplate(src, 0, 'StatBento', { title: 'Switched' })
  // Import line preserved
  expect(updated).toContain('import { CoverSlide } from "@atom63/slides";')
  // Element replaced
  expect(updated).toContain('<StatBento title="Switched" />')
})

test('switchSlideTemplate with empty props produces a no-attr self-closing element', () => {
  const updated = switchSlideTemplate(TWO_SLIDE, 0, 'BlankSlide', {})
  expect(updated).toContain('<BlankSlide />')
})

test('switchSlideTemplate returns original source for out-of-range ordinal', () => {
  expect(switchSlideTemplate(TWO_SLIDE, 99, 'X', {})).toBe(TWO_SLIDE)
})

test('result is still byte-stable through splitBlocks round-trip', () => {
  const updated = switchSlideTemplate(TWO_SLIDE, 1, 'CoverSlide', { title: 'New' })
  expect(joinBlocks(splitBlocks(updated))).toBe(updated)
})

// ── Fix 2: opaque-safety gate ─────────────────────────────────────────────────
//
// `setSlideProp` and `switchSlideTemplate` must return `source` byte-unchanged
// when the target block is opaque (has non-whitespace children, spread attrs,
// expression props, or an unregistered component name).  This must hold even
// when `findTemplateElement` would otherwise match the element.

/** A deck whose first slide has non-whitespace JSX children — opaque by spec. */
const OPAQUE_CHILDREN_DECK = `<CoverSlide title="Hello">some child text</CoverSlide>

---

<StatBento title="Nums" />
`

test('setSlideProp on an opaque block (has children) returns source unchanged', () => {
  const result = setSlideProp(OPAQUE_CHILDREN_DECK, 0, 'title', 'Changed')
  expect(result).toBe(OPAQUE_CHILDREN_DECK)
})

test('switchSlideTemplate on an opaque block (has children) returns source unchanged', () => {
  const result = switchSlideTemplate(OPAQUE_CHILDREN_DECK, 0, 'StatBento', { title: 'Swapped' })
  expect(result).toBe(OPAQUE_CHILDREN_DECK)
})

test('setSlideProp on a non-opaque sibling slide still works when another slide is opaque', () => {
  const result = setSlideProp(OPAQUE_CHILDREN_DECK, 1, 'title', 'Updated')
  expect(result).toContain('title="Updated"')
  // Opaque slide 0 is unchanged
  expect(result).toContain('<CoverSlide title="Hello">some child text</CoverSlide>')
})
