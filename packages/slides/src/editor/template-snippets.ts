import {
  listTemplates,
  type SlotDef,
  type SlotGroupDef,
  type TemplateDef,
} from '../content/template-registry'

/**
 * Generates a minimal, paste-ready MDX snippet per template from the engine's
 * registry (`listTemplates()`), mirroring the synthesis logic in
 * `skill/scripts/gen-templates.mjs`. The palette in
 * <DeckEditor> appends `templateSnippets[name]` when a template is clicked.
 *
 * Registry is the single source of truth; snippets cannot drift from the
 * published template props/slots.
 */

const PLACEHOLDER_IMG = '/images/placeholder-1920x1080.webp'

function exampleValue(prop: SlotDef): string {
  switch (prop.kind) {
    case 'media':
      return PLACEHOLDER_IMG
    default:
      // text / richtext / list-as-scalar
      return `${prop.label}…`
  }
}

/** Render the direct-prop attributes for a template's opening tag. */
function renderPropAttrs(props: SlotDef[], indent = '  '): string[] {
  const lines: string[] = []
  for (const prop of props) {
    if (prop.key === 'children') continue
    if (prop.array) {
      if (prop.kind === 'media') {
        lines.push(
          `${indent}${prop.key}={["${PLACEHOLDER_IMG}", "${PLACEHOLDER_IMG}", "${PLACEHOLDER_IMG}"]}`
        )
      } else {
        lines.push(`${indent}${prop.key}={[{ label: "Label", value: "Value", href: "https://…" }]}`)
      }
      continue
    }
    lines.push(`${indent}${prop.key}="${exampleValue(prop)}"`)
  }
  return lines
}

/** Render one compound-slot child element, e.g. `<HeroBento.Card title="…" />`. */
function renderSlotChild(templateName: string, slot: SlotGroupDef): string {
  const attrs: string[] = []
  let childrenText: string | null = null
  for (const prop of slot.props) {
    if (prop.key === 'children') {
      childrenText = `${prop.label}…`
      continue
    }
    if (prop.array) {
      attrs.push(`${prop.key}={[…]}`)
      continue
    }
    const value = prop.kind === 'media' ? PLACEHOLDER_IMG : `${prop.label}…`
    attrs.push(`${prop.key}="${value}"`)
  }
  const tag = `${templateName}.${slot.name}`
  const attrStr = attrs.length ? ` ${attrs.join(' ')}` : ''
  if (childrenText !== null) {
    return `  <${tag}${attrStr}>${childrenText}</${tag}>`
  }
  return `  <${tag}${attrStr} />`
}

/**
 * Synthesize a minimal, valid MDX usage example from a template's schema.
 * - Simple templates → self-closing tag with its props.
 * - Compound templates → open tag + one instance of each slot at `min` (or 1).
 */
export function synthExample(t: TemplateDef): string {
  const hasSlots = t.slots.length > 0
  const propLines = renderPropAttrs(t.props)

  if (!hasSlots) {
    if (propLines.length === 0) return `<${t.name} />`
    return [`<${t.name}`, ...propLines, '/>'].join('\n')
  }

  const open = propLines.length ? [`<${t.name}`, ...propLines, '>'] : [`<${t.name}>`]
  const childLines: string[] = []
  for (const slot of t.slots) {
    const count = Math.min(Math.max(slot.min, 1), 3)
    for (let i = 0; i < count; i++) {
      childLines.push(renderSlotChild(t.name, slot))
    }
  }
  return [...open, ...childLines, `</${t.name}>`].join('\n')
}

/**
 * Wrap a synthesized example as an insertable slide: a leading `---` separator
 * (the engine's slide break) followed by the example, so appending to a deck
 * body always starts a fresh slide.
 */
export function toInsertSnippet(t: TemplateDef): string {
  return `\n---\n\n${synthExample(t)}\n`
}

/** Map of `templateName -> insertable MDX snippet`, built from the live registry. */
export const templateSnippets: Record<string, string> = Object.fromEntries(
  listTemplates().map(t => [t.name, toInsertSnippet(t)])
)
