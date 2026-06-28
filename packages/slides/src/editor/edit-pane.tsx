import { type ChangeEvent, type KeyboardEvent, useCallback, useMemo, useRef, useState } from 'react'
import { listTemplates } from '../content/template-registry'
import { SlidesPlayer } from '../player/slides-player'
import type { SlideDeckItem } from '../types'
import { templateSnippets } from './template-snippets'

export interface EditPaneProps {
  source: string
  onChange: (next: string) => void
  onSave?: (source: string) => void | Promise<void>
  deck: SlideDeckItem | null
  error: string | null
  onPresent: () => void
}

export function EditPane({ source, onChange, onSave, deck, error, onPresent }: EditPaneProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const templates = useMemo(() => listTemplates(), [])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
    [onChange]
  )
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        onSave?.(source)
      }
    },
    [onSave, source]
  )
  const insert = useCallback(
    (name: string) => {
      const snippet = templateSnippets[name]
      if (!snippet) return
      onChange(`${source.replace(/\s*$/, '')}\n${snippet}`)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        el.focus()
        el.selectionStart = el.selectionEnd = el.value.length
        el.scrollTop = el.scrollHeight
      })
    },
    [source, onChange]
  )

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
          <div className="a63-editor__preview-stage" key={theme}>
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
          <div className="a63-editor__toolbar-actions">
            {onSave ? (
              <button type="button" className="a63-editor__save" onClick={() => onSave(source)}>
                Save
              </button>
            ) : null}
            <button
              type="button"
              className="a63-editor__theme-toggle"
              onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'light' ? '☀︎ Light' : '☾ Dark'}
            </button>
            <button type="button" className="a63-editor__present" onClick={onPresent}>
              Present
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          className="a63-editor__textarea"
          value={source}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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
                onClick={() => insert(t.name)}
                title={`Insert ${t.name}`}
              >
                <span className="a63-editor__chip-name">{t.name}</span>
                <span className="a63-editor__chip-meta">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
