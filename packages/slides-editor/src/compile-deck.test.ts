import { describe, expect, it } from 'vitest'
import { compileDeck, parseFrontmatter, stripImports } from './compile-deck'

const SAMPLE = `---
title: Test Deck
date: 2026-06-26
---

import { CoverSlide } from "@atom63/slides"

<CoverSlide title="Hello" subtitle="World" />

---

## A markdown slide

- one
- two
`

describe('stripImports', () => {
  it('removes a single-line bare import', () => {
    const out = stripImports('import { CoverSlide } from "@atom63/slides"\n\n<CoverSlide />')
    expect(out).not.toContain('import')
    expect(out).toContain('<CoverSlide />')
  })

  it('removes a multi-line import specifier block', () => {
    const src = [
      'import {',
      '  CoverSlide,',
      '  StatBento,',
      '} from "@atom63/slides"',
      '',
      'body',
    ].join('\n')
    const out = stripImports(src)
    expect(out).not.toContain('import')
    expect(out).not.toContain('StatBento,')
    expect(out).toContain('body')
  })

  it('does not strip inline "import" words inside prose', () => {
    const out = stripImports('You can import decks at runtime.')
    expect(out).toContain('import decks')
  })
})

describe('parseFrontmatter', () => {
  it('splits a leading YAML frontmatter block from the body', () => {
    const { meta, body } = parseFrontmatter(SAMPLE)
    expect(meta.title).toBe('Test Deck')
    expect(String(body)).not.toContain('title: Test Deck')
    expect(body).toContain('<CoverSlide')
  })

  it('returns empty meta + full source when there is no frontmatter', () => {
    const src = '## Just markdown\n\n- a\n- b'
    const { meta, body } = parseFrontmatter(src)
    expect(meta).toEqual({})
    expect(body).toBe(src)
  })

  it('treats an unterminated fence as body with no frontmatter', () => {
    const src = '---\ntitle: Oops\n\nno closing fence'
    const { meta, body } = parseFrontmatter(src)
    expect(meta).toEqual({})
    expect(body).toBe(src)
  })

  it('does not require a Node Buffer polyfill (browser-safe)', () => {
    // The old Buffer-based frontmatter parser threw "Buffer is not defined" in
    // the browser; the js-yaml-based parser must not reference any Node global.
    expect(() => parseFrontmatter(SAMPLE)).not.toThrow()
  })
})

describe('compileDeck', () => {
  it('returns meta + a Content component for a valid deck', async () => {
    const result = await compileDeck(SAMPLE)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.meta.title).toBe('Test Deck')
      expect(typeof result.Content).toBe('function')
    }
  })

  it('returns an error string for malformed MDX', async () => {
    const result = await compileDeck('<CoverSlide title="unterminated')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(typeof result.error).toBe('string')
      expect(result.error.length).toBeGreaterThan(0)
    }
  })
})
