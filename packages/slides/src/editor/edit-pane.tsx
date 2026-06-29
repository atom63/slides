import { type ChangeEvent, type KeyboardEvent, useCallback, useMemo, useRef, useState } from 'react'
import { listTemplates } from '../content/template-registry'
import { SlidesPlayer } from '../player/slides-player'
import type { SlideDeckItem } from '../types'
import { parseSlide } from './parse-slide'
import { getSlideBlock, setSlideProp, slideBlockIndices, switchSlideTemplate } from './slide-edit'
import { SlotForm } from './slot-form'
import { TemplatePicker } from './template-picker'
import { templateSnippets } from './template-snippets'

export interface EditPaneProps {
  source: string
  onChange: (next: string) => void
  onSave?: (source: string) => void | Promise<void>
  deck: SlideDeckItem | null
  error: string | null
  onPresent: () => void
}

type RightPaneTab = 'source' | 'form'

export function EditPane({ source, onChange, onSave, deck, error, onPresent }: EditPaneProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [rightTab, setRightTab] = useState<RightPaneTab>('source')
  // TODO: sync with preview nav — currently uses a form-local stepper defaulting to slide 0.
  const [formSlideIdx, setFormSlideIdx] = useState(0)
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

  // ── Form view helpers ─────────────────────────────────────────────────────
  const slideCount = useMemo(() => slideBlockIndices(source).length, [source])
  const clampedIdx = Math.min(formSlideIdx, Math.max(0, slideCount - 1))

  const currentBlock = useMemo(() => getSlideBlock(source, clampedIdx), [source, clampedIdx])
  const parsedSlide = useMemo(
    () => (currentBlock ? parseSlide(currentBlock.text) : null),
    [currentBlock]
  )

  const handleSlotChange = useCallback(
    (key: string, value: string) => {
      onChange(setSlideProp(source, clampedIdx, key, value))
    },
    [source, clampedIdx, onChange]
  )

  const handleTemplateSwitch = useCallback(
    (next: string, mapped: { props: Record<string, string>; dropped: string[] }) => {
      onChange(switchSlideTemplate(source, clampedIdx, next, mapped.props))
    },
    [source, clampedIdx, onChange]
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
            {/* Source | Form sub-toggle */}
            <div className="a63-editor__subtoggle" role="group" aria-label="Edit mode">
              <button
                type="button"
                className="a63-editor__subtoggle-btn"
                aria-pressed={rightTab === 'source'}
                onClick={() => setRightTab('source')}
              >
                Source
              </button>
              <button
                type="button"
                className="a63-editor__subtoggle-btn"
                aria-pressed={rightTab === 'form'}
                onClick={() => setRightTab('form')}
              >
                Form
              </button>
            </div>
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

        {rightTab === 'source' ? (
          <>
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
          </>
        ) : (
          <div className="a63-editor__form-panel">
            {/* Slide stepper */}
            <div className="a63-editor__slide-stepper">
              <button
                type="button"
                className="a63-editor__stepper-btn"
                aria-label="Previous slide"
                disabled={clampedIdx <= 0}
                onClick={() => setFormSlideIdx(i => Math.max(0, i - 1))}
              >
                ‹
              </button>
              <span className="a63-editor__stepper-label">
                Slide {clampedIdx + 1} / {slideCount}
              </span>
              <button
                type="button"
                className="a63-editor__stepper-btn"
                aria-label="Next slide"
                disabled={clampedIdx >= slideCount - 1}
                onClick={() => setFormSlideIdx(i => Math.min(slideCount - 1, i + 1))}
              >
                ›
              </button>
            </div>

            {/* Form content */}
            {parsedSlide === null ? (
              <p className="a63-editor__form-empty">No slides found.</p>
            ) : parsedSlide.kind === 'opaque' ? (
              <div className="a63-editor__form-opaque">
                <p>This slide is only editable in Source.</p>
                <button
                  type="button"
                  className="a63-editor__subtoggle-btn"
                  onClick={() => setRightTab('source')}
                >
                  Switch to Source
                </button>
              </div>
            ) : (
              <div className="a63-editor__form-fields">
                <TemplatePicker
                  name={parsedSlide.name}
                  props={parsedSlide.props}
                  onSwitch={handleTemplateSwitch}
                />
                <SlotForm
                  name={parsedSlide.name}
                  props={parsedSlide.props}
                  onChange={handleSlotChange}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
