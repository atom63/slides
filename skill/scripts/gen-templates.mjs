#!/usr/bin/env node
/**
 * gen-templates.mjs — regenerates TEMPLATES.md from the live @atom63/slides
 * template registry. Run with `npm run gen` (or `node scripts/gen-templates.mjs`).
 *
 * The registry is the single source of truth: every template's props, compound
 * slots, and a synthesized minimal MDX usage example are emitted here so the
 * reference can never drift from the published engine.
 */

import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listTemplates } from '@atom63/slides'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '..', 'TEMPLATES.md')

/** Human-readable order + heading for each template category. */
const CATEGORY_ORDER = [
  ['cover', 'Cover'],
  ['statement', 'Statement & Section'],
  ['quote', 'Quote'],
  ['media', 'Media'],
  ['gallery', 'Gallery'],
  ['data', 'Data & Stats'],
  ['split', 'Split'],
  ['closing', 'Closing'],
]

/** A representative placeholder value per slot kind, used in MDX examples. */
const PLACEHOLDER_IMG = '/images/placeholder-1920x1080.webp'

function exampleValue(prop) {
  switch (prop.kind) {
    case 'media':
      return PLACEHOLDER_IMG
    case 'list':
      return null // arrays/lists are handled specially in the example synth
    default:
      // text / richtext
      return `${prop.label}…`
  }
}

/** Render the direct-prop attributes for a template's opening tag. */
function renderPropAttrs(props, { indent = '  ' } = {}) {
  const lines = []
  for (const prop of props) {
    if (prop.key === 'children') continue
    // Array scalar props (e.g. ImageTrioSlide.images, ClosingSlide.handles)
    if (prop.array) {
      if (prop.kind === 'media') {
        lines.push(`${indent}${prop.key}={["${PLACEHOLDER_IMG}", "${PLACEHOLDER_IMG}", "${PLACEHOLDER_IMG}"]}`)
      } else {
        lines.push(
          `${indent}${prop.key}={[{ label: "Label", value: "Value", href: "https://…" }]}`,
        )
      }
      continue
    }
    lines.push(`${indent}${prop.key}="${exampleValue(prop)}"`)
  }
  return lines
}

/** Render one compound-slot child element, e.g. <HeroBento.Card title="…" />. */
function renderSlotChild(templateName, slot) {
  const attrs = []
  let childrenText = null
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
 * Synthesize a minimal, valid MDX usage example from the schema.
 * - Simple templates → self-closing tag with its props.
 * - Compound templates → open tag + one instance of each slot at `min` (or 1).
 */
function synthExample(t) {
  const hasSlots = t.slots.length > 0
  const propLines = renderPropAttrs(t.props)

  if (!hasSlots) {
    if (propLines.length === 0) return `<${t.name} />`
    return [`<${t.name}`, ...propLines, '/>'].join('\n')
  }

  const open = propLines.length ? [`<${t.name}`, ...propLines, '>'] : [`<${t.name}>`]
  const childLines = []
  for (const slot of t.slots) {
    // Emit max(min, 1) instances, capped at 3 to keep examples readable.
    const count = Math.min(Math.max(slot.min, 1), 3)
    for (let i = 0; i < count; i++) {
      childLines.push(renderSlotChild(t.name, slot))
    }
  }
  return [...open, ...childLines, `</${t.name}>`].join('\n')
}

function renderPropTable(props) {
  const rows = props
    .filter(p => p.key !== 'children')
    .map(p => {
      const kind = p.array ? `${p.kind}[]` : p.kind
      return `| \`${p.key}\` | ${kind} | ${p.required ? 'yes' : 'no'} | ${p.label} |`
    })
  if (rows.length === 0) return '_No direct props._'
  return ['| Prop | Kind | Required | Label |', '|---|---|---|---|', ...rows].join('\n')
}

function renderSlot(templateName, slot) {
  const cardinality = `${slot.min}..${slot.max}`
  const lines = [`#### \`${templateName}.${slot.name}\` · ${cardinality}`, '']
  const rows = slot.props.map(p => {
    const kind = p.array ? `${p.kind}[]` : p.kind
    return `| \`${p.key}\` | ${kind} | ${p.required ? 'yes' : 'no'} | ${p.label} |`
  })
  lines.push('| Prop | Kind | Required | Label |', '|---|---|---|---|', ...rows, '')
  return lines.join('\n')
}

function renderTemplate(t) {
  const lines = []
  lines.push(`### ${t.name}`)
  lines.push('')
  lines.push(`**${t.label}** · category \`${t.category}\``)
  lines.push('')
  lines.push('**Props**')
  lines.push('')
  lines.push(renderPropTable(t.props))
  lines.push('')
  if (t.slots.length > 0) {
    lines.push('**Slots**')
    lines.push('')
    for (const slot of t.slots) {
      lines.push(renderSlot(t.name, slot))
    }
  }
  lines.push('**Example**')
  lines.push('')
  lines.push('```mdx')
  lines.push(synthExample(t))
  lines.push('```')
  lines.push('')
  return lines.join('\n')
}

function build(templates) {
  const byCategory = new Map()
  for (const t of templates) {
    if (!byCategory.has(t.category)) byCategory.set(t.category, [])
    byCategory.get(t.category).push(t)
  }

  const out = []
  out.push('<!-- GENERATED by scripts/gen-templates.mjs — do not edit by hand. Run `npm run gen`. -->')
  out.push('')
  out.push('# @atom63/slides — Template Reference')
  out.push('')
  out.push(
    `Machine-generated from the live \`@atom63/slides\` template registry (\`listTemplates()\`). ` +
      `Covers all ${templates.length} author-facing templates with their direct props, compound slots ` +
      `(name · \`min..max\` · props), and a minimal MDX usage example synthesized from the schema.`,
  )
  out.push('')
  out.push(
    'Import any template by name from `@atom63/slides`. Replace every `…` placeholder and every ' +
      '`/images/placeholder-1920x1080.webp` with real content before shipping.',
  )
  out.push('')

  // Table of contents.
  out.push('## Templates by category')
  out.push('')
  for (const [cat, heading] of CATEGORY_ORDER) {
    const items = byCategory.get(cat)
    if (!items || items.length === 0) continue
    const names = items.map(t => `\`${t.name}\``).join(', ')
    out.push(`- **${heading}** — ${names}`)
  }
  out.push('')

  for (const [cat, heading] of CATEGORY_ORDER) {
    const items = byCategory.get(cat)
    if (!items || items.length === 0) continue
    out.push(`## ${heading}`)
    out.push('')
    for (const t of items) {
      out.push(renderTemplate(t))
    }
  }

  return `${out.join('\n').trimEnd()}\n`
}

async function main() {
  const templates = listTemplates()
  const md = build(templates)
  await writeFile(OUT, md, 'utf-8')
  console.log(`Wrote ${OUT} — ${templates.length} templates.`)
}

await main()
