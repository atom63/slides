import { type ComponentType, useEffect, useMemo, useState } from 'react'
import { SlidesPlayer } from '../player/slides-player'
import type { SlideDeckItem } from '../types'
import { compileDeck } from './compile-deck'
import { EditPane } from './edit-pane'

export type DeckSurfaceMode = 'present' | 'edit'

export interface DeckSurfaceProps {
  /**
   * Raw deck MDX source (frontmatter + `---`-separated slide body). The single
   * canonical input for both Present and Edit modes.
   *
   * **Controlled vs. uncontrolled:**
   * - When `onChange` is provided the surface is **controlled** — the parent
   *   owns source state and must feed back the updated string on each change.
   * - When `onChange` is omitted the surface is **uncontrolled** and
   *   **present-only**: `source` is read once on mount and later prop changes
   *   are ignored. This is the production / read-only contract.
   */
  source: string
  /**
   * Called with the next source string on every edit or template insert
   * (in-memory, per-keystroke). Presence of this prop **enables Edit mode**
   * and makes the surface controlled — the parent holds source state.
   * When omitted the surface is present-only (no edit chrome, no keyboard
   * shortcut to enter Edit).
   */
  onChange?: (next: string) => void
  /**
   * Called on an **explicit** save action (Save button or Cmd/Ctrl-S in Edit
   * mode). This is the persistence hook, distinct from the per-keystroke
   * `onChange`. Wire it to the dev write-back plugin (or any async persistence
   * layer) to flush the source to disk on demand. No-op / absent in a
   * production build.
   */
  onSave?: (source: string) => void | Promise<void>
  /**
   * The mode the surface starts in. Defaults to `'present'`. Forced to
   * `'present'` when `onChange` is absent (present-only surfaces cannot enter
   * Edit mode).
   */
  initialMode?: DeckSurfaceMode
  /**
   * Debounce window in milliseconds before recompiling the preview after a
   * source change. Defaults to `300`. Pass `0` in tests to compile
   * synchronously on the next microtask tick.
   */
  debounceMs?: number
}

type Preview = { Content: ComponentType; meta: SlideDeckItem['meta'] } | null

export function DeckSurface({
  source: sourceProp,
  onChange,
  onSave,
  initialMode = 'present',
  debounceMs = 300,
}: DeckSurfaceProps) {
  const editable = onChange !== undefined

  // Controlled when onChange provided; uncontrolled otherwise.
  const [internalSource, setInternalSource] = useState(sourceProp)
  const source = editable ? sourceProp : internalSource

  const setSource = (next: string) => {
    if (editable) onChange(next)
    else setInternalSource(next)
  }

  const [mode, setMode] = useState<DeckSurfaceMode>(editable ? initialMode : 'present')

  const [preview, setPreview] = useState<Preview>(null)
  const [error, setError] = useState<string | null>(null)

  // Debounced runtime compile. Keeps the last good preview on error.
  useEffect(() => {
    let cancelled = false
    const h = setTimeout(async () => {
      const r = await compileDeck(source)
      if (cancelled) return
      if (r.ok) {
        setPreview({ Content: r.Content, meta: r.meta })
        setError(null)
      } else {
        setError(r.error)
      }
    }, debounceMs)
    return () => {
      cancelled = true
      clearTimeout(h)
    }
  }, [source, debounceMs])

  const deck: SlideDeckItem | null = useMemo(
    () => (preview ? { slug: 'draft', meta: preview.meta, content: preview.Content } : null),
    [preview]
  )

  // Keyboard shortcuts (only when editable).
  useEffect(() => {
    if (!editable) return
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      if (e.key === 'e' && !typing && mode === 'present') setMode('edit')
      if (e.key === 'Escape' && mode === 'edit') setMode('present')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editable, mode])

  if (editable && mode === 'edit') {
    return (
      <EditPane
        source={source}
        onChange={setSource}
        onSave={onSave}
        deck={deck}
        error={error}
        onPresent={() => setMode('present')}
      />
    )
  }

  return (
    <div className="a63-surface">
      {editable && (
        <button type="button" className="a63-surface__edit" onClick={() => setMode('edit')}>
          Edit
        </button>
      )}
      {deck ? (
        <SlidesPlayer deck={deck} onBack={() => {}} />
      ) : (
        <div className="a63-editor__preview-empty">
          {error ? 'Fix the MDX error to render a preview.' : 'Compiling preview…'}
        </div>
      )}
    </div>
  )
}
