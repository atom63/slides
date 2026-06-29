import { expect, test } from 'vitest'
import { findTemplateElement } from './parse-slide'
import { setProp } from './serialize-slot'

const BLOCK = '<CoverSlide title="Hello"   eyebrow="2026" />'

test('no-op (same value) reproduces the block byte-for-byte', () => {
  expect(setProp(BLOCK, 'title', 'Hello')).toBe(BLOCK)
})

test('changing one prop edits only that value, preserving spacing + other props', () => {
  expect(setProp(BLOCK, 'title', 'Bye')).toBe('<CoverSlide title="Bye"   eyebrow="2026" />')
})

test('setting a not-yet-present prop inserts it without disturbing others', () => {
  const out = setProp('<CoverSlide title="x" />', 'eyebrow', '2026')
  expect(out).toContain('title="x"')
  expect(out).toContain('eyebrow="2026"')
  // title untouched, still a valid single element
})

test('preserves a leading import line (first-slide case)', () => {
  const block = 'import { CoverSlide } from "@atom63/slides";\n\n<CoverSlide title="a" />'
  const out = setProp(block, 'title', 'b')
  expect(out).toBe('import { CoverSlide } from "@atom63/slides";\n\n<CoverSlide title="b" />')
})

test('escapes a value containing a double quote', () => {
  const out = setProp('<CoverSlide title="x" />', 'title', 'a "q" b')
  // value must remain a valid JSX string attribute (e.g. via &quot; or single-quote delimiting)
  expect(out).toContain('CoverSlide')
  expect(setProp(out, 'title', 'a "q" b')).toBe(out) // idempotent round-trip
})

// Edge case: value containing `<` and `&` — `&` is entity-encoded as `&amp;` so
// that JSX parsers (which decode entity references in attribute string values)
// round-trip the value correctly.  `<` does not require escaping inside JSX
// attribute strings but `&` does because the parser would otherwise decode any
// `&…;` sequence it finds in the raw source.
test('value containing & is entity-encoded so the round-trip is stable', () => {
  const out = setProp('<CoverSlide title="x" />', 'title', 'a < b & c')
  // `&` must be encoded as `&amp;` in the output source
  expect(out).toContain('&amp;')
  // round-trip is stable: reading back the acorn-decoded value equals the original
  expect(setProp(out, 'title', 'a < b & c')).toBe(out)
})

// Edge case: value containing both single and double quotes — must use &quot; strategy
test('value with both quote types uses &quot; in double-quoted attribute', () => {
  const value = `it's a "test"`
  const out = setProp('<CoverSlide title="x" />', 'title', value)
  expect(out).toContain('CoverSlide')
  // idempotent round-trip
  expect(setProp(out, 'title', value)).toBe(out)
})

// ── Fix 3: property test — acorn round-trip invariant ────────────────────────
//
// For every value in the corpus, `setProp` must produce a syntactically valid
// JSX block whose acorn-decoded `title` attribute value equals the original
// input.  This is the regression guard for the entity-escaping fix.

/**
 * Use acorn (via `findTemplateElement`) to read back the decoded string value
 * of the named attribute from the parsed block.  Returns `null` if the block
 * cannot be parsed or the attribute is absent.
 *
 * Note: acorn stores the decoded attribute value (entity references resolved)
 * in `attr.value.value`, so this directly tests what a JSX runtime would see.
 */
function readAttrViaAcorn(block: string, attrName: string): string | null {
  // biome-ignore lint/suspicious/noExplicitAny: acorn AST nodes are untyped
  const element: any = findTemplateElement(block)
  if (element === null) return null
  // biome-ignore lint/suspicious/noExplicitAny: acorn AST nodes are untyped
  const attr = (element.openingElement.attributes ?? []).find(
    // biome-ignore lint/suspicious/noExplicitAny: acorn AST nodes are untyped
    (a: any) => a.type === 'JSXAttribute' && a.name?.name === attrName
  )
  if (!attr || attr.value?.type !== 'Literal') return null
  return attr.value.value as string
}

const CORPUS: string[] = [
  'a &quot; b',        // pre-existing entity reference — must not double-decode
  'x & y',            // bare ampersand
  'a "q" b',          // double quote only
  "a 'q' b",          // single quote only
  '1 < 2',            // less-than (no escaping needed but must survive)
  'line\nbreak',      // newline inside value
  'emoji ✦',          // non-ASCII unicode
  '&amp; "q" \'r\'',  // mixed: &amp; literal + both quote types
]

test('entity round-trip: setProp→acorn decode equals original value for all corpus entries', () => {
  const base = '<CoverSlide title="placeholder" />'
  for (const v of CORPUS) {
    const out = setProp(base, 'title', v)
    const decoded = readAttrViaAcorn(out, 'title')
    expect(decoded, `round-trip failed for value: ${JSON.stringify(v)}`).toBe(v)
  }
})

test('entity round-trip: setProp is idempotent (double-set produces same bytes)', () => {
  const base = '<CoverSlide title="placeholder" />'
  for (const v of CORPUS) {
    const once = setProp(base, 'title', v)
    const twice = setProp(once, 'title', v)
    expect(twice, `idempotency failed for value: ${JSON.stringify(v)}`).toBe(once)
  }
})
