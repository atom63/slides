import { type JSX, useId } from 'react'
import { BUILTIN_THEMES } from '../content/themes'
import { setFrontmatterField } from './frontmatter-edit'

export interface ThemePickerProps {
  source: string
  theme: string | undefined
  onChange: (next: string) => void
}

/**
 * ThemePicker — writes `theme:` into the deck frontmatter.
 *
 * This controls the DECK token theme (dark/terminal/editorial/neon/bold),
 * distinct from the Light/Dark preview-canvas toggle in EditPane which only
 * affects the editor's background. Selecting "Default" removes the theme line.
 */
export function ThemePicker({ source, theme, onChange }: ThemePickerProps): JSX.Element {
  const id = useId()
  return (
    <label htmlFor={id} className="a63-editor__theme-picker-label">
      <span className="a63-editor__theme-picker-text">Theme</span>
      <select
        id={id}
        aria-label="Theme"
        className="a63-editor__theme-select"
        value={theme ?? ''}
        onChange={e => onChange(setFrontmatterField(source, 'theme', e.target.value))}
      >
        <option value="">Default</option>
        {BUILTIN_THEMES.map(t => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </label>
  )
}
