import type { SlideDeckMeta } from '@atom63/slides'
import { slideMdxComponents } from '@atom63/slides'
import { evaluate } from '@mdx-js/mdx'
import yaml from 'js-yaml'
import type { ComponentType } from 'react'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'

/**
 * Browser-safe YAML frontmatter split. We deliberately avoid the common
 * "gray matter" style parser because it depends on Node's `Buffer`, which
 * doesn't exist in the browser — a browser library must not force consumers to
 * polyfill Node globals.
 *
 * If `source` begins with a `---` fence line, the block up to the next `---`
 * fence is parsed as YAML into `meta` and the remainder is returned as `body`.
 * Otherwise `meta` is empty and the whole source is the `body`.
 */
export function parseFrontmatter(source: string): { meta: Record<string, unknown>; body: string } {
  // Frontmatter must start at the very top of the file (allowing a UTF-8 BOM).
  const normalized = source.replace(/^﻿/, '')
  const lines = normalized.split('\n')
  if (lines[0]?.trim() !== '---') {
    return { meta: {}, body: source }
  }

  // Find the closing fence line.
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i
      break
    }
  }
  if (end === -1) {
    // No closing fence — treat the whole thing as body, no frontmatter.
    return { meta: {}, body: source }
  }

  const yamlBlock = lines.slice(1, end).join('\n')
  const body = lines.slice(end + 1).join('\n')
  const loaded = yaml.load(yamlBlock)
  const meta = loaded && typeof loaded === 'object' ? (loaded as Record<string, unknown>) : {}
  return { meta, body }
}

/**
 * Result of a runtime deck compile.
 *
 * On success: the parsed frontmatter `meta` plus a `Content` component ready to
 * hand to `SlidesPlayer` as `deck.content`. On failure: a human-readable
 * `error` string (compile + frontmatter parsing both throw on bad input).
 */
export type CompileDeckResult =
  | { ok: true; meta: SlideDeckMeta; Content: ComponentType }
  | { ok: false; error: string }

/**
 * Matches bare ES `import` statements at the start of a line. A deck's MDX body
 * carries lines like `import { CoverSlide } from "@atom63/slides"`. The runtime
 * `evaluate` below has no module resolver, so these must be stripped — the
 * components are injected via `useMDXComponents` instead (see compileDeck).
 *
 * Covers single- and multi-line import specifier blocks:
 *   import Foo from "x"
 *   import { A, B } from "x"
 *   import {
 *     A,
 *     B,
 *   } from "x"
 */
const IMPORT_RE = /^[ \t]*import\b[\s\S]*?(?:from\s*['"][^'"]*['"]|['"][^'"]*['"])[ \t]*;?[ \t]*$/gm

/** Remove bare `import ... from "..."` lines so runtime evaluate doesn't choke. */
export function stripImports(body: string): string {
  return body.replace(IMPORT_RE, '')
}

const DEFAULT_META: SlideDeckMeta = {
  title: 'Untitled deck',
  date: new Date().toISOString().slice(0, 10),
}

/**
 * Compile a deck's raw MDX source into a renderable Content component using a
 * runtime MDX pipeline (no bundler step).
 *
 * Pipeline:
 *  1. `parseFrontmatter` splits the YAML frontmatter (the deck `meta`) from the
 *     body using a browser-safe parser (no Node `Buffer`).
 *  2. `stripImports` removes bare `import ... from "@atom63/slides"` lines that
 *     the runtime evaluator cannot resolve.
 *  3. `@mdx-js/mdx`'s `evaluate` compiles + runs the body. The slide components
 *     (templates + primitives + markdown mappings) are provided through MDX
 *     context via `useMDXComponents: () => slideMdxComponents`, so bare JSX such
 *     as `<CoverSlide/>` resolves with no import. `---` thematic breaks are
 *     preserved as the engine's slide separators.
 *
 * Async and can throw on malformed MDX/frontmatter — callers should debounce
 * and keep the last good render on failure (DeckEditor does this).
 */
export async function compileDeck(source: string): Promise<CompileDeckResult> {
  try {
    const { meta: data, body: content } = parseFrontmatter(source)
    const meta: SlideDeckMeta = { ...DEFAULT_META, ...(data as Partial<SlideDeckMeta>) }
    const body = stripImports(content)

    const { default: Content } = await evaluate(body, {
      ...runtime,
      useMDXComponents: () => slideMdxComponents,
      remarkPlugins: [remarkGfm],
    })

    return { ok: true, meta, Content: Content as ComponentType }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return { ok: false, error }
  }
}
