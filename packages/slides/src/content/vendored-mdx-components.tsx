/**
 * Vendored lightweight MDX prose components for @atom63/slides.
 *
 * Intentionally excludes: mermaid diagrams, photoswipe/lightbox, shiki syntax
 * highlighting, CopyButton, @atom63/ui, @atom63/mdx. Plain styled HTML only.
 *
 * Generated as part of the slides/@atom63/mdx decoupling (issue context: slides-decouple).
 */

import type { ComponentProps } from 'react'
import { cn } from '../lib/cn'
import { mdxStyles } from './mdx-styles'

// ---------------------------------------------------------------------------
// Headings
// ---------------------------------------------------------------------------

function Heading1({ className, ...props }: ComponentProps<'h1'>) {
  return <h1 className={cn(mdxStyles.headings.h1, className)} {...props} />
}

function Heading2({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cn(mdxStyles.headings.h2, className)} {...props} />
}

function Heading3({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn(mdxStyles.headings.h3, className)} {...props} />
}

function Heading4({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn(mdxStyles.headings.h4, className)} {...props} />
}

function Heading5({ className, ...props }: ComponentProps<'h5'>) {
  return <h5 className={cn(mdxStyles.headings.h5, className)} {...props} />
}

function Heading6({ className, ...props }: ComponentProps<'h6'>) {
  return <h6 className={cn(mdxStyles.headings.h6, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Text / paragraph
// ---------------------------------------------------------------------------

function Paragraph({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn(mdxStyles.text.paragraph, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

function UnorderedList({ className, ...props }: ComponentProps<'ul'>) {
  return <ul className={cn(mdxStyles.content.ul, className)} {...props} />
}

function OrderedList({ className, ...props }: ComponentProps<'ol'>) {
  return <ol className={cn(mdxStyles.content.ol, className)} {...props} />
}

function ListItem({ className, ...props }: ComponentProps<'li'>) {
  return <li className={cn(mdxStyles.content.li, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Blockquote
// ---------------------------------------------------------------------------

function Blockquote({ className, ...props }: ComponentProps<'blockquote'>) {
  return <blockquote className={cn(mdxStyles.content.blockquote, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Inline elements
// ---------------------------------------------------------------------------

function Anchor({ className, href, target, rel, children, ...props }: ComponentProps<'a'>) {
  const isExternal = typeof href === 'string' && href.startsWith('http')
  return (
    <a
      href={href}
      className={cn(mdxStyles.content.link, className)}
      target={isExternal ? (target ?? '_blank') : target}
      rel={isExternal ? (rel ? `${rel} noopener noreferrer` : 'noopener noreferrer') : rel}
      {...props}
    >
      {children}
    </a>
  )
}

function Strong({ className, ...props }: ComponentProps<'strong'>) {
  return <strong className={cn(mdxStyles.content.strong, className)} {...props} />
}

function Em({ className, ...props }: ComponentProps<'em'>) {
  return <em className={cn(mdxStyles.content.em, className)} {...props} />
}

function Del({ className, ...props }: ComponentProps<'del'>) {
  return <del className={cn(mdxStyles.content.del, className)} {...props} />
}

function Ins({ className, ...props }: ComponentProps<'ins'>) {
  return <ins className={cn(mdxStyles.content.ins, className)} {...props} />
}

function Code({ className, ...props }: ComponentProps<'code'>) {
  const isBlock = className?.includes('language-')
  return (
    <code
      className={cn(isBlock ? mdxStyles.content.code : mdxStyles.content.inlineCode, className)}
      {...props}
    />
  )
}

function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return <kbd className={cn(mdxStyles.content.kbd, className)} {...props} />
}

function Mark({ className, ...props }: ComponentProps<'mark'>) {
  return <mark className={cn(mdxStyles.content.mark, className)} {...props} />
}

function Sub({ className, ...props }: ComponentProps<'sub'>) {
  return <sub className={cn(mdxStyles.content.sub, className)} {...props} />
}

function Sup({ className, ...props }: ComponentProps<'sup'>) {
  return <sup className={cn(mdxStyles.content.sup, className)} {...props} />
}

function Abbr({ className, ...props }: ComponentProps<'abbr'>) {
  return <abbr className={cn(mdxStyles.content.abbr, className)} {...props} />
}

function Cite({ className, ...props }: ComponentProps<'cite'>) {
  return <cite className={cn(mdxStyles.content.cite, className)} {...props} />
}

function Dfn({ className, ...props }: ComponentProps<'dfn'>) {
  return <dfn className={cn(mdxStyles.content.dfn, className)} {...props} />
}

function Time({ className, ...props }: ComponentProps<'time'>) {
  return <time className={cn(mdxStyles.content.time, className)} {...props} />
}

function Var({ className, ...props }: ComponentProps<'var'>) {
  return <var className={cn(mdxStyles.content.var, className)} {...props} />
}

function Samp({ className, ...props }: ComponentProps<'samp'>) {
  return <samp className={cn(mdxStyles.content.samp, className)} {...props} />
}

function Output({ className, ...props }: ComponentProps<'output'>) {
  return <output className={cn(mdxStyles.content.output, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Details / summary
// ---------------------------------------------------------------------------

function Details({ className, ...props }: ComponentProps<'details'>) {
  return <details className={cn(mdxStyles.content.details, className)} {...props} />
}

function Summary({ className, ...props }: ComponentProps<'summary'>) {
  return <summary className={cn(mdxStyles.content.summary, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Media elements
// ---------------------------------------------------------------------------

function Iframe({ className, ...props }: ComponentProps<'iframe'>) {
  return <iframe className={cn(mdxStyles.content.iframe, className)} {...props} />
}

function Video({ className, ...props }: ComponentProps<'video'>) {
  return <video className={cn(mdxStyles.content.video, className)} {...props} />
}

function Audio({ className, ...props }: ComponentProps<'audio'>) {
  return <audio className={cn(mdxStyles.content.audio, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Code block (pre + code — no syntax highlighting)
// ---------------------------------------------------------------------------

function Pre({ className, children, ...props }: ComponentProps<'pre'>) {
  return (
    <pre className={cn(mdxStyles.content.pre, className)} {...props}>
      {children}
    </pre>
  )
}

// ---------------------------------------------------------------------------
// Horizontal rule
// ---------------------------------------------------------------------------

function Hr({ className, ...props }: ComponentProps<'hr'>) {
  return <hr className={cn(mdxStyles.content.hr, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Image (plain — no lightbox)
// ---------------------------------------------------------------------------

function Img({ className, alt = '', ...props }: ComponentProps<'img'>) {
  return <img alt={alt} className={cn(mdxStyles.content.img, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Tables (plain HTML — no @atom63/ui wrappers)
// ---------------------------------------------------------------------------

function TableEl({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className={mdxStyles.content.tableWrapper}>
      <table className={cn(mdxStyles.content.table, className)} {...props} />
    </div>
  )
}

function Thead({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn(mdxStyles.content.thead, className)} {...props} />
}

function Tbody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn(mdxStyles.content.tbody, className)} {...props} />
}

function Tr({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn(mdxStyles.content.tr, className)} {...props} />
}

function Th({ className, ...props }: ComponentProps<'th'>) {
  return <th className={cn(mdxStyles.content.th, className)} {...props} />
}

function Td({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn(mdxStyles.content.td, className)} {...props} />
}

function Caption({ className, ...props }: ComponentProps<'caption'>) {
  return <caption className={cn(mdxStyles.content.caption, className)} {...props} />
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const mdxComponents = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  p: Paragraph,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  blockquote: Blockquote,
  a: Anchor,
  strong: Strong,
  em: Em,
  del: Del,
  ins: Ins,
  code: Code,
  kbd: Kbd,
  mark: Mark,
  sub: Sub,
  sup: Sup,
  abbr: Abbr,
  cite: Cite,
  dfn: Dfn,
  time: Time,
  var: Var,
  samp: Samp,
  output: Output,
  details: Details,
  summary: Summary,
  iframe: Iframe,
  video: Video,
  audio: Audio,
  pre: Pre,
  hr: Hr,
  img: Img,
  table: TableEl,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  caption: Caption,
}
