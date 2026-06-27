/**
 * Slide Templates
 *
 * Higher-level patterns that compose primitives for common slide layouts.
 * Use these for quick, consistent slides. Use primitives for custom layouts.
 *
 * Template aesthetic: Swiss / International Typographic Style. Flush-left
 * by default, hairline rules as structural chrome, solid color blocks
 * instead of frosted glass, tabular numerals across stats.
 */

import {
  Children,
  type ElementType,
  isValidElement,
  memo,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useSlideRenderMode } from '../stores/render-mode'
import {
  Body,
  Cell,
  Center,
  Display,
  FigureMark,
  Grid,
  Headline,
  Item,
  Label,
  List,
  Quote,
  SectionMarker,
  Spacer,
  Split,
  Stack,
  Subtitle,
  Title,
} from './primitives'

// =============================================================================
// BENTO HELPERS
// =============================================================================

/**
 * Find children whose `type` matches a specific component (slot identity check).
 * Used by compound bento templates to discover their named slots.
 */
function findSlots(children: ReactNode, slotType: ElementType): ReactElement[] {
  return Children.toArray(children).filter(
    (child): child is ReactElement => isValidElement(child) && child.type === slotType
  )
}

/**
 * Detect whether a media src points to a video file.
 */
const VIDEO_RE = /\.(webm|mp4|mov|ogg)(\?|$)/i
function isVideo(src: string): boolean {
  return VIDEO_RE.test(src)
}

/**
 * Renders an image or video that completely fills its parent cell.
 *
 * Bento templates need media to stretch into the full cell bounds (cropping
 * via object-cover) — the standard `<Image>`/`<Video>` primitives use
 * `max-h-full max-w-full` which leaves gaps when content is smaller than
 * the cell. This helper bypasses that with explicit `size-full object-cover`.
 *
 * Optional `figure` renders a mono form-stamp in the top-left corner, and
 * `caption` renders a flush-bottom-left caption block with a hairline
 * above it — both editorial treatments that make media feel "published"
 * instead of decorative.
 */
const BentoMedia = memo(
  ({
    src,
    alt = '',
    figure,
    caption,
  }: {
    src: string
    alt?: string
    figure?: { register: number | string; total?: number | string; prefix?: string }
    caption?: string
  }) => {
    return (
      <div className="relative min-h-0 flex-1 self-stretch overflow-hidden">
        {isVideo(src) ? (
          <video
            autoPlay
            className="absolute inset-0 size-full object-cover"
            loop
            muted
            playsInline
          >
            <source src={src} />
            <track kind="captions" label={alt || 'Slide media'} />
          </video>
        ) : (
          <img
            alt={alt}
            className="absolute inset-0 size-full object-cover"
            height={1080}
            src={src}
            width={1920}
          />
        )}
        {figure && (
          <div className="absolute top-4 left-4 bg-background/80 px-2 py-1 backdrop-blur-sm">
            <FigureMark prefix={figure.prefix} register={figure.register} total={figure.total} />
          </div>
        )}
        {caption && (
          <div className="absolute right-4 bottom-4 left-4 border-white/50 border-t bg-black/50 px-4 pt-3 pb-2 backdrop-blur-sm">
            <span className="font-medium font-mono text-[calc(14px*var(--slide-type-scale,1))] text-white/90 uppercase tracking-[0.15em]">
              {caption}
            </span>
          </div>
        )}
      </div>
    )
  }
)
BentoMedia.displayName = 'BentoMedia'

/**
 * Gallery-style media for Collage — preserves the full image aspect ratio with
 * object-contain so nothing is cropped. Relies on the parent Cell having a
 * muted variant so the empty padding reads as intentional framing.
 */
const CollageMedia = memo(({ src, alt = '' }: { src: string; alt?: string }) => {
  if (isVideo(src)) {
    return (
      <video autoPlay className="size-full object-contain" loop muted playsInline>
        <source src={src} />
        <track kind="captions" label={alt || 'Slide media'} />
      </video>
    )
  }
  return <img alt={alt} className="size-full object-contain" height={1080} src={src} width={1920} />
})
CollageMedia.displayName = 'CollageMedia'

// =============================================================================
// COVER TEMPLATES
// =============================================================================

/**
 * Editorial cover slide — massive wrapping title top-left, optional eyebrow
 * (typically a year or date) top-right, optional credit bottom-left.
 * No subtitle, no badges, no image. Designed to feel like a magazine cover.
 *
 * The title uses the same pixel size as `Display lg` (160px) but semibold
 * weight — Display is decorative/light, the cover is authored.
 *
 * A full-width hairline above the title turns the cover into a masthead.
 */
export function CoverSlide({
  title,
  subtitle,
  eyebrow,
  credit,
  logo,
}: {
  title: string
  /** Optional deck hook — one line under the main title (editorial cover). */
  subtitle?: string
  /** Small text anchored to the top-right corner — typically a year or date. */
  eyebrow?: string
  /** Small text anchored to the bottom-left corner — typically an author credit. */
  credit?: string
  /** Optional brand mark rendered inline just above the title. */
  logo?: ReactNode
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-baseline justify-between gap-8 border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-6">
        <Label>▲ Cover</Label>
        {eyebrow && <Label>{eyebrow}</Label>}
      </div>

      <div className="flex-1" />

      {logo && (
        <>
          {logo}
          <Spacer size="lg" />
        </>
      )}

      <h1 className="min-w-0 max-w-3/4 text-balance break-words font-semibold text-[calc(160px*var(--slide-type-scale,1))] text-foreground leading-[0.85] tracking-[-0.04em]">
        {title}
      </h1>

      {subtitle && (
        <>
          <Spacer size="md" />
          <Body color="muted" size="lg">
            {subtitle}
          </Body>
        </>
      )}

      {credit && (
        <>
          <Spacer size="lg" />
          <div className="border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-4">
            <Label color="muted">{credit}</Label>
          </div>
        </>
      )}
    </div>
  )
}

// =============================================================================
// FULL BLEED TEMPLATE
// =============================================================================

/** Full-bleed media slide — image/video fills the entire canvas.
 *  Optional label+title render in a solid bottom-left block.
 *
 *  The overlay uses a hard-edged black block with white type — no blur,
 *  no transparency, no rounded corners. Swiss posters don't wash titles
 *  over photos; they cut a plate and set them flat. */
export function FullBleedSlide({
  mediaSrc,
  mediaAlt = 'Visual',
  mediaType,
  label,
  title,
}: {
  mediaSrc: string
  mediaAlt?: string
  mediaType?: 'image' | 'video'
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const showVideo = mediaType ? mediaType === 'video' : isVideo(mediaSrc)

  return (
    <div className="absolute inset-0">
      {showVideo ? (
        <video autoPlay className="size-full object-cover" loop muted playsInline>
          <source src={mediaSrc} />
          <track kind="captions" label={mediaAlt} />
        </video>
      ) : (
        <img
          alt={mediaAlt}
          className="size-full object-cover"
          height={800}
          src={mediaSrc}
          width={1200}
        />
      )}
      {(label ?? title) && (
        <div className="absolute bottom-12 left-12 max-w-[70%] bg-black px-10 py-8 text-white">
          <Stack gap="xs">
            {label && (
              <Label color="inherit">
                <span className="text-white/70">{label}</span>
              </Label>
            )}
            {title && (
              <Title color="inherit">
                <span className="text-white">{title}</span>
              </Title>
            )}
          </Stack>
        </div>
      )}
    </div>
  )
}

/**
 * Full-bleed image or video with **cover-style** typography — top masthead band
 * + bottom title plate, both solid black with white type (no blur, no tinted
 * washes). Use for workshop openers, chapter covers, and hero beats where
 * `CoverSlide` (type-only) is too empty but `FullBleedSlide` (small bottom-left
 * caption only) is too little structure.
 *
 * The photo shows in the middle band; keep contrast on the plates only.
 */
export function FullBleedCoverSlide({
  title,
  subtitle,
  eyebrow,
  credit,
  mediaSrc,
  mediaAlt = 'Cover',
  mediaType,
  mastheadLabel = '▲ Cover',
}: {
  title: string
  /** Hook under the main title — muted, like `CoverSlide` subtitle. */
  subtitle?: string
  /** Small text on the top-right of the masthead band (e.g. year, “Workshop”). */
  eyebrow?: string
  /** Credit line in the bottom plate, above a hairline — like `CoverSlide`. */
  credit?: string
  mediaSrc: string
  mediaAlt?: string
  mediaType?: 'image' | 'video'
  /** Left label in the top band; defaults to the deck’s cover glyph. */
  mastheadLabel?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const showVideo = mediaType ? mediaType === 'video' : isVideo(mediaSrc)

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div aria-hidden className="absolute inset-0 z-0">
        {showVideo ? (
          <video autoPlay className="size-full object-cover" loop muted playsInline>
            <source src={mediaSrc} />
            <track kind="captions" label={mediaAlt} />
          </video>
        ) : (
          <img
            alt={mediaAlt}
            className="size-full object-cover"
            height={1080}
            src={mediaSrc}
            width={1920}
          />
        )}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-baseline justify-between gap-6 border-white/20 border-b bg-black px-12 py-5">
          <Label>
            <span className="text-white/85">{mastheadLabel}</span>
          </Label>
          {eyebrow ? (
            <Label>
              <span className="text-white/60">{eyebrow}</span>
            </Label>
          ) : (
            <span className="min-w-0" />
          )}
        </div>

        <div className="min-h-0 flex-1" />

        <div className="shrink-0 border-white/20 border-t bg-black px-12 pt-10 pb-8">
          <h1 className="max-w-[95%] text-balance font-semibold text-[calc(160px*var(--slide-type-scale,1))] text-white leading-[0.88] tracking-[-0.04em]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-[960px] text-pretty text-[calc(36px*var(--slide-type-scale,1))] text-white/72 leading-[1.35]">
              {subtitle}
            </p>
          )}
          {credit && (
            <div className="mt-8 border-white/20 border-t pt-6">
              <Label>
                <span className="text-white/45">{credit}</span>
              </Label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// QUOTE TEMPLATE
// =============================================================================

/**
 * Editorial quote slide — flush-left pull quote, attribution on its own
 * line under a hairline. Previously centered; now composed on the 12-col
 * grid so the quote sits on the same left edge as every other slide.
 */
export function QuoteSlide({ quote, attribution }: { quote: string; attribution?: string }) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  return (
    <div className="flex h-full min-h-0 flex-1 items-center">
      <div className="w-full max-w-[1700px]">
        <Stack gap="xl">
          <div className="border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-6">
            <Label font="mono">◆ Quote</Label>
          </div>
          <p className="max-w-[1600px] text-balance break-words font-instrument-serif text-[calc(96px*var(--slide-type-scale,1))] text-[var(--theme-slide-quote-color,color-mix(in_oklch,var(--foreground)_90%,transparent))] italic leading-[1.1] tracking-[-0.015em]">
            {quote}
          </p>
          {attribution && (
            <div className="flex items-baseline gap-6 border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-4">
              <span className="font-medium font-mono text-[calc(18px*var(--slide-type-scale,1))] text-foreground/40 uppercase tracking-[0.18em]">
                —
              </span>
              <Label color="muted">{attribution}</Label>
            </div>
          )}
        </Stack>
      </div>
    </div>
  )
}

// =============================================================================
// SECTION TEMPLATE
// =============================================================================

type SectionAxis = 'editorial' | 'flush-left' | 'centered'

/**
 * Section title slide.
 *
 *   axis="editorial"  (default when `number` is set) — huge margin numeral
 *                     on the left, headline flush-left in the content area.
 *                     The Müller-Brockmann section marker treatment.
 *   axis="flush-left" — simple flush-left heading, no margin numeral.
 *   axis="centered"   — legacy axial layout.
 *
 * With `imageSrc` the layout always falls into a text-left / media-right
 * split regardless of axis so the rhythm matches `Split` slides.
 */
export function SectionSlide({
  number,
  title,
  subtitle,
  imageSrc,
  imageAlt = 'Section',
  axis,
}: {
  number?: string
  title: string
  subtitle?: string
  imageSrc?: string
  imageAlt?: string
  axis?: SectionAxis
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const resolvedAxis: SectionAxis = axis ?? (number ? 'editorial' : 'flush-left')

  if (imageSrc) {
    return (
      <Split gap="xl" ratio="1/1">
        <div className="flex items-center">
          <Stack gap="none" justify="center">
            {number && (
              <>
                <Label font="mono">■ {number}</Label>
                <Spacer size="md" />
              </>
            )}
            <Headline>{title}</Headline>
            {subtitle && (
              <>
                <Spacer size="md" />
                <Body color="muted" size="lg">
                  {subtitle}
                </Body>
              </>
            )}
          </Stack>
        </div>
        <div className="min-h-0 overflow-hidden">
          <img
            alt={imageAlt}
            className="size-full object-cover"
            height={600}
            src={imageSrc}
            width={800}
          />
        </div>
      </Split>
    )
  }

  if (resolvedAxis === 'editorial' && number) {
    return (
      <Grid cols={12} rows={1} ruled={false}>
        <Cell colSpan={3} colStart={1} padding="none" rowSpan={1} rowStart={1}>
          <SectionMarker caption="Section" number={number} />
        </Cell>
        <Cell colSpan={8} colStart={5} padding="none" rowSpan={1} rowStart={1}>
          <div className="flex h-full flex-col justify-end">
            <div className="border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-6">
              <Stack gap="md">
                <Label font="mono">{`Chapter · ${number}`}</Label>
                <Headline>{title}</Headline>
                {subtitle && (
                  <Body color="muted" size="lg">
                    {subtitle}
                  </Body>
                )}
              </Stack>
            </div>
          </div>
        </Cell>
      </Grid>
    )
  }

  if (resolvedAxis === 'centered') {
    return (
      <Center>
        <Stack align="center" className="max-w-[1200px]" gap="none">
          {number && (
            <>
              <Display align="center" color="secondary" size="md">
                {number}
              </Display>
              <Spacer size="md" />
            </>
          )}
          <Headline align="center">{title}</Headline>
          {subtitle && (
            <>
              <Spacer size="md" />
              <Body align="center" color="muted" size="lg">
                {subtitle}
              </Body>
            </>
          )}
        </Stack>
      </Center>
    )
  }

  return (
    <div className="flex h-full flex-col justify-end">
      <div className="border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-6">
        <Stack gap="md">
          {number && <Label font="mono">■ {number}</Label>}
          <Headline>{title}</Headline>
          {subtitle && (
            <Body color="muted" size="lg">
              {subtitle}
            </Body>
          )}
        </Stack>
      </div>
    </div>
  )
}

// =============================================================================
// STATEMENT + SPLIT HALF (keynote-style rhythm)
// =============================================================================

/**
 * Thesis slide — one headline, optional kicker and subcopy.
 *
 *   axis="flush-left" (default) — Swiss editorial: kicker + headline
 *                     flush to the left, subtitle underneath capped at
 *                     a readable measure. A hairline rule above the
 *                     kicker ties the slide into the deck's frame.
 *   axis="centered"   — legacy axial layout (opt-in only).
 */
export function StatementSlide({
  kicker,
  title,
  subtitle,
  axis = 'flush-left',
}: {
  kicker?: string
  title: string
  subtitle?: string
  axis?: 'flush-left' | 'centered'
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  if (axis === 'centered') {
    return (
      <Center>
        <Stack align="center" className="mx-auto max-w-[1100px] px-2" gap="xl" justify="center">
          {kicker && (
            <Label align="center" color="muted" font="sans">
              {kicker}
            </Label>
          )}
          <Headline align="center">{title}</Headline>
          {subtitle && (
            <Body align="center" color="muted" size="lg">
              {subtitle}
            </Body>
          )}
        </Stack>
      </Center>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 items-center">
      <div className="w-full max-w-[1600px] border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-8">
        <Stack gap="xl">
          {kicker && <Label font="mono">{kicker}</Label>}
          <Headline>{title}</Headline>
          {subtitle && (
            <div className="max-w-[1100px]">
              <Body color="muted" size="lg">
                {subtitle}
              </Body>
            </div>
          )}
        </Stack>
      </div>
    </div>
  )
}

const splitHalfGaps = {
  md: 'gap-6',
  lg: 'gap-10',
  xl: 'gap-16',
} as const

function SplitHalfPanel({
  children,
  justify = 'center',
}: {
  children: ReactNode
  justify?: 'start' | 'center' | 'end'
}) {
  const justifyClass = { start: 'justify-start', center: 'justify-center', end: 'justify-end' }[
    justify
  ]
  return <div className={`flex min-h-0 flex-1 flex-col ${justifyClass}`}>{children}</div>
}

/**
 * Fifty-fifty deck split — vertical (columns) or horizontal (rows).
 * Use two `SplitHalf.Panel` children: narrative vs media, thesis vs proof, etc.
 */
export function SplitHalf({
  children,
  axis = 'vertical',
  gap = 'xl',
  label,
  title,
}: {
  children: ReactNode
  axis?: 'horizontal' | 'vertical'
  gap?: keyof typeof splitHalfGaps
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const panels = findSlots(children, SplitHalfPanel).slice(0, 2)
  const gapClass = splitHalfGaps[gap]
  const gridClass =
    axis === 'vertical'
      ? `grid-cols-2 grid-rows-1 ${gapClass}`
      : `grid-cols-1 grid-rows-2 ${gapClass}`

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-10">
      {(label ?? title) && (
        <div className="shrink-0 border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-4">
          <Stack gap="xs">
            {label && <Label>{label}</Label>}
            {title && <Title>{title}</Title>}
          </Stack>
        </div>
      )}
      <div className={`grid min-h-0 flex-1 ${gridClass} [&>*]:min-h-0`}>{panels}</div>
    </div>
  )
}
SplitHalf.Panel = SplitHalfPanel

// =============================================================================
// CLOSING TEMPLATE
// =============================================================================

interface ClosingContact {
  /** Optional URL. When set, the value renders as an anchor — external
   *  http(s) links open in a new tab; mailto: and tel: open natively. */
  href?: string
  label: string
  value: string
}

const FULLY_QUALIFIED_URL = /^(https?:|mailto:|tel:)/i
const EXTERNAL_URL = /^https?:\/\//i

/** Resolve a bare hostname like "atom63.com" into a full https URL.
 *  Leaves fully-qualified URLs (http/https/mailto/tel) untouched. */
function resolveContactHref(value: string): string {
  if (FULLY_QUALIFIED_URL.test(value)) {
    return value
  }
  return `https://${value}`
}

const isExternalHref = (href: string) => EXTERNAL_URL.test(href)

/** Single colophon entry: small label above, value below. When `href`
 *  is present the value is rendered as a focusable, hover-able anchor
 *  that picks up the deck's signal color. Each entry occupies the same
 *  3-col footprint so the footer reads as a uniform editorial row. */
function ColophonItem({ label, value, href }: { label: string; value: string; href?: string }) {
  const valueClasses =
    'text-pretty break-words font-normal text-[calc(28px*var(--slide-type-scale,1))] leading-[1.45] tabular-nums'
  return (
    <div className="col-span-3 flex flex-col gap-2">
      <Label color="muted" font="sans">
        {label}
      </Label>
      {href ? (
        <a
          className={`${valueClasses} self-start text-foreground decoration-1 underline-offset-[6px] outline-none transition-colors hover:text-[var(--theme-slide-accent,var(--primary))] hover:underline focus-visible:text-[var(--theme-slide-accent,var(--primary))] focus-visible:underline`}
          href={href}
          rel={isExternalHref(href) ? 'noopener' : undefined}
          target={isExternalHref(href) ? '_blank' : undefined}
        >
          {value}
        </a>
      ) : (
        <p className={`${valueClasses} text-foreground`}>{value}</p>
      )}
    </div>
  )
}

/**
 * Editorial closing slide — a deliberate bookend rather than a reversed
 * cover. Title vertically centered so it reads as the final statement,
 * flanked by a giant ▼ glyph acting as a typographic full-stop — part of
 * the deck's primitive-shape vocabulary (▲ cover / ■ section / ◆ quote /
 * ▼ closing). The footer is a tabular colophon — Web / Email / Also —
 * each column labelled and aligned on the 12-col rhythm, so the last
 * page of the deck reads like the colophon of a book.
 */
export function ClosingSlide({
  title,
  eyebrow,
  website,
  email,
  handles,
}: {
  title: string
  /** Small text anchored to the top-right corner (e.g. "2026", "Q&A"). */
  eyebrow?: string
  /** Primary website URL rendered on its own line. */
  website?: string
  /** Contact email rendered below the website. */
  email?: string
  /** Supplementary contacts (handles, sites, tools). Each entry takes
   *  its own labelled column on the colophon row. Pass an `href` to
   *  make the value clickable — `website` and `email` are auto-linked. */
  handles?: ClosingContact[]
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const handleItems = handles ?? []
  const hasContact = Boolean(website || email || handleItems.length > 0)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Masthead band */}
      <div className="flex items-baseline justify-between gap-8 border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-6">
        <Label>▼</Label>
        {eyebrow && <Label>{eyebrow}</Label>}
      </div>

      {/* Body: title on the left, end-mark glyph on the right, vertically centered.
          The giant ▼ visually rhymes with the "▼ Fin" masthead so the page
          reads as unambiguously terminal — the primitive-shape tombstone
          of the deck. */}
      <div className="flex min-h-0 flex-1 items-center gap-12">
        <h1 className="min-w-0 flex-1 text-balance break-words font-semibold text-[calc(160px*var(--slide-type-scale,1))] text-foreground leading-[0.85] tracking-[-0.04em]">
          {title}
        </h1>
        <span
          aria-hidden="true"
          className="shrink-0 self-end pb-10 font-light text-[calc(260px*var(--slide-type-scale,1))] text-foreground/15 leading-[0.8]"
        >
          ▼
        </span>
      </div>

      {/* Colophon footer — every contact (Web, Email, supplementary handles)
          is rendered as a uniform 3-col entry so the footer reads as a
          single editorial row instead of "two columns plus a tag list."
          Hierarchy comes from order (primary first), not weight. */}
      {hasContact && (
        <div className="border-[color:var(--theme-slide-rule-color,color-mix(in_oklch,var(--foreground)_25%,transparent))] border-t-[length:var(--theme-slide-rule-width,1px)] pt-6">
          <div className="grid grid-cols-12 gap-x-6 gap-y-6">
            {website && (
              <ColophonItem href={resolveContactHref(website)} label="Web" value={website} />
            )}
            {email && <ColophonItem href={`mailto:${email}`} label="Email" value={email} />}
            {handleItems.map(h => (
              <ColophonItem href={h.href} key={h.label} label={h.label} value={h.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// BENTO TEMPLATES
// =============================================================================

// ── HeroBento ──────────────────────────────────────────────────────────────
// 1 hero media (left 2/3) + 3 stacked supporting cards (right 1/3).
// Supporting cards use the `rule` variant (top hairline, no backplate) so
// the slide reads as aligned editorial columns rather than a filled
// dashboard grid.

function HeroBentoHero({ src, alt = '' }: { src: string; alt?: string }) {
  return <BentoMedia alt={alt} src={src} />
}

function HeroBentoCard({ title, body }: { title: string; body?: ReactNode }) {
  return (
    <Stack gap="xs" justify="start">
      <Subtitle color="default">{title}</Subtitle>
      {body && <Body size="sm">{body}</Body>}
    </Stack>
  )
}

export function HeroBento({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const heroSlot = findSlots(children, HeroBentoHero).at(0)
  const cardSlots = findSlots(children, HeroBentoCard).slice(0, 3)

  return (
    <Grid cols={12} gap="md" label={label} rows={6} title={title}>
      <Cell colSpan={8} colStart={1} overflow="hidden" padding="none" rowSpan={6} rowStart={1}>
        {heroSlot}
      </Cell>
      {cardSlots.map((card, i) => (
        <Cell
          colSpan={4}
          colStart={9}
          key={`hero-bento-card-${String(i)}`}
          padding="sm"
          rowSpan={2}
          rowStart={i * 2 + 1}
          variant="rule"
        >
          {card}
        </Cell>
      ))}
    </Grid>
  )
}
HeroBento.Hero = HeroBentoHero
HeroBento.Card = HeroBentoCard

// ── MediaTrio ──────────────────────────────────────────────────────────────
// 1 hero media + 2 stacked supporting media. For showcasing variants.
// Grid: 12 cols × 2 rows. Hero = col 1-7 rows 1-2. Media = col 8-12 row 1 / row 2.

function MediaTrioHero({ src, alt = '' }: { src: string; alt?: string }) {
  return <BentoMedia alt={alt} src={src} />
}

function MediaTrioMedia({ src, alt = '' }: { src: string; alt?: string }) {
  return <BentoMedia alt={alt} src={src} />
}

export function MediaTrio({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const heroSlot = findSlots(children, MediaTrioHero).at(0)
  const mediaSlots = findSlots(children, MediaTrioMedia).slice(0, 2)

  return (
    <Grid cols={12} gap="md" label={label} rows={2} title={title}>
      <Cell colSpan={7} colStart={1} overflow="hidden" padding="none" rowSpan={2} rowStart={1}>
        {heroSlot}
      </Cell>
      {mediaSlots.map((media, i) => (
        <Cell
          colSpan={5}
          colStart={8}
          key={`media-trio-${String(i)}`}
          overflow="hidden"
          padding="none"
          rowSpan={1}
          rowStart={i + 1}
        >
          {media}
        </Cell>
      ))}
    </Grid>
  )
}
MediaTrio.Hero = MediaTrioHero
MediaTrio.Media = MediaTrioMedia

// ── StatBento ──────────────────────────────────────────────────────────────
// Narrative body (optional) + up to 6 flat stats in a 3-column grid.
// Stats are chrome-less — numeral + label with a top hairline per cell so
// the row reads as a tabular form, not a dashboard of cards.

function StatBentoBody({ children }: { children: ReactNode }) {
  return (
    <Stack className="max-w-[960px]" gap="md" justify="center">
      <Body color="default" size="lg">
        {children}
      </Body>
    </Stack>
  )
}

function StatBentoStat({ value, label }: { value: string; label: string }) {
  // Stack fills the cell and anchors to the bottom edge — Swiss stat
  // tables read as "numerals rising from a floor" rather than floating.
  return (
    <Stack align="start" className="min-h-0 flex-1" gap="sm" justify="end">
      <Display color="default" size="md" weight="light">
        {value}
      </Display>
      <Body color="muted" size="sm">
        {label}
      </Body>
    </Stack>
  )
}

const DEFAULT_STATS_PER_ROW = 3
const MAX_STATS = 6

export function StatBento({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const bodySlot = findSlots(children, StatBentoBody).at(0)
  const statSlots = findSlots(children, StatBentoStat).slice(0, MAX_STATS)

  // Four stats naturally read as a single tabular row across the slide
  // (12 / 4 = 3 cols each), so we widen the layout instead of wrapping
  // 3 + 1. Three or fewer also fits a single row; five or six wrap to
  // two rows on the default 3-up rhythm.
  const count = statSlots.length
  const columns = count === 4 ? 4 : DEFAULT_STATS_PER_ROW
  const colSpanPer = 12 / columns
  const singleRow = count <= columns
  const rows = 8
  const statRowOffsetBase = bodySlot ? 5 : 1
  const statRowSpan = bodySlot ? (singleRow ? 4 : 2) : singleRow ? 8 : 4

  return (
    <Grid cols={12} label={label} rows={rows} title={title}>
      {bodySlot && (
        <Cell colSpan={8} colStart={1} padding="none" rowSpan={4} rowStart={1}>
          {bodySlot}
        </Cell>
      )}
      {statSlots.map((stat, i) => {
        const row = Math.floor(i / columns)
        const col = i % columns
        return (
          <Cell
            colSpan={colSpanPer}
            colStart={col * colSpanPer + 1}
            key={`stat-bento-${String(i)}`}
            padding="sm"
            rowSpan={statRowSpan}
            rowStart={statRowOffsetBase + row * statRowSpan}
            variant="rule"
          >
            {stat}
          </Cell>
        )
      })}
    </Grid>
  )
}
StatBento.Body = StatBentoBody
StatBento.Stat = StatBentoStat

// ── Collage ────────────────────────────────────────────────────────────────
// 1 featured image + 2–4 supporting images. For brand sheets, identity systems,
// and mixed-aspect galleries. Uses object-contain with hairline-framed cells
// so the full image is visible — the padding reads as intentional framing.

function CollageFeatured({ src, alt = '' }: { src: string; alt?: string }) {
  return <CollageMedia alt={alt} src={src} />
}

function CollageImage({ src, alt = '' }: { src: string; alt?: string }) {
  return <CollageMedia alt={alt} src={src} />
}

export function Collage({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const featuredSlot = findSlots(children, CollageFeatured).at(0)
  const imageSlots = findSlots(children, CollageImage).slice(0, 4)
  const count = imageSlots.length

  if (count >= 4) {
    const positions: { col: number; row: number }[] = [
      { col: 7, row: 1 },
      { col: 10, row: 1 },
      { col: 7, row: 5 },
      { col: 10, row: 5 },
    ]
    return (
      <Grid cols={12} label={label} rows={8} title={title}>
        <Cell colSpan={6} colStart={1} overflow="hidden" rowSpan={8} rowStart={1} variant="frame">
          {featuredSlot}
        </Cell>
        {imageSlots.map((image, i) => {
          const pos = positions[i]
          if (!pos) return null
          return (
            <Cell
              colSpan={3}
              colStart={pos.col}
              key={`collage-4-${String(i)}`}
              overflow="hidden"
              rowSpan={4}
              rowStart={pos.row}
              variant="frame"
            >
              {image}
            </Cell>
          )
        })}
      </Grid>
    )
  }

  if (count === 3) {
    const stacks = [
      { row: 1, span: 3 },
      { row: 4, span: 2 },
      { row: 6, span: 3 },
    ]
    return (
      <Grid cols={12} label={label} rows={8} title={title}>
        <Cell colSpan={8} colStart={1} overflow="hidden" rowSpan={8} rowStart={1} variant="frame">
          {featuredSlot}
        </Cell>
        {imageSlots.map((image, i) => {
          const pos = stacks[i]
          if (!pos) return null
          return (
            <Cell
              colSpan={4}
              colStart={9}
              key={`collage-3-${String(i)}`}
              overflow="hidden"
              rowSpan={pos.span}
              rowStart={pos.row}
              variant="frame"
            >
              {image}
            </Cell>
          )
        })}
      </Grid>
    )
  }

  if (count === 2) {
    return (
      <Grid cols={12} label={label} rows={8} title={title}>
        <Cell colSpan={8} colStart={1} overflow="hidden" rowSpan={8} rowStart={1} variant="frame">
          {featuredSlot}
        </Cell>
        {imageSlots.map((image, i) => (
          <Cell
            colSpan={4}
            colStart={9}
            key={`collage-2-${String(i)}`}
            overflow="hidden"
            rowSpan={4}
            rowStart={i * 4 + 1}
            variant="frame"
          >
            {image}
          </Cell>
        ))}
      </Grid>
    )
  }

  return (
    <Grid cols={12} label={label} rows={8} title={title}>
      <Cell colSpan={12} colStart={1} overflow="hidden" rowSpan={8} rowStart={1} variant="frame">
        {featuredSlot}
      </Cell>
      {imageSlots.map((image, i) => (
        <Cell
          colSpan={12}
          colStart={1}
          key={`collage-1-${String(i)}`}
          overflow="hidden"
          rowSpan={8}
          rowStart={1}
          variant="frame"
        >
          {image}
        </Cell>
      ))}
    </Grid>
  )
}
Collage.Featured = CollageFeatured
Collage.Image = CollageImage

// ── QuoteWithMedia ─────────────────────────────────────────────────────────
// Large quote on the left + supporting media on the right.

function QuoteWithMediaQuote({ text, attribution }: { text: string; attribution?: string }) {
  return (
    <div className="flex h-full items-center">
      <Quote attribution={attribution}>{text}</Quote>
    </div>
  )
}

function QuoteWithMediaMedia({ src, alt = '' }: { src: string; alt?: string }) {
  return <BentoMedia alt={alt} src={src} />
}

export function QuoteWithMedia({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const quoteSlot = findSlots(children, QuoteWithMediaQuote).at(0)
  const mediaSlot = findSlots(children, QuoteWithMediaMedia).at(0)

  return (
    <Grid cols={12} label={label} rows={1} title={title}>
      <Cell colSpan={6} colStart={1} rowSpan={1} rowStart={1}>
        {quoteSlot}
      </Cell>
      <Cell colSpan={6} colStart={7} overflow="hidden" padding="none" rowSpan={1} rowStart={1}>
        {mediaSlot}
      </Cell>
    </Grid>
  )
}
QuoteWithMedia.Quote = QuoteWithMediaQuote
QuoteWithMedia.Media = QuoteWithMediaMedia

// ── SplitWithStat ──────────────────────────────────────────────────────────
// Text + media side-by-side (top 3/4) with a stat strip below (bottom 1/4).
// Stats use the `rule` variant so the strip reads as a form row, not a
// row of cards.

function SplitWithStatText({
  title: cellTitle,
  body,
  bullets,
}: {
  title: string
  body?: ReactNode
  bullets?: string[]
}) {
  return (
    <Stack gap="md" justify="center">
      <Subtitle color="default">{cellTitle}</Subtitle>
      {body && <Body>{body}</Body>}
      {bullets && bullets.length > 0 && (
        <List marker="dash">
          {bullets.map(item => (
            <Item key={item}>{item}</Item>
          ))}
        </List>
      )}
    </Stack>
  )
}

function SplitWithStatMedia({ src, alt = '' }: { src: string; alt?: string }) {
  return <BentoMedia alt={alt} src={src} />
}

function SplitWithStatStat({ value, label }: { value: string; label: string }) {
  return (
    <Stack align="start" gap="xs" justify="start">
      <Display color="default" size="sm" weight="light">
        {value}
      </Display>
      <Label>{label}</Label>
    </Stack>
  )
}

export function SplitWithStat({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const textSlot = findSlots(children, SplitWithStatText).at(0)
  const mediaSlot = findSlots(children, SplitWithStatMedia).at(0)
  const statSlots = findSlots(children, SplitWithStatStat).slice(0, 4)

  return (
    <Grid cols={12} label={label} rows={8} title={title}>
      <Cell colSpan={6} colStart={1} padding="none" rowSpan={6} rowStart={1}>
        {textSlot}
      </Cell>
      <Cell colSpan={6} colStart={7} overflow="hidden" padding="none" rowSpan={6} rowStart={1}>
        {mediaSlot}
      </Cell>
      {statSlots.map((stat, i) => (
        <Cell
          colSpan={3}
          colStart={i * 3 + 1}
          key={`split-stat-${String(i)}`}
          padding="sm"
          rowSpan={2}
          rowStart={7}
          variant="rule"
        >
          {stat}
        </Cell>
      ))}
    </Grid>
  )
}
SplitWithStat.Text = SplitWithStatText
SplitWithStat.Media = SplitWithStatMedia
SplitWithStat.Stat = SplitWithStatStat

// ── TextLead ───────────────────────────────────────────────────────────────
// Single big text block with an optional supporting media row.

function TextLeadText({
  title: cellTitle,
  body,
  bullets,
}: {
  title?: string
  body?: ReactNode
  bullets?: string[]
}) {
  return (
    <Stack className="min-h-0 max-w-[960px] flex-1" gap="md" justify="center">
      {cellTitle && <Subtitle color="default">{cellTitle}</Subtitle>}
      {body && <Body size="lg">{body}</Body>}
      {bullets && bullets.length > 0 && (
        <List marker="dash">
          {bullets.map(item => (
            <Item key={item}>{item}</Item>
          ))}
        </List>
      )}
    </Stack>
  )
}

function TextLeadMedia({ src, alt = '' }: { src: string; alt?: string }) {
  return <BentoMedia alt={alt} src={src} />
}

export function TextLead({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const textSlot = findSlots(children, TextLeadText).at(0)
  const mediaSlots = findSlots(children, TextLeadMedia).slice(0, 3)
  const mediaCount = mediaSlots.length

  if (mediaCount === 0) {
    return (
      <Grid cols={12} label={label} rows={8} title={title}>
        <Cell colSpan={12} colStart={1} padding="none" rowSpan={8} rowStart={1}>
          {textSlot}
        </Cell>
      </Grid>
    )
  }

  if (mediaCount === 1) {
    return (
      <Grid cols={12} label={label} rows={8} title={title}>
        <Cell colSpan={7} colStart={1} padding="none" rowSpan={8} rowStart={1}>
          {textSlot}
        </Cell>
        <Cell colSpan={5} colStart={8} overflow="hidden" padding="none" rowSpan={8} rowStart={1}>
          {mediaSlots[0]}
        </Cell>
      </Grid>
    )
  }

  const mediaColSpan = mediaCount === 2 ? 6 : 4
  return (
    <Grid cols={12} label={label} rows={8} title={title}>
      <Cell colSpan={12} colStart={1} padding="none" rowSpan={5} rowStart={1}>
        {textSlot}
      </Cell>
      {mediaSlots.map((media, i) => (
        <Cell
          colSpan={mediaColSpan}
          colStart={i * mediaColSpan + 1}
          key={`text-lead-media-${String(i)}`}
          overflow="hidden"
          padding="none"
          rowSpan={3}
          rowStart={6}
        >
          {media}
        </Cell>
      ))}
    </Grid>
  )
}
TextLead.Text = TextLeadText
TextLead.Media = TextLeadMedia

// ── TimelineBento ──────────────────────────────────────────────────────────
// Text intro + chronological row of 3 steps. Every cell shares the same
// architecture: a leading glyph at Display sm (72px) — a step numeral
// on phases, an em-dash on the intro — then the title and body below
// it. All four cells center their content vertically within the cell,
// so short and tall stacks both sit on the same mid-line while the
// leading glyphs line up as the dominant visual rhythm across the slide.

function TimelineBentoIntro({ title: cellTitle, body }: { title: string; body?: ReactNode }) {
  return (
    <Stack className="min-h-0 flex-1" gap="md" justify="center">
      <span
        aria-hidden="true"
        className="font-light text-[calc(72px*var(--slide-type-scale,1))] text-foreground/30 leading-[0.85]"
      >
        —
      </span>
      <Subtitle color="default">{cellTitle}</Subtitle>
      {body && <Body size="sm">{body}</Body>}
    </Stack>
  )
}

function TimelineBentoStep({
  step,
  title: cellTitle,
  body,
}: {
  step?: string
  title: string
  body?: ReactNode
}) {
  return (
    <Stack className="min-h-0 flex-1" gap="md" justify="center">
      {step && (
        <Display color="default" size="sm" weight="light">
          {step}
        </Display>
      )}
      <Subtitle>{cellTitle}</Subtitle>
      {body && <Body size="sm">{body}</Body>}
    </Stack>
  )
}

export function TimelineBento({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const introSlot = findSlots(children, TimelineBentoIntro).at(0)
  const stepSlots = findSlots(children, TimelineBentoStep).slice(0, 3)

  // Cells use variant="none" — the per-cell top hairline would compete
  // with the Grid masthead rule up top and the slide-frame chrome, and
  // in a timeline the leading Display numeral is already the strongest
  // signal of "new column". The grid column gutters supply all the
  // separation the row needs.
  return (
    <Grid cols={12} label={label} rows={1} title={title}>
      <Cell colSpan={3} colStart={1} padding="none" rowSpan={1} rowStart={1}>
        {introSlot}
      </Cell>
      {stepSlots.map((step, i) => (
        <Cell
          colSpan={3}
          colStart={4 + i * 3}
          key={`timeline-step-${String(i)}`}
          padding="none"
          rowSpan={1}
          rowStart={1}
        >
          {step}
        </Cell>
      ))}
    </Grid>
  )
}
TimelineBento.Intro = TimelineBentoIntro
TimelineBento.Step = TimelineBentoStep

// ── FullBleedGallery ───────────────────────────────────────────────────────
// Edge-to-edge image grid that bypasses the slide content padding.
// Each cell fills with object-cover. Optional label/title text renders as a
// solid black plate in the top-left — no frosted glass.

function FullBleedGalleryImage({ src, alt = '' }: { src: string; alt?: string }) {
  if (isVideo(src)) {
    return (
      <video autoPlay className="size-full object-cover" loop muted playsInline>
        <source src={src} />
        <track kind="captions" label={alt || 'Slide media'} />
      </video>
    )
  }
  return <img alt={alt} className="size-full object-cover" height={1080} src={src} width={1920} />
}

export function FullBleedGallery({
  children,
  label,
  title,
}: {
  children: ReactNode
  label?: string
  title?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const imageSlots = findSlots(children, FullBleedGalleryImage).slice(0, 6)
  const count = imageSlots.length

  const gridStyle =
    count === 2
      ? {
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr',
        }
      : count === 3
        ? {
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: '1fr',
          }
        : count === 4
          ? {
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
            }
          : {
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: '1fr 1fr',
            }

  const hasOverlay = Boolean(label || title)

  return (
    <div className="absolute inset-0">
      <div className="grid size-full gap-1 p-1" style={gridStyle}>
        {imageSlots.map((image, i) => (
          <div
            className="relative overflow-hidden bg-muted/20"
            key={`full-bleed-gallery-${String(i)}`}
          >
            {image}
          </div>
        ))}
      </div>

      {hasOverlay && (
        <div className="absolute top-8 left-8 max-w-[60%] bg-black px-8 py-6 text-white">
          <Stack gap="xs">
            {label && (
              <Label color="inherit">
                <span className="text-white/70">{label}</span>
              </Label>
            )}
            {title && (
              <Title color="inherit">
                <span className="text-white">{title}</span>
              </Title>
            )}
          </Stack>
        </div>
      )}
    </div>
  )
}
FullBleedGallery.Image = FullBleedGalleryImage

// =============================================================================
// IMAGE-ONLY TEMPLATES
// =============================================================================

function ImageCaption({ text }: { text: string }) {
  return (
    <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-10 py-5 backdrop-blur-lh">
      <Label color="inherit">
        <span className="text-white/80">{text}</span>
      </Label>
    </div>
  )
}

function ImageCell({ src, alt }: { src: string; alt: string }) {
  if (isVideo(src)) {
    return (
      <video autoPlay className="size-full object-cover" loop muted playsInline>
        <source src={src} />
        <track kind="captions" label={alt || 'Slide media'} />
      </video>
    )
  }
  return <img alt={alt} className="size-full object-cover" height={1080} src={src} width={1920} />
}

/**
 * Single full-bleed image. Use when the visual is the entire message.
 * Optional caption renders as a translucent bottom bar.
 */
export function ImageSlide({
  src,
  alt = '',
  caption,
}: {
  src: string
  alt?: string
  /** Short descriptor — renders as a translucent bottom bar. */
  caption?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  return (
    <div className="absolute inset-0 overflow-hidden">
      <ImageCell alt={alt} src={src} />
      {caption && <ImageCaption text={caption} />}
    </div>
  )
}

/**
 * Two images side by side, equal width, full bleed.
 * A hairline gap separates the panels — editorial column rule.
 */
export function ImageDuoSlide({
  left,
  right,
  caption,
}: {
  left: { src: string; alt?: string }
  right: { src: string; alt?: string }
  /** Short descriptor — renders as a translucent bottom bar spanning both images. */
  caption?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="grid size-full grid-cols-2 gap-0.5">
        <div className="overflow-hidden">
          <ImageCell alt={left.alt ?? ''} src={left.src} />
        </div>
        <div className="overflow-hidden">
          <ImageCell alt={right.alt ?? ''} src={right.src} />
        </div>
      </div>
      {caption && <ImageCaption text={caption} />}
    </div>
  )
}

/**
 * Three images in equal columns, full bleed.
 * Accepts 2–3 images; fewer than 3 leaves remaining columns as a muted placeholder.
 */
export function ImageTrioSlide({
  images,
  caption,
}: {
  images: { src: string; alt?: string }[]
  /** Short descriptor — renders as a translucent bottom bar spanning all columns. */
  caption?: string
}) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const slots = images.slice(0, 3)
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="grid size-full grid-cols-3 gap-0.5">
        {slots.map((img, i) => (
          <div className="overflow-hidden" key={`trio-${String(i)}`}>
            <ImageCell alt={img.alt ?? ''} src={img.src} />
          </div>
        ))}
        {slots.length < 3 &&
          Array.from({ length: 3 - slots.length }).map((_, i) => (
            <div className="bg-muted/20" key={`trio-empty-${String(i)}`} />
          ))}
      </div>
      {caption && <ImageCaption text={caption} />}
    </div>
  )
}
