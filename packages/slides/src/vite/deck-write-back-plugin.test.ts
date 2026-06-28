import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { handleWriteBack } from './deck-write-back-plugin'

test('writes posted body to the configured deck file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'wb-'))
  const deck = join(dir, 'deck.mdx')
  writeFileSync(deck, 'old')
  const res = await handleWriteBack({ deckPath: deck, root: dir }, 'new content')
  expect(res.ok).toBe(true)
  expect(readFileSync(deck, 'utf8')).toBe('new content')
})

test('rejects when resolved deck escapes root', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'wb-'))
  const res = await handleWriteBack({ deckPath: '/etc/passwd', root: dir }, 'x')
  expect(res.ok).toBe(false)
})

test('resolves a relative deckPath against root', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'wb-'))
  writeFileSync(join(dir, 'deck.mdx'), 'old')
  const res = await handleWriteBack({ deckPath: 'deck.mdx', root: dir }, 'next')
  expect(res.ok).toBe(true)
  expect(readFileSync(join(dir, 'deck.mdx'), 'utf8')).toBe('next')
})
