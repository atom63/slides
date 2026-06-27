import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'
import { mdxComponents } from './vendored-mdx-components'

/**
 * MDX component map for content inside `<Syllabus>` blocks.
 *
 * Spreads `mdxComponents` as the base (tables, code blocks with copy button,
 * links, kbd, strong, em, details/summary, images, etc.) and overrides only
 * what genuinely differs for a reading panel:
 * — Headings: document scale (mdxComponents uses text-5xl/3xl for article pages)
 * — Prose (p, ul, ol, li): serif body + compact rhythm
 * — Blockquote: reading-mode style
 * — img: compact vertical rhythm (my-4 vs my-10)
 * — Slide typography primitives → document-scale equivalents
 */

const syllabusBody = 'text-[0.9375rem] leading-[1.7] text-foreground/90'

// =============================================================================
// SLIDE PRIMITIVE → DOCUMENT-SCALE OVERRIDES
// =============================================================================

function SyllabusBody({ children }: { children?: ReactNode }) {
  return (
    <p className={cn(syllabusBody, 'my-3 text-pretty first:mt-0 last:mb-0 [&+&]:mt-2')}>
      {children}
    </p>
  )
}

function SyllabusHeadline({ children }: { children?: ReactNode }) {
  return (
    <h1 className="mt-6 mb-3 text-balance font-semibold text-2xl text-foreground tracking-tight first:mt-0 sm:text-[1.65rem]">
      {children}
    </h1>
  )
}

function SyllabusTitle({ children }: { children?: ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 text-balance font-semibold text-foreground text-xl tracking-tight sm:text-[1.35rem]">
      {children}
    </h2>
  )
}

function SyllabusSubtitle({ children }: { children?: ReactNode }) {
  return (
    <h3 className="mt-6 mb-2 text-balance font-medium text-foreground text-lg tracking-tight">
      {children}
    </h3>
  )
}

function SyllabusDisplay({ children }: { children?: ReactNode }) {
  return (
    <div className="my-4 text-balance font-light text-2xl text-foreground tabular-nums tracking-tight sm:text-3xl">
      {children}
    </div>
  )
}

function SyllabusLabel({ children }: { children?: ReactNode }) {
  return (
    <span className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-wider">
      {children}
    </span>
  )
}

function SyllabusMono({ children }: { children?: ReactNode }) {
  return <span className="font-mono text-foreground/90 text-sm tabular-nums">{children}</span>
}

function SyllabusAccent({ children }: { children?: ReactNode }) {
  return <span className="font-semibold text-primary">{children}</span>
}

interface SyllabusQuoteProps {
  attribution?: string
  children?: ReactNode
  decorated?: boolean
  size?: 'lg' | 'sm'
}

function SyllabusQuote({ children, attribution }: SyllabusQuoteProps) {
  return (
    <blockquote className="my-6 border-foreground/20 border-l-2 pl-4">
      <p className="text-pretty text-foreground/90 text-lg italic leading-relaxed md:text-xl">
        {children}
      </p>
      {attribution ? (
        <footer className="mt-3 text-muted-foreground text-sm not-italic">— {attribution}</footer>
      ) : null}
    </blockquote>
  )
}

const listGap = { sm: 'space-y-1', md: 'space-y-1.5', lg: 'space-y-2' } as const

function SyllabusList({
  children,
  marker = 'dash',
  gap = 'md',
}: {
  children?: ReactNode
  gap?: keyof typeof listGap
  marker?: 'bullet' | 'dash' | 'none' | 'number'
}) {
  const gapClass = listGap[gap] ?? listGap.md
  if (marker === 'none') {
    return <ul className={cn(syllabusBody, 'my-3 list-none pl-0', gapClass)}>{children}</ul>
  }
  if (marker === 'number') {
    return (
      <ol
        className={cn(
          syllabusBody,
          'my-3 list-decimal pl-6',
          gapClass,
          'marker:font-mono marker:text-muted-foreground/60 marker:text-sm marker:tabular-nums'
        )}
      >
        {children}
      </ol>
    )
  }
  return (
    <ul
      className={cn(syllabusBody, 'my-3 list-disc pl-6 marker:text-muted-foreground/60', gapClass)}
    >
      {children}
    </ul>
  )
}

function SyllabusItem({ children }: { children?: ReactNode }) {
  return <li className={cn(syllabusBody, '[&_p]:my-1')}>{children}</li>
}

// =============================================================================
// COMPONENT MAP
// =============================================================================

export const syllabusMdxComponents = {
  // All common HTML elements (tables, code blocks with copy button, links, kbd,
  // strong, em, details/summary, misc semantics, media) from the shared map.
  ...mdxComponents,

  // Headings: document scale — mdxComponents uses text-5xl/3xl for article pages,
  // and h6 adds a dropdown Icon that doesn't belong in a reading context.
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mt-6 mb-3 text-balance font-semibold text-2xl text-foreground tracking-tight first:mt-0 sm:text-[1.65rem]"
      {...props}
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-8 mb-3 text-balance font-semibold text-foreground text-xl tracking-tight sm:text-[1.35rem]"
      {...props}
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-6 mb-2 text-balance font-medium text-foreground text-lg tracking-tight"
      {...props}
    />
  ),
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="mt-4 mb-2 text-pretty font-semibold text-base text-foreground" {...props} />
  ),
  h5: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h5 className="mt-4 mb-2 font-semibold text-foreground text-sm" {...props} />
  ),
  h6: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      className="mt-3 mb-2 font-semibold text-foreground text-xs uppercase tracking-wide"
      {...props}
    />
  ),

  // Prose: reading-scale body text.
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(syllabusBody, 'my-3 text-pretty first:mt-0 last:mb-0 [&+&]:mt-2')}
      {...props}
    />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        syllabusBody,
        'my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground/60'
      )}
      {...props}
    />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn(
        syllabusBody,
        'my-3 list-decimal space-y-1.5 pl-6 marker:font-mono marker:text-muted-foreground/60 marker:text-sm marker:tabular-nums'
      )}
      {...props}
    />
  ),
  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <li className={cn(syllabusBody, '[&_p]:my-1')} {...props} />
  ),
  blockquote: (props: HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn(
        syllabusBody,
        'my-4 border-foreground/20 border-l-2 pl-4 text-muted-foreground italic'
      )}
      {...props}
    />
  ),

  // Image: compact vertical rhythm in a reading panel (my-4 vs my-10).
  img: ({ alt, className, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      alt={alt ?? ''}
      className={cn('my-4 h-auto max-w-full rounded-md border border-border/40', className)}
      {...props}
    />
  ),

  // Slide typography primitives → document-scale equivalents.
  Body: SyllabusBody,
  Headline: SyllabusHeadline,
  Title: SyllabusTitle,
  Subtitle: SyllabusSubtitle,
  Display: SyllabusDisplay,
  Label: SyllabusLabel,
  Mono: SyllabusMono,
  Accent: SyllabusAccent,
  Quote: SyllabusQuote,
  List: SyllabusList,
  Item: SyllabusItem,
}
