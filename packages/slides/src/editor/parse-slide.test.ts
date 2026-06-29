import { expect, test } from 'vitest'
import { parseSlide } from './parse-slide'

// ── Positive: single registered template with literal props ────────────────

test('single registered template with literal props → template', () => {
  const r = parseSlide('<CoverSlide title="Hello" eyebrow="2026" />')
  expect(r.kind).toBe('template')
  if (r.kind === 'template') {
    expect(r.name).toBe('CoverSlide')
    expect(r.props.title).toBe('Hello')
    expect(r.props.eyebrow).toBe('2026')
  }
})

test('first slide with leading imports still parses as template', () => {
  const r = parseSlide('import { CoverSlide } from "@atom63/slides";\n\n<CoverSlide title="Hi" />')
  expect(r.kind).toBe('template')
})

test('leading import WITHOUT a trailing semicolon (single quotes) still parses', () => {
  // MDX decks commonly omit the semicolon; acorn will not ASI between the
  // import and the following JSX, so imports must be neutralized before parse.
  const block =
    "\nimport { CoverSlide, StatementSlide } from '@atom63/slides'\n\n<CoverSlide\n  title=\"X\"\n  eyebrow=\"2026\"\n/>\n\n"
  const r = parseSlide(block)
  expect(r.kind).toBe('template')
  if (r.kind === 'template') {
    expect(r.name).toBe('CoverSlide')
    expect(r.props.title).toBe('X')
  }
})

test('no-props self-closing template → template with empty props', () => {
  const r = parseSlide('<QuoteSlide quote="Life is short" />')
  expect(r.kind).toBe('template')
  if (r.kind === 'template') {
    expect(r.name).toBe('QuoteSlide')
    expect(r.props.quote).toBe('Life is short')
  }
})

// ── Opaque: bare markdown ──────────────────────────────────────────────────

test('bare markdown → opaque', () => {
  expect(parseSlide('## Hi\n\n- a').kind).toBe('opaque')
})

// ── Opaque: unregistered component ────────────────────────────────────────

test('unknown component → opaque', () => {
  expect(parseSlide('<NotATemplate x="1" />').kind).toBe('opaque')
})

// ── Opaque: expression-valued prop ────────────────────────────────────────

test('expression-valued prop on a known template → opaque', () => {
  expect(parseSlide('<CoverSlide title={x} />').kind).toBe('opaque')
})

// ── Opaque: element with children ─────────────────────────────────────────

test('element with children → opaque (v2.0 handles attribute-only)', () => {
  expect(parseSlide('<CoverSlide>\nhello\n</CoverSlide>').kind).toBe('opaque')
})

// ── Edge cases ─────────────────────────────────────────────────────────────

test('multiple JSX elements in one block → opaque', () => {
  expect(parseSlide('<CoverSlide title="A" />\n<CoverSlide title="B" />').kind).toBe('opaque')
})

test('spread attribute on a known template → opaque', () => {
  expect(parseSlide('<CoverSlide {...props} />').kind).toBe('opaque')
})

test('JSXExpressionContainer string (not Literal) → opaque', () => {
  // template literal / tagged expression — not a plain Literal
  expect(parseSlide('<CoverSlide title={`Hello`} />').kind).toBe('opaque')
})
