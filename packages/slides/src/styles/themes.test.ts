// @vitest-environment node
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { BUILTIN_THEMES } from '../content/themes'

const bundle = readFileSync(new URL('./themes.css', import.meta.url), 'utf8')

test('bundle has an attribute block for every builtin theme', () => {
  for (const name of BUILTIN_THEMES) {
    expect(bundle).toContain(`[data-slides-theme="${name}"]`)
  }
})

test('bundle does not theme via :root (attribute-scoped only)', () => {
  expect(bundle).not.toMatch(/(^|\n)\s*:root\s*\{/)
})

test('any @import url lines precede the first rule block', () => {
  const firstImport = bundle.indexOf('@import')
  const firstBrace = bundle.indexOf('{')
  if (firstImport !== -1) expect(firstImport).toBeLessThan(firstBrace)
})

test('themes.css matches regenerated output (drift guard)', async () => {
  // Dynamically import the generator so this test file stays a plain .ts file
  // and the import path resolves from the repo root regardless of cwd.
  const { generateThemeBundle } = await import(
    /* @vite-ignore */
    new URL('../../scripts/gen-theme-bundle.mjs', import.meta.url).href
  )
  const regenerated: string = generateThemeBundle()
  expect(bundle, 'themes.css is stale — run `node scripts/gen-theme-bundle.mjs`').toBe(regenerated)
})
