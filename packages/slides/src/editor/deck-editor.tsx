import {
  type ChangeEvent,
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { listTemplates } from '../content/template-registry'
import { SlidesPlayer } from '../player/slides-player'
import type { SlideDeckItem } from '../types'
import { compileDeck } from './compile-deck'
import { templateSnippets } from './template-snippets'

export interface DeckEditorProps {
  /** Raw deck MDX source (frontmatter + body with `---` slide separators). */
  source: string
  /**
   * Called with the next source on every edit / template insert. When omitted,
   * the editor manages source internally (uncontrolled).
   */
  onChange?: (next: string) => void
  /** Debounce window (ms) before recompiling the preview. Default 300. */
  debounceMs?: number
}

type PreviewState = {
  Content: ComponentType
  meta: SlideDeckItem['meta']
} | null

type EditorTheme = 'light' | 'dark'

/**
 * v0.1 GUI deck editor for @atom63/slides.
 *
 * Two panes:
 *  - left: a LIVE preview rendered by `SlidesPlayer`, compiled from the source
 *    at runtime via {@link compileDeck} (browser-safe frontmatter split +
 *    strip-imports + `@mdx-js/mdx` evaluate, with slide components injected
 *    through MDX context).
 *  - right: a `<textarea>` editing surface, a registry-driven template palette
 *    (click inserts the template's MDX snippet at the end of the source), and a
 *    light/dark theme toggle for the preview container.
 *
 * Compilation is debounced and resilient: the LAST good preview is retained on
 * a failed compile and the error is surfaced in a non-blocking banner, so a bad
 * keystroke never blanks or crashes the editor.
 *
 * The editor's own chrome is styled by self-contained plain CSS shipped as a
 * side-effect import — consumers must `import '@atom63/slides/editor/styles'`
 * (the CSS is intentionally NOT bundled into the JS so it isn't orphaned by the
 * build, mirroring how `@atom63/slides` ships `./styles`).
 *
 * A `<textarea>` is intentional
 * for v0.1; CodeMirror (syntax highlight, structured editing) is a future
 * upgrade. Structured per-slide form editing and template-switch-by-form are
 * explicitly v2 — the source textarea is the only editing surface here.
 */
export function DeckEditor({ source: sourceProp, onChange, debounceMs = 300 }: DeckEditorProps) {
  const isControlled = onChange !== undefined
  const [internalSource, setInternalSource] = useState(sourceProp)
  const source = isControlled ? sourceProp : internalSource

  const [preview, setPreview] = useState<PreviewState>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<EditorTheme>('light')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const templates = useMemo(() => listTemplates(), [])

  const setSource = useCallback(
    (next: string) => {
      if (isControlled) onChange(next)
      else setInternalSource(next)
    },
    [isControlled, onChange]
  )

  // Debounced runtime compile. Keeps the last good preview on error.
  useEffect(() => {
    let cancelled = false
    const handle = setTimeout(async () => {
      const result = await compileDeck(source)
      if (cancelled) return
      if (result.ok) {
        setPreview({ Content: result.Content, meta: result.meta })
        setError(null)
      } else {
        setError(result.error)
      }
    }, debounceMs)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [source, debounceMs])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setSource(e.target.value),
    [setSource]
  )

  const handleInsertTemplate = useCallback(
    (name: string) => {
      const snippet = templateSnippets[name]
      if (!snippet) return
      const next = `${source.replace(/\s*$/, '')}\n${snippet}`
      setSource(next)
      // Move caret to the end so the inserted slide is visible.
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        el.focus()
        el.selectionStart = el.selectionEnd = el.value.length
        el.scrollTop = el.scrollHeight
      })
    },
    [source, setSource]
  )

  const deck: SlideDeckItem | null = useMemo(() => {
    if (!preview) return null
    return { slug: 'draft', meta: preview.meta, content: preview.Content }
  }, [preview])

  return (
    <div className="a63-editor">
      <section className="a63-editor__preview" data-theme={theme}>
        {error ? (
          <div className="a63-editor__error" role="alert">
            <span className="a63-editor__error-tag">MDX error</span>
            <span className="a63-editor__error-msg">{error}</span>
          </div>
        ) : null}
        {deck ? (
          // Remount on theme change so the player picks up the canvas theme.
          <div className="a63-editor__preview-stage" key={`${theme}`}>
            <SlidesPlayer deck={deck} onBack={() => {}} />
          </div>
        ) : (
          <div className="a63-editor__preview-empty">
            {error ? 'Fix the MDX error to render a preview.' : 'Compiling preview…'}
          </div>
        )}
      </section>

      <section className="a63-editor__source">
        <div className="a63-editor__toolbar">
          <span className="a63-editor__title">Deck source · MDX</span>
          <button
            type="button"
            className="a63-editor__theme-toggle"
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'light' ? '☀︎ Light' : '☾ Dark'}
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="a63-editor__textarea"
          value={source}
          onChange={handleChange}
          spellCheck={false}
          aria-label="Deck MDX source"
        />

        <div className="a63-editor__palette">
          <div className="a63-editor__palette-label">Templates · click to append</div>
          <div className="a63-editor__palette-grid">
            {templates.map(t => (
              <button
                key={t.name}
                type="button"
                className="a63-editor__chip"
                onClick={() => handleInsertTemplate(t.name)}
                title={`Insert ${t.name}`}
              >
                <span className="a63-editor__chip-name">{t.name}</span>
                <span className="a63-editor__chip-meta">{t.label}</span>
              </button>
            ))}
          </div>
          <p className="a63-editor__footnote">
            v0.1 · plain-textarea editing (CodeMirror is a future upgrade). Per-slide form editing
            &amp; template-switch are deferred to v2.
          </p>
        </div>
      </section>
    </div>
  )
}
