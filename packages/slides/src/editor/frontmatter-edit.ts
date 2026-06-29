/**
 * Pure frontmatter field editor — rewrites one YAML key in MDX/Markdown source
 * text-faithfully, without a YAML serializer, so unrelated lines are preserved
 * verbatim (including values that contain colons, quotes, etc.).
 *
 * Frontmatter detection mirrors `parseFrontmatter` in compile-deck.ts:
 *   - First line must be exactly `---` (after stripping a UTF-8 BOM).
 *   - The block closes at the next line that is exactly `---`.
 *   - If no closing fence is found the whole source is treated as body (no FM).
 *
 * Line-ending fidelity: the function detects whether the source uses CRLF or
 * LF as its dominant line ending and uses that same sequence when rebuilding
 * the frontmatter fence and the inserted/updated field line. Body lines passed
 * through are never touched — they already carry the original endings.
 *
 * BOM fidelity: a leading UTF-8 BOM (U+FEFF) is stripped before detection and
 * re-prepended to the reconstructed output, so a BOM-prefixed source remains
 * BOM-prefixed after the edit.
 *
 * Empty-block edge case: when removing the only remaining field leaves an empty
 * inner block, we keep `---${nl}---${nl}` (two fence lines with no content
 * between them) rather than dropping the block entirely. This is the simplest
 * choice that is unambiguous and avoids shifting byte offsets of the body;
 * callers that want to collapse it can do so separately.
 */

const BOM = '﻿'

/**
 * Detect the dominant line ending in `text`.
 * Returns `'\r\n'` if CRLF appears at least as often as bare LF, else `'\n'`.
 */
function detectNewline(text: string): '\r\n' | '\n' {
  const crlf = (text.match(/\r\n/g) ?? []).length
  const lf = (text.match(/(?<!\r)\n/g) ?? []).length
  return crlf >= lf && crlf > 0 ? '\r\n' : '\n'
}

/**
 * Set (or remove) a single frontmatter field in `source`.
 *
 * - If `value` is non-empty: upsert `key: value` into the frontmatter block.
 * - If `value` is empty: remove the `key:` line from the frontmatter block.
 * - If no frontmatter block exists and `value` is non-empty: prepend one.
 * - If no frontmatter block exists and `value` is empty: return `source` unchanged.
 * - If the field already has the same value: return the same string reference
 *   (byte-identical, no allocation).
 *
 * Line endings in the source (LF or CRLF) are detected and preserved. A leading
 * UTF-8 BOM is preserved in the output.
 */
export function setFrontmatterField(source: string, key: string, value: string): string {
  // ── BOM handling ─────────────────────────────────────────────────────────
  const hasBom = source.startsWith(BOM)
  const withoutBom = hasBom ? source.slice(1) : source

  // ── Line-ending detection (from the full source, before splitting) ────────
  const nl = detectNewline(withoutBom)

  // Split on \n after stripping \r so line content is clean regardless of ending.
  // We re-join with the detected `nl` when rebuilding.
  const lines = withoutBom.split('\n').map(l => l.replace(/\r$/, ''))

  // ── Detect frontmatter block ──────────────────────────────────────────────
  const hasFrontmatter = lines[0]?.trim() === '---'

  if (!hasFrontmatter) {
    // No frontmatter: removing a field is a no-op; adding creates a new block.
    if (!value) return source
    const prefix = `---${nl}${key}: ${value}${nl}---${nl}`
    return hasBom ? BOM + prefix + withoutBom : prefix + withoutBom
  }

  // Find closing fence.
  let closingIndex = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      closingIndex = i
      break
    }
  }

  if (closingIndex === -1) {
    // Unclosed frontmatter — treat as body, same as parseFrontmatter.
    if (!value) return source
    const prefix = `---${nl}${key}: ${value}${nl}---${nl}`
    return hasBom ? BOM + prefix + withoutBom : prefix + withoutBom
  }

  // Inner YAML lines (between the two fences, excluding them).
  const innerLines = lines.slice(1, closingIndex)

  // Lines after the closing fence (the body, as a single rejoined string).
  // We preserve these exactly as-is — re-join with the detected nl so the
  // body's own endings are reconstructed faithfully.
  const bodyLines = lines.slice(closingIndex + 1)

  // ── Operate on innerLines ─────────────────────────────────────────────────
  // Match `key:` at the start of a line (key followed by colon, optional space).
  const keyRe = new RegExp(`^${escapeRegExp(key)}:`)
  const existingIdx = innerLines.findIndex(l => keyRe.test(l))

  let newInnerLines: string[]

  if (existingIdx !== -1) {
    const existing = innerLines[existingIdx]
    if (value) {
      const desired = `${key}: ${value}`
      // No-op check: same value already present → return source unchanged.
      if (existing === desired) return source
      // Replace in place.
      newInnerLines = [...innerLines]
      newInnerLines[existingIdx] = desired
    } else {
      // Remove the field line.
      newInnerLines = innerLines.filter((_, i) => i !== existingIdx)
    }
  } else {
    if (!value) {
      // Key doesn't exist and we're removing — no-op.
      return source
    }
    // Append new field as the last inner line.
    newInnerLines = [...innerLines, `${key}: ${value}`]
  }

  // ── Rebuild ───────────────────────────────────────────────────────────────
  // Reconstruct the frontmatter block + the body, using the source's own nl.
  const innerBlock = newInnerLines.join(nl)
  const bodyBlock = bodyLines.join(nl)
  const rebuilt = `---${nl}${innerBlock}${nl}---${nl}${bodyBlock}`

  return hasBom ? BOM + rebuilt : rebuilt
}

/** Escape special regex characters in a literal string. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
