import { useEffect, useState } from 'react'
import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>

// Singleton — one highlighter shared across all SlideCodeBlock instances.
// Lazy-initialised on first use, reused for every subsequent call.
let instance: Highlighter | null = null
let pending: Promise<Highlighter> | null = null

// Result cache: avoid re-highlighting the same code+language pair across
// component mounts (e.g. sidebar thumbnails + stage both rendering the same block).
// FIFO eviction at MAX_CACHE_ENTRIES prevents unbounded growth in long sessions
// where many decks / code blocks are viewed.
const MAX_CACHE_ENTRIES = 200
const htmlCache = new Map<string, string>()

function getHighlighter(): Promise<Highlighter> {
  if (instance) return Promise.resolve(instance)
  if (!pending) {
    pending = createHighlighterCore({
      themes: [
        import('shiki/themes/github-dark-dimmed.mjs'),
        import('shiki/themes/github-light.mjs'),
      ],
      langs: [
        import('shiki/langs/tsx.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/css.mjs'),
        import('shiki/langs/scss.mjs'),
        import('shiki/langs/bash.mjs'),
        import('shiki/langs/json.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/mdx.mjs'),
      ],
      engine: createOnigurumaEngine(import('shiki/wasm')),
    })
      .then(h => {
        instance = h
        return h
      })
      .catch(error => {
        // Reset so a later call (e.g. remount) can retry instead of reusing a
        // permanently-rejected promise; re-throw so the caller's catch fires.
        pending = null
        throw error
      })
  }
  return pending
}

export function useShikiHighlight(code: string, lang: string): string | null {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = code.trim()
    if (!trimmed) return

    const cacheKey = `${lang}:${trimmed}`
    const cached = htmlCache.get(cacheKey)
    if (cached) {
      setHtml(cached)
      return
    }

    let active = true
    getHighlighter()
      .then(h => {
        if (!active) return
        // Dual themes so data-theme contains a space — this matches the
        // pre[data-theme*=" "] rules in code-highlighting.css which consume
        // --shiki-light and --shiki-dark custom properties per token.
        const result = h.codeToHtml(trimmed, {
          lang,
          themes: { dark: 'github-dark-dimmed', light: 'github-light' },
          defaultColor: false,
          // Add data-theme so the existing pre[data-theme*=" "] span CSS rule
          // in code-highlighting.css applies --shiki-light/dark colors.
          transformers: [
            {
              pre(node) {
                node.properties['data-theme'] = 'dark light'
              },
            },
          ],
        })
        htmlCache.set(cacheKey, result)
        // Evict the oldest entry when over the cap (Map preserves insertion order)
        if (htmlCache.size > MAX_CACHE_ENTRIES) {
          const firstKey = htmlCache.keys().next().value
          if (firstKey !== undefined) {
            htmlCache.delete(firstKey)
          }
        }
        setHtml(result)
      })
      .catch(error => {
        if (!active) return
        // Highlighter failed to load — fall back to plain code (null) instead of
        // hanging unhighlighted, and keep the rejection from going unhandled.
        console.error('Shiki highlight failed; falling back to plain code:', error)
        setHtml(null)
      })
    return () => {
      active = false
    }
  }, [code, lang])

  return html
}
