import { findTemplateElement } from './parse-slide'

// ── Types ──────────────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: acorn AST nodes are untyped
type AnyNode = any

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Encode a plain string value as a JSX attribute string value with surrounding
 * double-quote delimiters.
 *
 * Acorn-jsx decodes JSX entity references inside quoted attribute string
 * values (`&amp;` → `&`, `&quot;` → `"`), so our encoder must mirror exactly
 * what the parser decodes:
 *   1. `&` → `&amp;`  (MUST be first to avoid double-encoding)
 *   2. `"` → `&quot;`
 *
 * Other JSX-level entities (`&lt;`, `&gt;`, `&apos;`) are not emitted by this
 * encoder, but we do NOT need to escape `<` or `>` inside a JSX attribute
 * string — those are only significant in JSX *text* content, not attribute
 * values.
 *
 * Exported so `slide-edit.ts` can reuse the same escaping for
 * `switchSlideTemplate`, ensuring the fix lands in exactly one place.
 */
export function renderJsxAttr(name: string, value: string): string {
  // Encode & first (before " to avoid double-encoding), then "
  const encoded = value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  return `${name}="${encoded}"`
}

/**
 * Render a string value as a valid JSX attribute value (including surrounding
 * delimiters).
 *
 * Always produces a double-quoted value with `&amp;` and `&quot;` entity
 * escaping so that the round-trip `parseProp(setProp(block, k, v)) === v`
 * holds for ALL string values, including those containing `&`, `"`, or
 * pre-existing entity references such as `&quot;` or `&amp;`.
 *
 * (The previous single-quote optimisation was removed because acorn-jsx also
 * decodes entities inside single-quoted attributes, making the same escaping
 * necessary regardless of delimiter choice. Using double-quotes uniformly
 * keeps the implementation simple and correct.)
 */
function renderValue(value: string): string {
  const encoded = value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  return `"${encoded}"`
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Apply one prop change to an MDX slide block string.
 *
 * Only the bytes belonging to the changed attribute value are mutated; every
 * other character in `block` (whitespace, other props, import lines, the tag
 * name, etc.) is byte-preserved.
 *
 * @param block  The raw MDX block text (may include leading import lines).
 * @param name   The JSX attribute name to set.
 * @param value  The new plain-string value.
 * @returns      The updated block string.
 *
 * If `block` cannot be parsed as a single template element (e.g. opaque block)
 * the function returns `block` unchanged — callers should only call this on
 * blocks that `parseSlide` classifies as `{ kind: 'template' }`.
 */
export function setProp(block: string, name: string, value: string): string {
  const element: AnyNode | null = findTemplateElement(block)
  if (element === null) {
    return block
  }

  const openingEl: AnyNode = element.openingElement
  const attributes: AnyNode[] = openingEl.attributes ?? []

  // ── Case 1: attribute already exists ──────────────────────────────────────
  const existing: AnyNode | undefined = attributes.find(
    (attr: AnyNode) => attr.type === 'JSXAttribute' && attr.name?.name === name
  )

  if (existing !== undefined) {
    const attrValue: AnyNode = existing.value
    if (attrValue === null || attrValue.type !== 'Literal') {
      // Non-string attribute (expression container, boolean shorthand, etc.) —
      // not supported; return block unchanged to avoid corrupting it.
      return block
    }

    // No-op fast path: if the existing raw bytes already match what renderValue
    // would produce, return unchanged (byte-identical).
    const existingRaw = block.slice(attrValue.start, attrValue.end)
    const rendered = renderValue(value)
    if (existingRaw === rendered) {
      return block
    }

    // Value or encoding changed — replace only the value span (offsets include
    // the surrounding quotes).
    return block.slice(0, attrValue.start) + rendered + block.slice(attrValue.end)
  }

  // ── Case 2: attribute not present — insert before closing `/>` or `>` ─────
  //
  // Strategy: walk backwards from `openingEl.end` to find the `/>` or `>`
  // boundary and insert ` name="value"` just before it (before any preceding
  // whitespace that is part of the closing token itself).
  //
  // acorn-jsx sets `openingElement.end` to the position AFTER the closing
  // `>` (or `/>`) of the opening tag.  We back-track to find its start.

  const tagEnd: number = openingEl.end // exclusive: char at [tagEnd] is AFTER `>`
  const rendered = renderValue(value)

  // Find the position of `/>` or `>` by scanning backwards from tagEnd
  // (the two characters before tagEnd for a self-closing tag are `/>`).
  let insertAt: number
  if (block[tagEnd - 1] === '>' && block[tagEnd - 2] === '/') {
    // Self-closing: `/>` sits at [tagEnd-2, tagEnd)
    insertAt = tagEnd - 2
  } else if (block[tagEnd - 1] === '>') {
    // Regular closing `>`
    insertAt = tagEnd - 1
  } else {
    // Unexpected — fall back to inserting at tagEnd (safe, may look odd)
    insertAt = tagEnd
  }

  // Strip any whitespace that already precedes the `/>` so we control spacing
  // (don't add double spaces).  We keep existing whitespace and just prepend
  // a single space before our new attribute.
  const insertion = ` ${name}=${rendered}`
  return block.slice(0, insertAt) + insertion + block.slice(insertAt)
}
