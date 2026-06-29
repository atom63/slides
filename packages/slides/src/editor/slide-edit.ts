/**
 * Pure helpers that operate on the WHOLE-deck `source` string, tying together
 * `splitBlocks` / `joinBlocks`, `setProp`, and `findTemplateElement` so that
 * the Form view can edit individual slides without touching any other bytes.
 *
 * All functions are stateless and synchronous — safe to call on every render.
 */

import { findTemplateElement, parseSlide } from './parse-slide'
import { renderJsxAttr, setProp } from './serialize-slot'
import { joinBlocks, splitBlocks } from './slide-blocks'

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Returns the indices (into `splitBlocks(source)`) of non-empty slide blocks,
 * in document order. Empty slide blocks (text that is blank / whitespace-only)
 * that appear between two adjacent separators are skipped — they are not
 * rendered as visible slides.
 */
export function slideBlockIndices(source: string): number[] {
  const blocks = splitBlocks(source)
  const indices: number[] = []
  for (const block of blocks) {
    if (block.kind === 'slide' && block.text.trim() !== '') {
      indices.push(block.index)
    }
  }
  return indices
}

/**
 * Return the block (by its position in `splitBlocks`) and its exact text for
 * the Nth (0-based) rendered slide.  Returns `null` when `slideOrdinal` is out
 * of range.
 */
export function getSlideBlock(
  source: string,
  slideOrdinal: number
): { blockIndex: number; text: string } | null {
  const indices = slideBlockIndices(source)
  if (slideOrdinal < 0 || slideOrdinal >= indices.length) return null
  const blockIndex = indices[slideOrdinal]
  const blocks = splitBlocks(source)
  const block = blocks.find(b => b.index === blockIndex)
  if (!block) return null
  return { blockIndex, text: block.text }
}

/**
 * Apply one prop change to the Nth (0-based) rendered slide inside `source`.
 *
 * Uses `setProp` for byte-stable mutation — only the changed attribute value
 * is rewritten; all other bytes in the source are preserved exactly.
 *
 * Returns the original `source` unchanged when `slideOrdinal` is out of range
 * or the target block is opaque (i.e. `parseSlide` does not return
 * `{ kind: 'template' }`). This is a hard safety gate — opaque blocks are
 * never lossily rewritten, regardless of whether `findTemplateElement` would
 * have matched.
 */
export function setSlideProp(
  source: string,
  slideOrdinal: number,
  key: string,
  value: string
): string {
  const indices = slideBlockIndices(source)
  if (slideOrdinal < 0 || slideOrdinal >= indices.length) return source
  const blockIndex = indices[slideOrdinal]

  const blocks = splitBlocks(source)
  const updated = blocks.map(b => {
    if (b.index !== blockIndex) return b
    // Opaque-safety gate: only rewrite template blocks
    if (parseSlide(b.text).kind !== 'template') return b
    return { ...b, text: setProp(b.text, key, value) }
  })
  return joinBlocks(updated)
}

// ── switchSlideTemplate ───────────────────────────────────────────────────────

/**
 * Render a set of props as JSX attribute string (name="value" pairs, single
 * space separated).
 *
 * Delegates to `renderJsxAttr` (from serialize-slot) so entity escaping is
 * consolidated in one place and both code paths benefit from the same fix.
 */
function renderProps(props: Record<string, string>): string {
  return Object.entries(props)
    .map(([k, v]) => renderJsxAttr(k, v))
    .join(' ')
}

/**
 * Replace the JSX template element in the Nth (0-based) rendered slide with a
 * freshly-rendered self-closing `<NextName key="val" … />` built from
 * `nextProps`.
 *
 * Only the JSX element span is replaced; any leading import declarations or
 * surrounding whitespace/text in the block are preserved byte-for-byte.
 *
 * Returns the original `source` unchanged when `slideOrdinal` is out of range
 * or the target block is opaque (i.e. `parseSlide` does not return
 * `{ kind: 'template' }`). This is a hard safety gate — opaque blocks are
 * never lossily rewritten, regardless of whether `findTemplateElement` would
 * have matched.
 */
export function switchSlideTemplate(
  source: string,
  slideOrdinal: number,
  nextName: string,
  nextProps: Record<string, string>
): string {
  const indices = slideBlockIndices(source)
  if (slideOrdinal < 0 || slideOrdinal >= indices.length) return source
  const blockIndex = indices[slideOrdinal]

  const blocks = splitBlocks(source)
  const updated = blocks.map(b => {
    if (b.index !== blockIndex) return b

    // Opaque-safety gate: only rewrite template blocks
    if (parseSlide(b.text).kind !== 'template') return b

    const element = findTemplateElement(b.text)
    if (element === null) return b

    // Build the replacement element string
    const propsStr = renderProps(nextProps)
    const replacement =
      propsStr.length > 0 ? `<${nextName} ${propsStr} />` : `<${nextName} />`

    // element.start / element.end are offsets into b.text
    const newText =
      b.text.slice(0, element.start) + replacement + b.text.slice(element.end)
    return { ...b, text: newText }
  })

  return joinBlocks(updated)
}
