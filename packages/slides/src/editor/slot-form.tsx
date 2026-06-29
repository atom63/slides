import type { JSX } from 'react'
import type { SlotDef, SlotKind } from '../content/template-registry'
import { getTemplate } from '../content/template-registry'

export interface SlotFormProps {
  /** Template component name, e.g. "CoverSlide". */
  name: string
  /** Current prop values keyed by SlotDef.key. */
  props: Record<string, string>
  /** Called when any field value changes. */
  onChange: (key: string, value: string) => void
}

function fieldId(templateName: string, key: string): string {
  return `a63-slot-${templateName}-${key}`
}

function isMultiline(kind: SlotKind): boolean {
  return kind === 'richtext' || kind === 'list'
}

function SlotField({
  templateName,
  slot,
  value,
  onChange,
}: {
  templateName: string
  slot: SlotDef
  value: string
  onChange: (key: string, value: string) => void
}): JSX.Element {
  const id = fieldId(templateName, slot.key)
  const multiline = isMultiline(slot.kind)

  return (
    <div className="a63-form__field">
      <div className="a63-form__label-row">
        <label className="a63-form__label" htmlFor={id}>
          {slot.label}
        </label>
        {slot.required && (
          <span className="a63-form__required" aria-hidden="true">
            *
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          id={id}
          className="a63-form__textarea"
          value={value}
          required={slot.required}
          aria-required={slot.required}
          onChange={e => onChange(slot.key, e.target.value)}
        />
      ) : (
        <input
          type="text"
          id={id}
          className="a63-form__input"
          value={value}
          required={slot.required}
          aria-required={slot.required}
          onChange={e => onChange(slot.key, e.target.value)}
        />
      )}
    </div>
  )
}

export function SlotForm({ name, props, onChange }: SlotFormProps): JSX.Element {
  const tpl = getTemplate(name)

  if (!tpl) {
    return (
      <p className="a63-form__unknown">
        Unknown template: <code>{name}</code>
      </p>
    )
  }

  const slotGroupNames = tpl.slots.map(s => s.name)

  return (
    <div className="a63-form">
      {tpl.props.map(slot => (
        <SlotField
          key={slot.key}
          templateName={name}
          slot={slot}
          value={props[slot.key] ?? ''}
          onChange={onChange}
        />
      ))}
      {slotGroupNames.length > 0 && (
        <p className="a63-form__slots-note">
          Repeatable sections ({slotGroupNames.join(', ')}) are edited in Source.
        </p>
      )}
    </div>
  )
}
