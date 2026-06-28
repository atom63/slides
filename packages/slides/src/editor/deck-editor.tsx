import { DeckSurface } from './deck-surface'

export interface DeckEditorProps {
  source: string
  onChange?: (next: string) => void
  debounceMs?: number
}

/**
 * Backward-compatible editor: DeckSurface locked to Edit mode. The unified
 * surface ({@link DeckSurface}) is the preferred API; this remains for existing
 * consumers.
 */
export function DeckEditor({ source, onChange, debounceMs }: DeckEditorProps) {
  return (
    <DeckSurface
      source={source}
      onChange={onChange ?? (() => {})}
      initialMode="edit"
      debounceMs={debounceMs}
    />
  )
}
