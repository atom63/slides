import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { templateNames } from '../content/template-registry'

// ── Types ──────────────────────────────────────────────────────────────────

export type ParsedSlide =
  | { kind: 'template'; name: string; props: Record<string, string> }
  | { kind: 'opaque'; reason: string }

// ── Internal acorn-jsx parser ──────────────────────────────────────────────

const JsxParser = Parser.extend(jsx())

// ── Helpers ────────────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: acorn AST nodes are untyped
type AnyNode = any

/**
 * Matches a leading ES `import` statement (with or without a trailing
 * semicolon). MDX decks routinely write `import { X } from '...'` with NO
 * semicolon, and acorn does NOT insert one before the following JSX — it
 * throws. We neutralize imports before parsing by replacing each import's
 * characters with EQUAL-LENGTH whitespace (newlines preserved), so the JSX
 * element's source offsets stay identical to the original block — which
 * `serialize-slot` relies on for span-based, byte-preserving edits.
 */
const IMPORT_RE =
  /^[ \t]*import\b[\s\S]*?(?:from\s*['"][^'"]*['"]|['"][^'"]*['"])[ \t]*;?[ \t]*$/gm

function blankImports(block: string): string {
  return block.replace(IMPORT_RE, m => m.replace(/[^\n]/g, ' '))
}

/**
 * Given a parsed block string, return the single JSXElement acorn node if
 * the block contains exactly one JSX expression statement (with any number of
 * leading ImportDeclarations and nothing else). Returns null otherwise.
 *
 * Exported so Task 4 can reuse it (offset-based element finding).
 */
export function findTemplateElement(block: string): AnyNode | null {
  let ast: AnyNode
  try {
    // Blank imports first (offset-preserving) so a semicolon-less import before
    // the JSX doesn't make acorn throw. Offsets remain valid for `block`.
    ast = JsxParser.parse(blankImports(block), { ecmaVersion: 'latest', sourceType: 'module' })
  } catch {
    return null
  }

  const body: AnyNode[] = ast.body

  let jsxElement: AnyNode | null = null

  for (const node of body) {
    if (node.type === 'ImportDeclaration') {
      // allowed — skip
      continue
    }
    if (node.type === 'ExpressionStatement' && node.expression?.type === 'JSXElement') {
      if (jsxElement !== null) {
        // more than one JSX element → opaque
        return null
      }
      jsxElement = node.expression
    } else {
      // unexpected statement type (non-import, non-jsx-expression) → opaque
      return null
    }
  }

  return jsxElement
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Parse one MDX slide block and decide whether it is a known single-element
 * template with all literal-string props (→ "template") or anything else
 * (→ "opaque", edit-in-source only).
 */
export function parseSlide(block: string): ParsedSlide {
  const element = findTemplateElement(block)

  if (element === null) {
    return { kind: 'opaque', reason: 'block contains no single JSX template element' }
  }

  // Resolve component name (must be a plain JSXIdentifier, not a MemberExpression)
  const openingEl = element.openingElement
  const nameNode = openingEl.name
  if (nameNode.type !== 'JSXIdentifier') {
    return { kind: 'opaque', reason: 'JSX element name is not a plain identifier' }
  }
  const componentName: string = nameNode.name

  if (!(templateNames as readonly string[]).includes(componentName)) {
    return { kind: 'opaque', reason: `"${componentName}" is not a registered template` }
  }

  // Require attribute-only / self-closing (no non-whitespace children)
  const children: AnyNode[] = element.children ?? []
  for (const child of children) {
    if (child.type === 'JSXText') {
      // Allow whitespace-only JSXText (newlines, spaces between tags)
      if (child.value.trim() !== '') {
        return { kind: 'opaque', reason: 'element has non-whitespace children' }
      }
    } else {
      // JSXElement, JSXExpressionContainer, JSXFragment, JSXSpreadChild
      return { kind: 'opaque', reason: 'element has non-whitespace children' }
    }
  }

  // Extract props — all must be JSXAttribute with a string Literal value
  const props: Record<string, string> = {}
  const attributes: AnyNode[] = openingEl.attributes ?? []
  for (const attr of attributes) {
    if (attr.type === 'JSXSpreadAttribute') {
      return { kind: 'opaque', reason: 'element has spread attribute' }
    }
    if (attr.type !== 'JSXAttribute') {
      return { kind: 'opaque', reason: 'unexpected attribute node type' }
    }
    const attrName: string = attr.name.name
    const attrValue: AnyNode = attr.value

    // Allow bare boolean shorthand (e.g. `<Foo required />` — value is null)
    // but we only model it as a string flag "true" for now. Actually per spec:
    // only string Literals are permitted; anything else → opaque.
    if (attrValue === null) {
      // bare attribute (boolean shorthand) — not a string literal
      return { kind: 'opaque', reason: `attribute "${attrName}" has no string value (boolean shorthand)` }
    }
    if (attrValue.type !== 'Literal' || typeof attrValue.value !== 'string') {
      return {
        kind: 'opaque',
        reason: `attribute "${attrName}" is not a string literal`,
      }
    }

    props[attrName] = attrValue.value
  }

  return { kind: 'template', name: componentName, props }
}
