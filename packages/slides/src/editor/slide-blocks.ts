/**
 * Split a deck's MDX source into typed blocks so a form editor can mutate ONE
 * slide's content while leaving all other bytes byte-identical.
 *
 * Partition rules
 * ---------------
 * • `frontmatter` — the leading `---`…`---` YAML fence (including both fence
 *   lines and the trailing newline after the closing `---`). Present only when
 *   the source begins with a `---` line that has a matching closing fence.
 * • `separator`   — a single `---\n` (or `---` at EOF) at the top level that
 *   acts as a slide boundary. In-code `---` lines (inside ``` / ~~~ fences) are
 *   NOT treated as separators.
 * • `slide`       — all content between separators (may be empty string if two
 *   separators are adjacent). Each slide block's `text` includes any surrounding
 *   blank lines that are NOT part of a separator.
 *
 * Byte-fidelity guarantee
 * -----------------------
 * `joinBlocks(splitBlocks(source)) === source` for every valid input.
 * Each block stores its exact original text; `joinBlocks` is just concatenation.
 */

export interface Block {
  /** Sequential index across all emitted blocks (0-based). */
  index: number
  kind: 'frontmatter' | 'separator' | 'slide'
  /** Exact original text for this block — concatenating all texts reproduces the source. */
  text: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when a line (already trimmed) opens or closes a fenced code block. */
function isFenceMarker(trimmed: string): boolean {
  return trimmed.startsWith('```') || trimmed.startsWith('~~~')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Split `source` into typed blocks.
 *
 * Algorithm:
 *  1. Strip a leading frontmatter block if present (same rule as parseFrontmatter).
 *  2. Walk the remainder line-by-line, toggling a `inFence` flag on ``` / ~~~.
 *  3. Lines that are exactly `---` at top level (not inside a fence) become
 *     `separator` blocks; everything else accumulates into a `slide` chunk.
 *  4. A trailing `---` with no content after it still emits a separator but
 *     does NOT emit an additional empty slide.
 */
export function splitBlocks(source: string): Block[] {
  const blocks: Block[] = []
  let idx = 0

  // ── Step 1: peel frontmatter ──────────────────────────────────────────────
  // Mirrors parseFrontmatter exactly (same fence rule, same BOM strip).
  const normalized = source.replace(/^﻿/, '')
  const allLines = normalized.split('\n')

  let remainder = source
  let frontmatterConsumed = 0 // byte count consumed by frontmatter

  if (allLines[0]?.trim() === '---') {
    // Look for a closing fence starting at line 1.
    let closeIdx = -1
    for (let i = 1; i < allLines.length; i++) {
      if (allLines[i].trim() === '---') {
        closeIdx = i
        break
      }
    }

    if (closeIdx !== -1) {
      // Frontmatter text = lines[0..closeIdx] joined with '\n', plus the '\n'
      // that was between closeIdx and the next line (the split() consumed it).
      const fmLines = allLines.slice(0, closeIdx + 1)
      // Each line was split on '\n', so we re-join with '\n' and add the
      // trailing '\n' that existed after the closing fence (unless it was the
      // very last character of source, in which case split produces an empty
      // string at the end and we must not double-add).
      const fmText = `${fmLines.join('\n')}\n`

      // Validate that source actually contains this prefix (handles BOM).
      if (source.startsWith(fmText) || normalized.startsWith(fmText)) {
        frontmatterConsumed = fmText.length
        blocks.push({ index: idx++, kind: 'frontmatter', text: fmText })
        remainder = source.slice(frontmatterConsumed)
      }
    }
  }

  // ── Step 2: walk the remainder line-by-line ───────────────────────────────
  // We need line-by-line iteration but must reconstruct exact text for each
  // block. To keep byte-fidelity we track character offsets into `remainder`.

  const remLines = remainder.split('\n')
  // split('\n') on "a\nb\n" → ["a","b",""] — the trailing "" represents the
  // final newline. We re-attach '\n' to every line except the very last one
  // when it is the empty string produced by a trailing newline.

  // Build an array of {content, raw} where `raw` is the exact substring
  // including the '\n' terminator (or nothing for a true EOF without newline).
  const lineRaws: string[] = []
  for (let i = 0; i < remLines.length; i++) {
    const isLast = i === remLines.length - 1
    if (isLast && remLines[i] === '') {
      // This empty string is the artifact of a trailing '\n' — the newline
      // already belongs to the previous line's raw. Don't emit a line for it.
      break
    }
    lineRaws.push(isLast ? remLines[i] : `${remLines[i]}\n`)
  }

  let inFence = false
  let slideText = ''

  const flushSlide = () => {
    // Always emit a slide block, even if empty — this preserves byte-fidelity
    // for adjacent separators. But we skip a trailing empty slide if the
    // remainder ended at a separator (handled in the loop by checking whether
    // lineRaws is exhausted after the last separator).
    blocks.push({ index: idx++, kind: 'slide', text: slideText })
    slideText = ''
  }

  for (let i = 0; i < lineRaws.length; i++) {
    const raw = lineRaws[i]
    const trimmed = raw.trimEnd().replace(/\r$/, '') // trim CR for CRLF safety

    if (!inFence && trimmed === '---') {
      // This is a top-level separator.
      // Flush accumulated slide content before the separator.
      flushSlide()
      // Emit the separator block (just the `---\n` line).
      blocks.push({ index: idx++, kind: 'separator', text: raw })
      // After the separator, check if there's more content. If not, don't
      // emit a phantom empty slide — the loop will simply end.
    } else {
      // Toggle fenced-code state.
      if (isFenceMarker(trimmed)) {
        inFence = !inFence
      }
      slideText += raw
    }
  }

  // Flush final slide (may be empty if source ended with a separator).
  // Only emit if non-empty OR if there were no separators at all (single slide).
  if (slideText !== '' || blocks.filter(b => b.kind === 'slide').length === 0) {
    flushSlide()
  }

  return blocks
}

/**
 * Reconstruct the original source from a block array.
 * Concatenation is sufficient because each block stores its exact original text.
 */
export function joinBlocks(blocks: Block[]): string {
  return blocks.map(b => b.text).join('')
}
