/**
 * Slide Primitives Library
 *
 * Composable graphic design primitives for building slide layouts.
 * These are the atoms — combine them to create any slide pattern.
 *
 * The deck is tuned for a Swiss / International Typographic Style
 * aesthetic: hard edges, hairline rules as structure, flush-left type,
 * a single signal color used as a block (not a tint), and tabular
 * numerals locked to a shared baseline.
 *
 * Design canvas: 1920×1080 fixed, scaled to fit.
 */

import { Icon as IconifyIcon } from '@iconify/react'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useShikiHighlight } from '../hooks/use-shiki-highlight'
import { useSlidePadding } from '../stores/config-store'

// =============================================================================
// LAYOUT PRIMITIVES
// =============================================================================

type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type AlignOption = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type JustifyOption = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

const gapClasses: Record<GapSize, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-10',
  xl: 'gap-16',
  '2xl': 'gap-24',
}

const alignClasses: Record<AlignOption, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const justifyClasses: Record<JustifyOption, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

const columnsGridClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const

/** Multi-column layout with equal width columns */
export function Columns({
  children,
  count = 2,
  gap = 'lg',
  align = 'stretch',
}: {
  children: ReactNode
  count?: 2 | 3 | 4
  gap?: GapSize
  align?: AlignOption
}) {
  return (
    <div
      className={`grid min-h-0 flex-1 ${columnsGridClasses[count]} ${gapClasses[gap]} ${alignClasses[align]} [&>*]:min-h-0`}
    >
      {children}
    </div>
  )
}

type SplitRatio = '1/1' | '2/1' | '1/2' | '3/1' | '1/3'
type TrioRatio = '1/1/1' | '2/1/1' | '1/2/1' | '1/1/2'

const splitTemplateCols: Record<SplitRatio, string> = {
  '1/1': '6fr 6fr',
  '2/1': '8fr 4fr',
  '1/2': '4fr 8fr',
  '3/1': '9fr 3fr',
  '1/3': '3fr 9fr',
}

const trioTemplateCols: Record<TrioRatio, string> = {
  '1/1/1': '4fr 4fr 4fr',
  '2/1/1': '6fr 3fr 3fr',
  '1/2/1': '3fr 6fr 3fr',
  '1/1/2': '3fr 3fr 6fr',
}

/**
 * Two-up layout on the 12-column master grid. Use this for asymmetric
 * splits (narrative + media, quote + photo, thesis + detail) without
 * writing `colStart` / `colSpan` by hand. The ratio maps to fixed 12-col
 * spans so slides using `Split` always align with slides using `<Grid>`.
 *
 *   1/1 → 6 + 6
 *   2/1 → 8 + 4
 *   1/2 → 4 + 8
 *   3/1 → 9 + 3
 *   1/3 → 3 + 9
 *
 * Pass two direct children; extra children are ignored.
 */
export function Split({
  children,
  ratio = '1/1',
  gap = 'lg',
  align = 'stretch',
}: {
  children: ReactNode
  ratio?: SplitRatio
  gap?: GapSize
  align?: AlignOption
}) {
  return (
    <div
      className={`grid min-h-0 flex-1 ${gapClasses[gap]} ${alignClasses[align]} [&>*]:min-h-0 [&>*]:min-w-0`}
      style={{ gridTemplateColumns: splitTemplateCols[ratio] }}
    >
      {children}
    </div>
  )
}

/**
 * Three-up layout on the 12-column master grid. Same rhythm rules as
 * `Split` — ratios resolve to 12-col spans so trios align with the rest
 * of the deck.
 *
 *   1/1/1 → 4 + 4 + 4
 *   2/1/1 → 6 + 3 + 3
 *   1/2/1 → 3 + 6 + 3
 *   1/1/2 → 3 + 3 + 6
 */
export function Trio({
  children,
  ratio = '1/1/1',
  gap = 'lg',
  align = 'stretch',
}: {
  children: ReactNode
  ratio?: TrioRatio
  gap?: GapSize
  align?: AlignOption
}) {
  return (
    <div
      className={`grid min-h-0 flex-1 ${gapClasses[gap]} ${alignClasses[align]} [&>*]:min-h-0 [&>*]:min-w-0`}
      style={{ gridTemplateColumns: trioTemplateCols[ratio] }}
    >
      {children}
    </div>
  )
}

/**
 * CSS Grid foundation — the slide master grid.
 *
 * Every slide in the deck uses a shared **12-column** horizontal rhythm.
 * This is what makes paging through the deck feel like one authored
 * object instead of loose artboards: titles, media edges, and stat
 * columns all snap to the same vertical lines slide-to-slide.
 *
 * Rows adapt to content (6 for three-up bentos, 8 for stat grids, etc.)
 * but `cols` should stay at 12 unless you're writing a one-off full-bleed
 * layout. If you find yourself overriding `cols`, consider whether the
 * layout belongs behind a template instead.
 *
 * A Title rendered by `Grid` sits under a top hairline rule so the
 * slide header reads as a Swiss editorial masthead.
 */
export function Grid({
  children,
  cols = 12,
  rows = 8,
  gap,
  label,
  title,
  ruled = true,
}: {
  children: ReactNode
  cols?: number
  rows?: number
  gap?: GapSize
  label?: string
  title?: string
  /** Draw the masthead hairline above label/title. Default true. */
  ruled?: boolean
}) {
  const configPadding = useSlidePadding()
  const resolvedGap: GapSize = gap ?? configPadding
  const hasHeader = Boolean(label || title)
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${gapClasses.md}`}>
      {hasHeader && (
        <div
          className={`shrink-0 ${ruled ? 'border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-4' : ''}`}
        >
          <Stack gap="xs">
            {label && <Label>{label}</Label>}
            {title && <Title>{title}</Title>}
          </Stack>
        </div>
      )}
      <div
        className={`grid min-h-0 flex-1 transition-[gap] duration-300 ease-out ${gapClasses[resolvedGap]} [&>*]:min-h-0`}
        style={{
          gridTemplateColumns: `repeat(${String(cols)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(rows)}, minmax(0, 1fr))`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

type CellVariant = 'none' | 'muted' | 'outline' | 'accent' | 'rule' | 'frame' | 'solid'
type CellPadding = 'none' | 'sm' | 'md' | 'lg'
type CellOverflow = 'hidden' | 'visible'

const cellVariantClasses: Record<CellVariant, string> = {
  none: '',
  muted: 'bg-[color-mix(in_oklch,var(--theme-slide-surface,var(--card))_60%,transparent)]',
  outline: 'border border-foreground/20',
  frame: 'border border-foreground/20',
  rule: 'border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)]',
  accent:
    'bg-[var(--theme-slide-accent,var(--primary))] text-[var(--theme-slide-accent-foreground,var(--primary-foreground))]',
  solid: 'bg-foreground text-background',
}

const cellPaddingClasses: Record<CellPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-10',
}

/**
 * A cell inside a `Grid`. Place via colStart/rowStart and span via colSpan/rowSpan.
 *
 * Variant vocabulary (Swiss-first):
 *   none     — no chrome, just layout
 *   rule     — top hairline only, transparent bg (the default bento treatment)
 *   frame    — 1px hairline on all four sides, transparent bg
 *   outline  — legacy alias for `frame`
 *   muted    — filled plate (use sparingly, for dense data cells)
 *   accent   — solid signal-color block with inverted text
 *   solid    — solid foreground block with inverted text
 *
 * Corners are square by default — pass `rounded` for the exception.
 */
export function Cell({
  children,
  colSpan,
  rowSpan,
  colStart,
  rowStart,
  variant = 'none',
  padding,
  overflow = 'hidden',
  rounded = false,
}: {
  children: ReactNode
  colSpan?: number
  rowSpan?: number
  colStart?: number
  rowStart?: number
  variant?: CellVariant
  padding?: CellPadding
  overflow?: CellOverflow
  rounded?: boolean
}) {
  const configPadding = useSlidePadding()
  const resolvedPadding: CellPadding = padding ?? configPadding

  // `rule` needs its own top padding so the text sits inside the rule,
  // not flush against the edge.
  const rulePadTop = variant === 'rule' ? 'pt-5' : ''

  const overflowClass = overflow === 'hidden' ? 'overflow-hidden' : 'overflow-visible'
  const roundedClass = rounded ? 'rounded-xl' : ''

  const clampedColSpan = colSpan === undefined ? undefined : Math.max(1, colSpan)
  const clampedRowSpan = rowSpan === undefined ? undefined : Math.max(1, rowSpan)

  const style: CSSProperties = {
    gridColumnStart: colStart,
    gridRowStart: rowStart,
    gridColumnEnd: clampedColSpan ? `span ${String(clampedColSpan)}` : undefined,
    gridRowEnd: clampedRowSpan ? `span ${String(clampedRowSpan)}` : undefined,
  }

  return (
    <div
      className={`flex min-h-0 flex-col transition-[padding] duration-300 ease-out ${cellVariantClasses[variant]} ${cellPaddingClasses[resolvedPadding]} ${rulePadTop} ${roundedClass} ${overflowClass}`}
      style={style}
    >
      {children}
    </div>
  )
}

/** Vertical stack with consistent spacing */
export function Stack({
  children,
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className = '',
}: {
  children: ReactNode
  gap?: GapSize
  align?: AlignOption
  justify?: JustifyOption
  className?: string
}) {
  return (
    <div
      className={`flex flex-col ${gapClasses[gap]} ${alignClasses[align]} ${justifyClasses[justify]} ${className}`}
    >
      {children}
    </div>
  )
}

/** Horizontal row with alignment control */
export function Row({
  children,
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
}: {
  children: ReactNode
  gap?: GapSize
  align?: AlignOption
  justify?: JustifyOption
  wrap?: boolean
}) {
  return (
    <div
      className={`flex ${wrap ? 'flex-wrap' : ''} ${gapClasses[gap]} ${alignClasses[align]} ${justifyClasses[justify]}`}
    >
      {children}
    </div>
  )
}

/** Center content on both axes */
export function Center({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 items-center justify-center">{children}</div>
}

const spacerSizeClasses: Record<GapSize, string> = {
  none: 'h-0',
  xs: 'h-2',
  sm: 'h-4',
  md: 'h-6',
  lg: 'h-10',
  xl: 'h-16',
  '2xl': 'h-24',
}

/** Explicit whitespace — use for intentional spacing */
export function Spacer({ size = 'lg' }: { size?: GapSize }) {
  return <div className={spacerSizeClasses[size]} />
}

// =============================================================================
// TYPOGRAPHY PRIMITIVES
// =============================================================================

type TextAlign = 'left' | 'center' | 'right'
type TextColor = 'default' | 'secondary' | 'muted' | 'accent' | 'inherit'
type TextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold'

const textAlignClasses: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const textColorClasses: Record<TextColor, string> = {
  default: 'text-foreground',
  secondary: 'text-foreground/55',
  muted: 'text-[var(--theme-slide-muted,var(--muted-foreground))]',
  accent: 'text-[var(--theme-slide-accent,var(--primary))]',
  inherit: '',
}

const textWeightClasses: Record<TextWeight, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

/**
 * Type ramp — role-first. Pick the primitive by what the text *is*
 * (annotation, sub-head, slide title, stat, pull quote), not by size.
 * Size props exist only where the role legitimately has tiers.
 *
 * Ramp:
 *   Label        18   mono/sans medium, upper, tracked   — annotation / eyebrow
 *   Mono         20 / 28 / 40                             — inline technical
 *   Body         22 / 28 / 36                             — paragraphs
 *   Subtitle     44   sans medium                         — sub-head under Title
 *   Quote        40 / 72   serif italic                   — pull quote (sm inline, lg full-slide)
 *   Title        72   sans medium                         — slide head (content below)
 *   Display      72 / 112 / 180   sans light              — hero numerals / decorative words
 *   Headline     128   sans medium                        — full-slide statement
 *
 * Weight discipline: Swiss hierarchy is driven by weight shifts within a
 * shared size more than by size itself. The `weight` prop on Body /
 * Subtitle / Title lets you go from light to medium without changing the
 * pixel height. All numerals render tabular so stat rows align digit-for-
 * digit down the page.
 */

const displaySizeClasses = {
  sm: 'text-[calc(72px*var(--slide-type-scale,1))]',
  md: 'text-[calc(112px*var(--slide-type-scale,1))]',
  lg: 'text-[calc(180px*var(--slide-type-scale,1))]',
} as const

const displayWeightClasses = {
  extralight: 'font-extralight',
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
} as const

const bodySizeClasses = {
  sm: 'text-[calc(22px*var(--slide-type-scale,1))] leading-[1.5]',
  md: 'text-[calc(28px*var(--slide-type-scale,1))] leading-[1.45]',
  lg: 'text-[calc(36px*var(--slide-type-scale,1))] leading-[1.35]',
} as const

const monoSizeClasses = {
  sm: 'text-[calc(20px*var(--slide-type-scale,1))]',
  md: 'text-[calc(28px*var(--slide-type-scale,1))]',
  lg: 'text-[calc(40px*var(--slide-type-scale,1))]',
} as const

/**
 * Hero numeral / single-word text. Light + tight tracking signals
 * decorative, not authored. Use for big stats or one-word statements.
 */
export function Display({
  children,
  align = 'left',
  color = 'default',
  size = 'lg',
  weight = 'light',
}: {
  children: ReactNode
  align?: TextAlign
  color?: TextColor
  size?: 'sm' | 'md' | 'lg'
  weight?: 'extralight' | 'light' | 'regular' | 'medium'
}) {
  return (
    <div
      className={`text-balance break-words tabular-nums leading-[0.85] tracking-[-0.035em] ${displayWeightClasses[weight]} ${displaySizeClasses[size]} ${textAlignClasses[align]} ${textColorClasses[color]}`}
    >
      {children}
    </div>
  )
}

/**
 * Full-slide statement headline. Use when the whole slide is one
 * sentence (keynote thesis, section opener). Always 128px.
 */
export function Headline({
  children,
  align = 'left',
  color = 'default',
  weight = 'medium',
}: {
  children: ReactNode
  align?: TextAlign
  color?: TextColor
  weight?: 'light' | 'regular' | 'medium' | 'semibold'
}) {
  return (
    <div
      className={`text-balance break-words text-[calc(128px*var(--slide-type-scale,1))] leading-[0.95] tracking-[-0.025em] ${textWeightClasses[weight]} ${textAlignClasses[align]} ${textColorClasses[color]}`}
    >
      {children}
    </div>
  )
}

/**
 * Slide title. Use when the slide has supporting content below a heading.
 * Always 72px. Defaults to medium — bump to semibold for covers.
 */
export function Title({
  children,
  align = 'left',
  color = 'default',
  weight = 'medium',
}: {
  children: ReactNode
  align?: TextAlign
  color?: TextColor
  weight?: 'light' | 'regular' | 'medium' | 'semibold'
}) {
  return (
    <div
      className={`text-balance break-words text-[calc(72px*var(--slide-type-scale,1))] leading-[1.05] tracking-[-0.02em] ${textWeightClasses[weight]} ${textAlignClasses[align]} ${textColorClasses[color]}`}
    >
      {children}
    </div>
  )
}

/**
 * Sub-head under a Title, or a section label that still needs to read
 * as type (not a Label). Always 44px. Color defaults to foreground —
 * pass `color="muted"` for quieter sub-heads.
 */
export function Subtitle({
  children,
  align = 'left',
  color = 'default',
  weight = 'regular',
}: {
  children: ReactNode
  align?: TextAlign
  color?: TextColor
  weight?: 'light' | 'regular' | 'medium' | 'semibold'
}) {
  return (
    <div
      className={`text-balance break-words text-[calc(44px*var(--slide-type-scale,1))] leading-[1.15] tracking-[-0.015em] ${textWeightClasses[weight]} ${textAlignClasses[align]} ${textColorClasses[color]}`}
    >
      {children}
    </div>
  )
}

/** Paragraph text. `md` is the default — go sm for dense cells, lg for emphasis. */
export function Body({
  children,
  align = 'left',
  color = 'secondary',
  size = 'md',
  weight = 'regular',
  reveal,
  index,
}: {
  children: ReactNode
  align?: TextAlign
  color?: TextColor
  size?: 'sm' | 'md' | 'lg'
  weight?: 'light' | 'regular' | 'medium' | 'semibold'
  reveal?: boolean
  index?: number
}) {
  return (
    <div
      className={`text-pretty break-words ${reveal ? 'reveal' : ''} ${textWeightClasses[weight]} ${bodySizeClasses[size]} ${textAlignClasses[align]} ${textColorClasses[color]}`}
      style={
        reveal && index !== undefined
          ? ({ '--stagger-index': String(index) } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  )
}

/**
 * Renders a body string that may contain `\n` line breaks as separate
 * `<Body>` paragraphs with a gap between them. Use this instead of
 * `<Body>{string}</Body>` whenever the text comes from a template prop.
 */
export function BodyLines({
  children,
  size = 'md',
  color = 'secondary',
}: {
  children: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'muted' | 'secondary' | 'accent' | 'inherit'
}) {
  const lines = useMemo(
    () => children.split('\n').filter(line => line.trim().length > 0),
    [children]
  )
  if (lines.length <= 1) {
    return (
      <Body color={color} size={size}>
        {children}
      </Body>
    )
  }
  return (
    <Stack gap="sm">
      {lines.map((line, i) => (
        <Body color={color} key={`${String(i)}-${line.slice(0, 32)}`} size={size}>
          {line}
        </Body>
      ))}
    </Stack>
  )
}

/**
 * Small uppercase annotation. One size only (18px). Use for eyebrows,
 * figure captions, section markers, attribution lines.
 *
 * `orientation="vertical"` sets the label in the margin, running
 * bottom-to-top — the Swiss gutter label treatment.
 */
export function Label({
  children,
  align = 'left',
  color = 'muted',
  font = 'mono',
  orientation = 'horizontal',
  reveal,
  index,
}: {
  children: ReactNode
  align?: TextAlign
  color?: TextColor
  font?: 'mono' | 'sans'
  orientation?: 'horizontal' | 'vertical'
  reveal?: boolean
  index?: number
}) {
  const fontClass = font === 'mono' ? 'font-mono' : 'font-sans'
  const orientClass =
    orientation === 'vertical' ? '[writing-mode:vertical-rl] [transform:rotate(180deg)]' : ''
  return (
    <span
      className={`font-medium text-[calc(18px*var(--slide-type-scale,1))] uppercase tabular-nums tracking-[0.18em] ${reveal ? 'reveal' : ''} ${fontClass} ${orientClass} ${textAlignClasses[align]} ${textColorClasses[color]}`}
      style={
        reveal && index !== undefined
          ? ({ '--stagger-index': String(index) } as CSSProperties)
          : undefined
      }
    >
      {children}
    </span>
  )
}

/**
 * Inline content highlight. `text-primary` is reserved for content
 * emphasis — if you want a ghost tint, use `text-foreground/XX` directly.
 */
export function Accent({
  children,
  color = 'accent',
}: {
  children: ReactNode
  color?: 'accent' | 'default'
}) {
  return (
    <span
      className={`font-semibold ${color === 'accent' ? 'text-[var(--theme-slide-accent,var(--primary))]' : 'text-foreground'}`}
    >
      {children}
    </span>
  )
}

/** Inline monospace for numbers, code, technical content. */
export function Mono({
  children,
  size = 'md',
}: {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  return <span className={`font-mono tabular-nums ${monoSizeClasses[size]}`}>{children}</span>
}

/**
 * Inline code token for use inside Body or template body props.
 * Uses `em`-relative sizing so it scales with whatever Body size it sits in.
 */
export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-foreground/10 px-[0.3em] py-[0.1em] font-mono text-[0.85em] text-foreground/90">
      {children}
    </code>
  )
}

const quoteTextClasses = {
  sm: 'text-[calc(40px*var(--slide-type-scale,1))] leading-[1.35]',
  lg: 'text-[calc(72px*var(--slide-type-scale,1))] leading-[1.15] tracking-[-0.01em]',
} as const

const quoteGlyphClasses = {
  sm: 'absolute -top-12 -left-8 text-[calc(200px*var(--slide-type-scale,1))]',
  lg: 'absolute -top-[120px] -left-10 text-[calc(240px*var(--slide-type-scale,1))]',
} as const

/**
 * Pull quote. `sm` for inline quotes inside a content slide, `lg` for a
 * full-slide pull quote.
 *
 * The decorative open-quote glyph is positioned with a negative offset
 * so it sits just outside the text block — beautiful inline but liable
 * to clip when the quote is placed in the left column of a slide.
 * Pass `decorated={false}` to suppress the glyph (the Swiss editorial
 * treatment) and rely on rules + attribution to signal "quote".
 */
export function Quote({
  children,
  attribution,
  size = 'sm',
  decorated = true,
}: {
  children: ReactNode
  attribution?: string
  size?: 'sm' | 'lg'
  decorated?: boolean
}) {
  return (
    <blockquote className="wrap-break-word relative max-w-[1200px]">
      {decorated && (
        <span
          aria-hidden="true"
          className={`${quoteGlyphClasses[size]} font-instrument-serif text-foreground/10 leading-none`}
        >
          &ldquo;
        </span>
      )}
      <div
        className={`relative text-pretty font-instrument-serif text-[var(--theme-slide-quote-color,color-mix(in_oklch,var(--foreground)_90%,transparent))] italic ${quoteTextClasses[size]}`}
      >
        {children}
      </div>
      {attribution && (
        <footer className="mt-10 flex items-center gap-4">
          <div className="h-px w-16 bg-foreground/25" />
          <Label color="muted">{attribution}</Label>
        </footer>
      )}
    </blockquote>
  )
}

// =============================================================================
// MEDIA PRIMITIVES
// =============================================================================

type ObjectFit = 'cover' | 'contain' | 'fill'
type AspectRatio = '16/9' | '4/3' | '1/1' | 'auto'

const aspectRatioClasses: Record<Exclude<AspectRatio, 'auto'>, string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
}

const mediaFitClasses: Record<ObjectFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
}

const iconSizes = { sm: 24, md: 48, lg: 72, xl: 96 } as const

const avatarSizeClasses = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-32',
  xl: 'size-48',
} as const

// Inner component so the hook is always called unconditionally.
function SlideCodeBlockRuntime({ code, language }: { code: string; language: string }) {
  const html = useShikiHighlight(code, language)
  if (!html) {
    return (
      <pre className="overflow-x-auto p-6">
        <code className="font-mono text-foreground/40">{code}</code>
      </pre>
    )
  }
  return (
    <div
      className="[&_pre]:overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-6"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted Shiki output
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Syntax-highlighted code block sized for the slide canvas.
 *
 * Two usage modes:
 *   - Fenced code blocks in MDX (```tsx) render through this automatically via
 *     the `pre` override in slideMdxComponents — pass nothing, `children` carries
 *     the already-highlighted rehype-pretty-code output.
 *   - Explicit JSX usage: pass a `code` string prop and Shiki highlights it at
 *     runtime using the github-dark-dimmed theme.
 *
 * Font scales with --slide-type-scale like all other slide typography.
 */
export function SlideCodeBlock({
  children,
  language = 'tsx',
  code,
  dataTheme,
}: {
  children?: ReactNode
  language?: string
  /** Plain code string — triggers runtime Shiki highlighting. */
  code?: string
  /** Forwarded from rehype-pretty-code's data-theme on the original <pre>. */
  dataTheme?: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[color:var(--theme-slide-code-border,color-mix(in_oklch,var(--foreground)_10%,transparent))] bg-[var(--theme-slide-code-bg,var(--card))] font-mono leading-[1.65] [--code-size:calc(20px*var(--slide-type-scale,1))] [font-size:var(--code-size)]">
      {language && (
        <div className="border-[color:var(--theme-slide-code-border,color-mix(in_oklch,var(--foreground)_10%,transparent))] border-b px-5 py-2.5">
          <span className="font-mono text-[calc(11px*var(--slide-type-scale,1))] text-muted-foreground uppercase tracking-[0.12em]">
            {language}
          </span>
        </div>
      )}
      {code !== undefined ? (
        <SlideCodeBlockRuntime code={code} language={language} />
      ) : (
        <pre
          className="overflow-x-auto p-6 [&_code]:bg-transparent [&_code]:p-0 [&_code]:font-[inherit] [&_code]:leading-[inherit]"
          data-theme={dataTheme}
        >
          {children}
        </pre>
      )}
    </div>
  )
}

/** Image with fit modes and optional aspect-ratio container. Square corners by default. */
export function Image({
  src,
  alt,
  fit = 'contain',
  rounded = false,
  aspectRatio,
  className,
  caption,
}: {
  src: string
  alt: string
  fit?: ObjectFit
  rounded?: boolean
  aspectRatio?: AspectRatio
  className?: string
  caption?: string
}) {
  const useFixedRatio = aspectRatio && aspectRatio !== 'auto'
  const sizeClasses = useFixedRatio ? 'size-full' : 'max-h-full max-w-full'
  const roundedClass = rounded ? 'rounded-xl' : ''

  const img = (
    <img
      alt={alt}
      className={`${sizeClasses} ${mediaFitClasses[fit]} ${roundedClass} ${className ?? ''}`}
      height={800}
      src={src}
      width={1200}
    />
  )

  const media = useFixedRatio ? (
    <div
      className={`min-h-0 w-full overflow-hidden ${aspectRatioClasses[aspectRatio]} ${roundedClass}`}
    >
      {img}
    </div>
  ) : (
    img
  )

  if (!caption) return media

  return (
    <figure className="flex min-h-0 flex-col gap-3">
      {media}
      <figcaption className="font-medium font-mono text-[calc(18px*var(--slide-type-scale,1))] text-muted-foreground uppercase tabular-nums tracking-[0.18em]">
        {caption}
      </figcaption>
    </figure>
  )
}

/**
 * Video with autoplay/loop and optional aspect-ratio container.
 *
 * Play/pause is driven by IntersectionObserver so the video only runs when
 * its slide is visible. On exit the video pauses and resets to the start so
 * revisiting the slide always replays from the beginning — standard
 * presentation behavior. `autoPlay={false}` on the HTML element prevents
 * the browser from playing before visibility is confirmed.
 */
export function Video({
  src,
  fit = 'contain',
  rounded = false,
  aspectRatio,
  autoPlay = true,
  loop = true,
  muted = true,
  poster,
  caption,
}: {
  src: string
  fit?: ObjectFit
  rounded?: boolean
  aspectRatio?: AspectRatio
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  /** Static frame shown while the video is loading or the slide is off-screen. */
  poster?: string
  caption?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!(video && autoPlay)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch((_err: unknown) => {
            /* autoplay blocked by browser policy */
          })
        } else {
          video.pause()
          video.currentTime = 0
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [autoPlay])

  const useFixedRatio = aspectRatio && aspectRatio !== 'auto'
  const sizeClasses = useFixedRatio ? 'size-full' : 'max-h-full max-w-full'
  const roundedClass = rounded ? 'rounded-xl' : ''

  const videoEl = (
    <video
      autoPlay={false}
      className={`${sizeClasses} ${mediaFitClasses[fit]} ${roundedClass}`}
      loop={loop}
      muted={muted}
      playsInline
      poster={poster}
      preload="metadata"
      ref={videoRef}
    >
      <source src={src} />
      <track default kind="captions" srcLang="en" />
    </video>
  )

  const media = useFixedRatio ? (
    <div
      className={`min-h-0 w-full overflow-hidden ${aspectRatioClasses[aspectRatio]} ${roundedClass}`}
    >
      {videoEl}
    </div>
  ) : (
    videoEl
  )

  if (!caption) return media

  return (
    <figure className="flex min-h-0 flex-col gap-3">
      {media}
      <figcaption className="font-medium font-mono text-[calc(18px*var(--slide-type-scale,1))] text-muted-foreground uppercase tabular-nums tracking-[0.18em]">
        {caption}
      </figcaption>
    </figure>
  )
}

/** Material icon at slide scale */
export function Icon({
  name,
  size = 'md',
  color = 'default',
}: {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: TextColor
}) {
  const px = iconSizes[size]
  return (
    <IconifyIcon
      aria-hidden
      className={textColorClasses[color]}
      height={px}
      icon={`material-symbols:${name.replace(/_/g, '-')}-rounded`}
      width={px}
    />
  )
}

/** Circular avatar image. Avatars are the one primitive that stays rounded — intentional human marker. */
export function Avatar({
  src,
  alt,
  size = 'md',
}: {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  return (
    <img
      alt={alt}
      className={`rounded-full object-cover ${avatarSizeClasses[size]}`}
      height={192}
      src={src}
      width={192}
    />
  )
}

// =============================================================================
// VISUAL PRIMITIVES
// =============================================================================

type BoxVariant = 'default' | 'muted' | 'outline' | 'accent' | 'solid'

const boxVariantClasses: Record<BoxVariant, string> = {
  default: 'bg-[var(--theme-slide-surface,var(--card))]',
  muted: 'bg-muted/50',
  outline: 'border border-foreground/20',
  accent:
    'bg-[var(--theme-slide-accent,var(--primary))] text-[var(--theme-slide-accent-foreground,var(--primary-foreground))]',
  solid: 'bg-foreground text-background',
}

const boxPaddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-10',
} as const

const badgeVariantClasses = {
  muted: 'bg-muted text-muted-foreground',
  accent:
    'bg-[var(--theme-slide-accent,var(--primary))] text-[var(--theme-slide-accent-foreground,var(--primary-foreground))]',
  outline: 'border border-foreground/25 text-foreground',
  solid: 'bg-foreground text-background',
} as const

const highlightVariantClasses = {
  accent:
    'bg-[var(--theme-slide-accent,var(--primary))] text-[var(--theme-slide-accent-foreground,var(--primary-foreground))]',
  muted: 'bg-muted/30 border border-foreground/15',
  frame: 'border border-foreground/25',
} as const

const colorBlockColorClasses = {
  primary:
    'bg-[var(--theme-slide-accent,var(--primary))] text-[var(--theme-slide-accent-foreground,var(--primary-foreground))]',
  foreground: 'bg-foreground text-background',
} as const

const colorBlockPaddingClasses = {
  none: 'p-0',
  sm: 'px-4 py-2',
  md: 'px-8 py-4',
  lg: 'px-12 py-6',
} as const

/** Container with background/border/padding. Square corners by default. */
export function Box({
  children,
  variant = 'default',
  padding = 'md',
  rounded = false,
  className = '',
}: {
  children: ReactNode
  variant?: BoxVariant
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: boolean
  className?: string
}) {
  return (
    <div
      className={`${boxVariantClasses[variant]} ${boxPaddingClasses[padding]} ${rounded ? 'rounded-xl' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

const dividerThickness = { thin: 1, thick: 2 } as const
const dividerColorClasses = {
  accent: 'bg-[var(--theme-slide-accent,var(--primary))]',
  default: 'bg-foreground',
  muted: 'bg-foreground/20',
} as const

/** Horizontal or vertical rule. Accent is a solid 2px signal-color bar. */
export function Divider({
  direction = 'horizontal',
  color = 'muted',
  weight = 'thin',
}: {
  direction?: 'horizontal' | 'vertical'
  color?: 'muted' | 'accent' | 'default'
  weight?: 'thin' | 'thick'
}) {
  const px = dividerThickness[weight]
  const bg = dividerColorClasses[color]

  if (direction === 'vertical') {
    return <div className={`h-full ${bg}`} style={{ width: px }} />
  }

  return <div className={`w-full ${bg}`} style={{ height: px }} />
}

/** Small square tag. Shares type sizing with `Label` (18px) so a Badge
 *  beside a Label reads on the same baseline. Hard-edged, hairline-framed —
 *  the Swiss form-tag treatment. */
export function Badge({
  children,
  variant = 'muted',
}: {
  children: ReactNode
  variant?: 'muted' | 'accent' | 'outline' | 'solid'
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 font-medium font-mono text-[calc(18px*var(--slide-type-scale,1))] uppercase tabular-nums tracking-[0.12em] ${badgeVariantClasses[variant]}`}
    >
      {children}
    </span>
  )
}

/** Framed highlight block — hairline on all sides, no fill tint. Accent swaps to a solid signal-color block. */
export function Highlight({
  children,
  variant = 'accent',
}: {
  children: ReactNode
  variant?: 'accent' | 'muted' | 'frame'
}) {
  return <div className={`p-8 ${highlightVariantClasses[variant]}`}>{children}</div>
}

/**
 * Solid color block. Full-bleed primary / foreground rectangle — use
 * behind a word of Headline or a stat numeral for the Müller-Brockmann
 * "color plate" move. Accepts children so text sits on the block with
 * inverted color.
 */
export function ColorBlock({
  children,
  color = 'primary',
  padding = 'md',
  className = '',
}: {
  children?: ReactNode
  color?: 'primary' | 'foreground'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <span
      className={`inline-block ${colorBlockColorClasses[color]} ${colorBlockPaddingClasses[padding]} ${className}`}
    >
      {children}
    </span>
  )
}

const padFigure = (v: number | string) => (typeof v === 'number' ? String(v).padStart(2, '0') : v)

/**
 * Editorial form-stamp for media and data cells. Renders "FIG. 03 / 14"
 * or any register/total pair in mono tabular nums. Use absolutely
 * positioned inside a cell, or inline above a caption.
 */
export function FigureMark({
  register,
  total,
  prefix = 'FIG.',
  className = '',
}: {
  register: number | string
  total?: number | string
  prefix?: string
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-baseline gap-2 font-medium font-mono text-[calc(14px*var(--slide-type-scale,1))] text-foreground/70 uppercase tabular-nums tracking-[0.2em] ${className}`}
    >
      <span>{prefix}</span>
      <span>{padFigure(register)}</span>
      {total !== undefined && (
        <>
          <span className="text-foreground/30">/</span>
          <span className="text-foreground/50">{padFigure(total)}</span>
        </>
      )}
    </span>
  )
}

/**
 * Large margin numeral — the Müller-Brockmann section marker. Renders a
 * giant extralight numeral pushed off to one side with a vertical
 * orientation. Place inside a 2-column slice on the outer edge of a
 * slide.
 *
 *   <SectionMarker number="03" caption="Foundations" />
 */
export function SectionMarker({
  number,
  caption,
  side = 'left',
}: {
  number: string
  caption?: string
  side?: 'left' | 'right'
}) {
  const alignClass = side === 'left' ? 'items-start' : 'items-end'
  return (
    <div className={`flex h-full flex-col justify-between ${alignClass}`}>
      <Label color="muted" orientation="vertical">
        {caption ?? '■'}
      </Label>
      <span className="font-light text-[calc(280px*var(--slide-type-scale,1))] text-foreground tabular-nums leading-[0.8] tracking-[-0.05em]">
        {number}
      </span>
    </div>
  )
}

// =============================================================================
// LIST PRIMITIVES
// =============================================================================

const listMarkerClasses = {
  dash: '[&_li]:before:content-["—"] [&_li]:before:text-foreground/30 [&_li]:before:mr-4',
  number:
    '[counter-reset:item] [&_li]:before:content-[counter(item,decimal-leading-zero)] [&_li]:[counter-increment:item] [&_li]:before:text-foreground/40 [&_li]:before:mr-6 [&_li]:before:font-mono [&_li]:before:tabular-nums [&_li]:before:text-[calc(18px*var(--slide-type-scale,1))] [&_li]:before:tracking-[0.15em]',
  bullet:
    '[&_li]:before:content-["•"] [&_li]:before:text-[var(--theme-slide-accent,var(--primary))] [&_li]:before:mr-4',
  none: '',
} as const

/** Styled list with custom markers. Numbered lists use tabular mono for Swiss register. */
export function List({
  children,
  marker = 'dash',
  gap = 'md',
}: {
  children: ReactNode
  marker?: 'dash' | 'number' | 'bullet' | 'none'
  gap?: GapSize
}) {
  return (
    <ul
      className={`flex flex-col ${gapClasses[gap]} ${listMarkerClasses[marker]} [&_li]:flex [&_li]:items-baseline`}
      data-marker={marker}
    >
      {children}
    </ul>
  )
}

/** List item — use inside List. Size matches `Body` md so inline body
 *  text and list items read on the same baseline. */
export function Item({
  children,
  reveal,
  index,
}: {
  children: ReactNode
  reveal?: boolean
  index?: number
}) {
  return (
    <li
      className={`text-pretty text-[calc(28px*var(--slide-type-scale,1))] text-foreground/70 leading-[1.45] ${reveal ? 'reveal' : ''}`}
      style={
        reveal && index !== undefined
          ? ({ '--stagger-index': String(index) } as CSSProperties)
          : undefined
      }
    >
      {children}
    </li>
  )
}

// =============================================================================
// UTILITY
// =============================================================================

/**
 * Entrance animation wrapper. Wraps any content in a div that animates in
 * when the slide becomes visible. Set `index` for staggered sequences.
 *
 * ```mdx
 * <Reveal index={0}>First item</Reveal>
 * <Reveal index={1}>Second item</Reveal>
 * ```
 */
export function Reveal({ children, index }: { children: ReactNode; index?: number }) {
  return (
    <div
      className="reveal"
      style={
        index !== undefined ? ({ '--stagger-index': String(index) } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  )
}

/** Full-bleed container that breaks out of padding */
export function Bleed({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0 flex items-center justify-center">{children}</div>
}

/** Flex grow to push content */
export function Fill() {
  return <div className="flex-1" />
}

/**
 * Live — renders a React component at natural browser scale inside a slide.
 *
 * The slide canvas (1920×1080) is shrunk via `transform: scale(s)` in
 * SlideStage. `Live` counter-acts that with `zoom: 1/s` (precomputed by
 * SlideStage as `--slide-stage-zoom`) so components render at their
 * natural CSS pixel size regardless of the window size.
 *
 * Size components with explicit CSS dimensions or Tailwind size utilities
 * (e.g. `w-96`, `max-w-lg`). The parent `<Demo>` frame clips overflow and
 * centers the content. Slide typography primitives (Headline, Body, etc.)
 * are isolated via `--slide-type-scale: 0`.
 *
 * ```mdx
 * <Demo aspectRatio="16/9">
 *   <Carousel className="max-w-lg">…</Carousel>
 * </Demo>
 * ```
 */
export function Live({ children }: { children: ReactNode }) {
  return (
    <div
      style={
        {
          zoom: 'var(--slide-stage-zoom, 1)',
          '--slide-type-scale': '0',
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}
Live.displayName = 'Live'

/**
 * Demo — renders an interactive React component inside an ExampleContainer-
 * style frame (dot-grid background, border, rounded corners) sized like an
 * image slot on a slide.
 *
 * The component always renders at natural browser scale regardless of the
 * slide stage zoom (via the `Live` counter-scale technique). The frame
 * matches the proportions and layout behaviour of `<Image>`.
 *
 * ```mdx
 * {/* Same panel slot as <Image> *\/}
 * <Demo aspectRatio="16/9">
 *   <Carousel className="w-full h-full">…</Carousel>
 * </Demo>
 *
 * {/* Framed component showcase with breathing room *\/}
 * <Demo aspectRatio="4/3" padding="md" label="Hover state">
 *   <MyButton />
 * </Demo>
 * ```
 */
const demoPaddingValues = { none: '0px', sm: '12px', md: '20px', lg: '32px' } as const

export function Demo({
  children,
  aspectRatio = '16/9',
  padding = 'none',
  label,
}: {
  children: ReactNode
  /** CSS aspect-ratio — same ergonomics as the `aspectRatio` prop on `<Image>`. Defaults to `"16/9"`. */
  aspectRatio?: string
  /** Inset padding inside the frame before the component renders. */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Optional figure caption rendered below the frame. */
  label?: string
}) {
  const pad = demoPaddingValues[padding]

  return (
    <figure style={{ width: '100%', margin: 0 }}>
      {/* Frame — dot-grid chrome matching ExampleContainer */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio,
          overflow: 'hidden',
        }}
      >
        {/* Content area — Live handles its own centering internally */}
        <div
          className="flex items-center justify-center"
          style={{ position: 'absolute', inset: 0, padding: pad }}
        >
          <Live>{children}</Live>
        </div>
      </div>

      {label && (
        <figcaption
          style={
            {
              marginTop: '10px',
              fontSize: 'calc(13px * var(--slide-stage-scale, 1))',
              color: 'var(--muted-foreground)',
              '--slide-type-scale': '0',
            } as CSSProperties
          }
        >
          {label}
        </figcaption>
      )}
    </figure>
  )
}
Demo.displayName = 'Demo'

/** Custom positioning wrapper */
export function Position({
  children,
  top,
  right,
  bottom,
  left,
}: {
  children: ReactNode
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
}) {
  const style: CSSProperties = {
    position: 'absolute',
    top,
    right,
    bottom,
    left,
  }

  return <div style={style}>{children}</div>
}
