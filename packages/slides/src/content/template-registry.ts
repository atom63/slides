/** The kind of fillable content a slot accepts. Layout enums are out of scope. */
export type SlotKind = 'text' | 'richtext' | 'media' | 'list'

/** A single fillable field — a direct template prop or a compound-slot prop. */
export interface SlotDef {
  /** Prop name as written in MDX/JSX. */
  key: string
  kind: SlotKind
  required: boolean
  /** Human-readable label for editor UIs. */
  label: string
  /**
   * True when the prop is a repeated scalar value that is NOT a compound child
   * (e.g. ImageTrioSlide.images, ClosingSlide.handles). Repeated compound
   * children (e.g. HeroBento.Card) are modeled via SlotGroupDef, not this flag.
   */
  array?: boolean
}

/** A compound child slot, e.g. `HeroBento.Card`, with cardinality + its own props. */
export interface SlotGroupDef {
  /** Sub-component name as written after the dot, e.g. "Card" for HeroBento.Card. */
  name: string
  min: number
  max: number
  props: SlotDef[]
}

export type TemplateCategory =
  | 'cover'
  | 'statement'
  | 'quote'
  | 'media'
  | 'gallery'
  | 'data'
  | 'split'
  | 'closing'

/** Full machine-readable description of one author-facing template. */
export interface TemplateDef {
  /** Component name as written in MDX, e.g. "HeroBento". */
  name: string
  label: string
  category: TemplateCategory
  /** Direct props on the template component. */
  props: SlotDef[]
  /** Compound child slots; empty for simple templates. */
  slots: SlotGroupDef[]
}

/** Registry of every author-facing template, keyed by component name. */
export const templateRegistry: Record<string, TemplateDef> = {
  CoverSlide: {
    name: 'CoverSlide',
    label: 'Editorial cover',
    category: 'cover',
    props: [
      { key: 'title', kind: 'text', required: true, label: 'Title' },
      { key: 'subtitle', kind: 'richtext', required: false, label: 'Subtitle' },
      { key: 'eyebrow', kind: 'text', required: false, label: 'Eyebrow' },
      { key: 'credit', kind: 'text', required: false, label: 'Credit' },
      { key: 'logo', kind: 'richtext', required: false, label: 'Logo' },
    ],
    slots: [],
  },
  FullBleedSlide: {
    name: 'FullBleedSlide',
    label: 'Full-bleed media',
    category: 'media',
    props: [
      { key: 'mediaSrc', kind: 'media', required: true, label: 'Media' },
      { key: 'mediaAlt', kind: 'text', required: false, label: 'Media alt text' },
      { key: 'label', kind: 'text', required: false, label: 'Caption label' },
      { key: 'title', kind: 'text', required: false, label: 'Caption title' },
    ],
    slots: [],
  },
  FullBleedCoverSlide: {
    name: 'FullBleedCoverSlide',
    label: 'Full-bleed cover',
    category: 'cover',
    props: [
      { key: 'title', kind: 'text', required: true, label: 'Title' },
      { key: 'subtitle', kind: 'richtext', required: false, label: 'Subtitle' },
      { key: 'eyebrow', kind: 'text', required: false, label: 'Eyebrow' },
      { key: 'credit', kind: 'text', required: false, label: 'Credit' },
      { key: 'mediaSrc', kind: 'media', required: true, label: 'Background media' },
      { key: 'mediaAlt', kind: 'text', required: false, label: 'Media alt text' },
      { key: 'mastheadLabel', kind: 'text', required: false, label: 'Masthead label' },
    ],
    slots: [],
  },
  QuoteSlide: {
    name: 'QuoteSlide',
    label: 'Editorial quote',
    category: 'quote',
    props: [
      { key: 'quote', kind: 'richtext', required: true, label: 'Quote' },
      { key: 'attribution', kind: 'text', required: false, label: 'Attribution' },
    ],
    slots: [],
  },
  SectionSlide: {
    name: 'SectionSlide',
    label: 'Section divider',
    category: 'statement',
    props: [
      { key: 'number', kind: 'text', required: false, label: 'Section number' },
      { key: 'title', kind: 'text', required: true, label: 'Title' },
      { key: 'subtitle', kind: 'richtext', required: false, label: 'Subtitle' },
      { key: 'imageSrc', kind: 'media', required: false, label: 'Image' },
      { key: 'imageAlt', kind: 'text', required: false, label: 'Image alt text' },
    ],
    slots: [],
  },
  StatementSlide: {
    name: 'StatementSlide',
    label: 'Statement / thesis',
    category: 'statement',
    props: [
      { key: 'kicker', kind: 'text', required: false, label: 'Kicker' },
      { key: 'title', kind: 'text', required: true, label: 'Title' },
      { key: 'subtitle', kind: 'richtext', required: false, label: 'Subtitle' },
    ],
    slots: [],
  },
  SplitHalf: {
    name: 'SplitHalf',
    label: '50/50 split',
    category: 'split',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Panel',
        min: 0,
        max: 2,
        props: [{ key: 'children', kind: 'richtext', required: true, label: 'Panel content' }],
      },
    ],
  },
  ClosingSlide: {
    name: 'ClosingSlide',
    label: 'Closing / colophon',
    category: 'closing',
    props: [
      { key: 'title', kind: 'text', required: true, label: 'Title' },
      { key: 'eyebrow', kind: 'text', required: false, label: 'Eyebrow' },
      { key: 'website', kind: 'text', required: false, label: 'Website' },
      { key: 'email', kind: 'text', required: false, label: 'Email' },
      { key: 'handles', kind: 'list', required: false, label: 'Contact handles', array: true },
    ],
    slots: [],
  },
  HeroBento: {
    name: 'HeroBento',
    label: 'Hero + cards',
    category: 'media',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Hero',
        min: 0,
        max: 1,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
      {
        name: 'Card',
        min: 0,
        max: 3,
        props: [
          { key: 'title', kind: 'text', required: true, label: 'Card title' },
          { key: 'body', kind: 'richtext', required: false, label: 'Card body' },
        ],
      },
    ],
  },
  MediaTrio: {
    name: 'MediaTrio',
    label: 'Hero + two media',
    category: 'media',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Hero',
        min: 0,
        max: 1,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
      {
        name: 'Media',
        min: 0,
        max: 2,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
    ],
  },
  StatBento: {
    name: 'StatBento',
    label: 'Narrative + stats',
    category: 'data',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Body',
        min: 0,
        max: 1,
        props: [{ key: 'children', kind: 'richtext', required: true, label: 'Body' }],
      },
      {
        name: 'Stat',
        min: 0,
        max: 6,
        props: [
          { key: 'value', kind: 'text', required: true, label: 'Value' },
          { key: 'label', kind: 'text', required: true, label: 'Label' },
        ],
      },
    ],
  },
  Collage: {
    name: 'Collage',
    label: 'Featured + crops',
    category: 'gallery',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Featured',
        min: 0,
        max: 1,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
      {
        name: 'Image',
        min: 0,
        max: 4,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
    ],
  },
  QuoteWithMedia: {
    name: 'QuoteWithMedia',
    label: 'Quote + media',
    category: 'quote',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Quote',
        min: 0,
        max: 1,
        props: [
          { key: 'text', kind: 'richtext', required: true, label: 'Quote' },
          { key: 'attribution', kind: 'text', required: false, label: 'Attribution' },
        ],
      },
      {
        name: 'Media',
        min: 0,
        max: 1,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
    ],
  },
  SplitWithStat: {
    name: 'SplitWithStat',
    label: 'Text + media + stats',
    category: 'data',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Text',
        min: 0,
        max: 1,
        props: [
          { key: 'title', kind: 'text', required: true, label: 'Title' },
          { key: 'body', kind: 'richtext', required: false, label: 'Body' },
          { key: 'bullets', kind: 'list', required: false, label: 'Bullets', array: true },
        ],
      },
      {
        name: 'Media',
        min: 0,
        max: 1,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
      {
        name: 'Stat',
        min: 0,
        max: 4,
        props: [
          { key: 'value', kind: 'text', required: true, label: 'Value' },
          { key: 'label', kind: 'text', required: true, label: 'Label' },
        ],
      },
    ],
  },
  TextLead: {
    name: 'TextLead',
    label: 'Text lead + media',
    category: 'media',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Text',
        min: 0,
        max: 1,
        props: [
          { key: 'title', kind: 'text', required: false, label: 'Title' },
          { key: 'body', kind: 'richtext', required: false, label: 'Body' },
          { key: 'bullets', kind: 'list', required: false, label: 'Bullets', array: true },
        ],
      },
      {
        name: 'Media',
        min: 0,
        max: 3,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
    ],
  },
  TimelineBento: {
    name: 'TimelineBento',
    label: 'Timeline steps',
    category: 'data',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Masthead label' },
      { key: 'title', kind: 'text', required: false, label: 'Masthead title' },
    ],
    slots: [
      {
        name: 'Intro',
        min: 0,
        max: 1,
        props: [
          { key: 'title', kind: 'text', required: true, label: 'Title' },
          { key: 'body', kind: 'richtext', required: false, label: 'Body' },
        ],
      },
      {
        name: 'Step',
        min: 0,
        max: 3,
        props: [
          { key: 'step', kind: 'text', required: false, label: 'Step number' },
          { key: 'title', kind: 'text', required: true, label: 'Title' },
          { key: 'body', kind: 'richtext', required: false, label: 'Body' },
        ],
      },
    ],
  },
  FullBleedGallery: {
    name: 'FullBleedGallery',
    label: 'Full-bleed gallery',
    category: 'gallery',
    props: [
      { key: 'label', kind: 'text', required: false, label: 'Overlay label' },
      { key: 'title', kind: 'text', required: false, label: 'Overlay title' },
    ],
    slots: [
      {
        name: 'Image',
        min: 0,
        max: 6,
        props: [
          { key: 'src', kind: 'media', required: true, label: 'Image' },
          { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
        ],
      },
    ],
  },
  ImageSlide: {
    name: 'ImageSlide',
    label: 'Single image',
    category: 'media',
    props: [
      { key: 'src', kind: 'media', required: true, label: 'Image' },
      { key: 'alt', kind: 'text', required: false, label: 'Alt text' },
      { key: 'caption', kind: 'text', required: false, label: 'Caption' },
    ],
    slots: [],
  },
  ImageDuoSlide: {
    name: 'ImageDuoSlide',
    label: 'Two images',
    category: 'media',
    props: [
      { key: 'left', kind: 'media', required: true, label: 'Left image' },
      { key: 'right', kind: 'media', required: true, label: 'Right image' },
      { key: 'caption', kind: 'text', required: false, label: 'Caption' },
    ],
    slots: [],
  },
  ImageTrioSlide: {
    name: 'ImageTrioSlide',
    label: 'Three images',
    category: 'gallery',
    props: [
      { key: 'images', kind: 'media', required: true, label: 'Images', array: true },
      { key: 'caption', kind: 'text', required: false, label: 'Caption' },
    ],
    slots: [],
  },
}

/** Union of every registered template name, derived from the registry. */
export type TemplateName = keyof typeof templateRegistry

/** All registered template names. */
export const templateNames: readonly TemplateName[] = Object.keys(templateRegistry) as TemplateName[]

/** Look up one template definition by component name. */
export function getTemplate(name: string): TemplateDef | undefined {
  return templateRegistry[name]
}

/** Every template definition, insertion order. */
export function listTemplates(): TemplateDef[] {
  return Object.values(templateRegistry)
}
