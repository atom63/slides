import { describe, expect, it } from 'vitest'
import {
  getTemplate,
  listTemplates,
  templateNames,
  templateRegistry,
} from './template-registry'

const EXPECTED_TEMPLATE_NAMES = [
  'CoverSlide',
  'FullBleedSlide',
  'FullBleedCoverSlide',
  'QuoteSlide',
  'SectionSlide',
  'StatementSlide',
  'SplitHalf',
  'ClosingSlide',
  'HeroBento',
  'MediaTrio',
  'StatBento',
  'Collage',
  'QuoteWithMedia',
  'SplitWithStat',
  'TextLead',
  'TimelineBento',
  'FullBleedGallery',
  'ImageSlide',
  'ImageDuoSlide',
  'ImageTrioSlide',
] as const

describe('template registry coverage', () => {
  it('covers exactly the author-facing templates', () => {
    expect(Object.keys(templateRegistry).sort()).toEqual(
      [...EXPECTED_TEMPLATE_NAMES].sort(),
    )
  })

  it('every entry self-reports its own name as the key', () => {
    for (const [key, def] of Object.entries(templateRegistry)) {
      expect(def.name).toBe(key)
    }
  })
})

const VALID_KINDS = new Set(['text', 'richtext', 'media', 'list'])

describe('template registry integrity', () => {
  it('every prop and slot-prop uses a valid kind and a non-empty key', () => {
    for (const def of listTemplates()) {
      for (const p of def.props) {
        expect(p.key.length).toBeGreaterThan(0)
        expect(VALID_KINDS.has(p.kind)).toBe(true)
        expect(typeof p.required).toBe('boolean')
      }
      for (const slot of def.slots) {
        expect(slot.max).toBeGreaterThanOrEqual(slot.min)
        expect(slot.props.length).toBeGreaterThan(0)
        for (const p of slot.props) {
          expect(p.key.length).toBeGreaterThan(0)
          expect(VALID_KINDS.has(p.kind)).toBe(true)
        }
      }
    }
  })

  it('every template has at least one required-or-optional content prop or slot', () => {
    for (const def of listTemplates()) {
      expect(def.props.length + def.slots.length).toBeGreaterThan(0)
    }
  })
})

describe('template registry accessors', () => {
  it('getTemplate returns undefined for an unknown name', () => {
    expect(getTemplate('NopeSlide')).toBeUndefined()
  })

  it('getTemplate returns the entry for a known name', () => {
    const t = getTemplate('CoverSlide')
    expect(t).toBeDefined()
    expect(t?.name).toBe('CoverSlide')
  })

  it('listTemplates returns every registry entry', () => {
    expect(listTemplates()).toHaveLength(templateNames.length)
  })

  it('templateNames matches the registry keys', () => {
    expect([...templateNames].sort()).toEqual(Object.keys(templateRegistry).sort())
  })
})
