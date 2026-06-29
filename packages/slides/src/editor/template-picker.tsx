import { type JSX, useState } from 'react'
import { getTemplate, listTemplates } from '../content/template-registry'

export interface TemplateSwitch {
  props: Record<string, string>
  dropped: string[]
}

export interface TemplatePickerProps {
  /** Current template component name, e.g. "CoverSlide". */
  name: string
  /** Current prop values keyed by SlotDef.key. */
  props: Record<string, string>
  /** Called when the user picks a different template. */
  onSwitch: (next: string, mapped: TemplateSwitch) => void
}

export function TemplatePicker({ name, props, onSwitch }: TemplatePickerProps): JSX.Element {
  const [warning, setWarning] = useState<{ from: string; to: string; dropped: string[] } | null>(
    null
  )

  function handleChange(next: string): void {
    if (next === name) return

    const nextDef = getTemplate(next)
    if (!nextDef) return

    const nextKeys = new Set(nextDef.props.map(s => s.key))

    // Carry over props whose key exists in the next template
    const carried: Record<string, string> = {}
    for (const [k, v] of Object.entries(props)) {
      if (nextKeys.has(k)) {
        carried[k] = v
      }
    }

    // Dropped = current keys not in next, but only those with non-empty values
    const dropped: string[] = Object.entries(props)
      .filter(([k, v]) => !nextKeys.has(k) && v !== '')
      .map(([k]) => k)

    // Fill required slots not already carried
    for (const slot of nextDef.props) {
      if (!(slot.key in carried)) {
        carried[slot.key] = ''
      }
    }

    onSwitch(next, { props: carried, dropped })

    if (dropped.length > 0) {
      setWarning({ from: name, to: next, dropped })
    } else {
      setWarning(null)
    }
  }

  const templates = listTemplates()

  return (
    <div className="a63-form__field">
      <label className="a63-form__label" htmlFor="a63-template-picker">
        Template
      </label>
      <select
        id="a63-template-picker"
        className="a63-form__input"
        aria-label="Template"
        value={name}
        onChange={e => handleChange(e.target.value)}
      >
        {templates.map(tpl => (
          <option key={tpl.name} value={tpl.name}>
            {tpl.label ?? tpl.name}
          </option>
        ))}
      </select>
      {warning && (
        <output className="a63-form__picker-warning">
          <span>
            Switched {warning.from} &rarr; {warning.to}; dropped: {warning.dropped.join(', ')}.
          </span>
          <button
            type="button"
            className="a63-form__picker-dismiss"
            aria-label="Dismiss"
            onClick={() => setWarning(null)}
          >
            &times;
          </button>
        </output>
      )}
    </div>
  )
}
