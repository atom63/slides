import { expect, test } from 'vitest'
import { setFrontmatterField } from './frontmatter-edit'

const FM = `---\ntitle: T\ndate: 2026-01-01\n---\n\n<CoverSlide title="x" />\n`

test('sets a new field, preserving the rest byte-for-byte', () => {
  const out = setFrontmatterField(FM, 'theme', 'terminal')
  expect(out).toContain('theme: terminal')
  expect(out).toContain('title: T')
  expect(out.endsWith('<CoverSlide title="x" />\n')).toBe(true)
})

test('replaces an existing field in place', () => {
  const withTheme = setFrontmatterField(FM, 'theme', 'dark')
  const out = setFrontmatterField(withTheme, 'theme', 'neon')
  expect(out).toContain('theme: neon')
  expect(out).not.toContain('theme: dark')
})

test('empty value removes the field', () => {
  const withTheme = setFrontmatterField(FM, 'theme', 'dark')
  const out = setFrontmatterField(withTheme, 'theme', '')
  expect(out).not.toContain('theme:')
  expect(out).toContain('title: T')
})

test('no-op set of the same value reproduces the source byte-for-byte', () => {
  const withTheme = setFrontmatterField(FM, 'theme', 'dark')
  expect(setFrontmatterField(withTheme, 'theme', 'dark')).toBe(withTheme)
})

test('creates a frontmatter block when none exists and value non-empty', () => {
  const out = setFrontmatterField('<CoverSlide title="x" />\n', 'theme', 'bold')
  expect(out.startsWith('---\ntheme: bold\n---\n')).toBe(true)
  expect(out).toContain('<CoverSlide title="x" />')
})

test('empty value with no frontmatter is a no-op', () => {
  const src = '<CoverSlide title="x" />\n'
  expect(setFrontmatterField(src, 'theme', '')).toBe(src)
})

// Edge test: frontmatter value containing a colon (e.g. a URL or label with colon)
test('preserves unrelated lines that contain colons verbatim', () => {
  const src = `---\ntitle: Hello: World\ndate: 2026-01-01\n---\n\nBody\n`
  const out = setFrontmatterField(src, 'theme', 'terminal')
  expect(out).toContain('title: Hello: World')
  expect(out).toContain('theme: terminal')
  expect(out).toContain('date: 2026-01-01')
})

// CRLF fidelity: source with Windows line endings must produce CRLF output
test('preserves CRLF line endings throughout the edited output', () => {
  const src = '---\r\ntitle: T\r\ndate: 2026-01-01\r\n---\r\n\r\n<CoverSlide />\r\n'
  const out = setFrontmatterField(src, 'theme', 'dark')
  // Every line in the frontmatter fence and inserted field must use CRLF
  expect(out).toContain('---\r\n')
  expect(out).toContain('theme: dark\r\n')
  expect(out).toContain('title: T\r\n')
  // No bare LF should appear (all \n should be preceded by \r)
  expect(out).not.toMatch(/(?<!\r)\n/)
})

// BOM fidelity: a leading UTF-8 BOM must survive the edit
test('preserves a leading UTF-8 BOM', () => {
  const BOM = '﻿'
  const src = `${BOM}---\ntitle: T\n---\n\nBody\n`
  const out = setFrontmatterField(src, 'theme', 'neon')
  expect(out.startsWith(BOM)).toBe(true)
  expect(out).toContain('theme: neon')
  expect(out).toContain('title: T')
})
