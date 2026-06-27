import { mdxComponents } from './vendored-mdx-components'
import { mdxStyles } from './mdx-styles'
import type { ReactNode } from 'react'
import { useContext } from 'react'
import {
  Caption,
  Divider as LegacyDivider,
  Overline,
  Section,
  Slide,
  SlideGrid,
  SlideImage,
  SlideNumber,
  SlideVideo,
  TalkTrack,
} from './components'
import {
  Accent,
  Avatar,
  Badge,
  // Utility
  Bleed,
  Body,
  // Visual
  Box,
  Cell,
  Center,
  // Signal blocks
  ColorBlock,
  // Layout
  Columns,
  Demo,
  // Typography
  Display,
  Divider,
  // Editorial marks
  FigureMark,
  Fill,
  Grid,
  Headline,
  Highlight,
  Icon,
  // Media
  Image,
  InlineCode,
  Item,
  Label,
  // List
  List,
  Live,
  Mono,
  Position,
  Quote,
  Reveal,
  Row,
  SectionMarker,
  SlideCodeBlock,
  Spacer,
  Split,
  Stack,
  Subtitle,
  Title,
  Trio,
  Video,
} from './primitives'
import { Syllabus, SyllabusContentContext } from './syllabus'
import {
  ClosingSlide,
  Collage,
  CoverSlide,
  FullBleedCoverSlide,
  FullBleedGallery,
  HeroBento,
  MediaTrio,
  QuoteSlide,
  QuoteWithMedia,
  SectionSlide,
  SplitHalf,
  SplitWithStat,
  StatBento,
  StatementSlide,
  TextLead,
  TimelineBento,
} from './templates'

function SlideBreak() {
  return <hr data-slide-break />
}
SlideBreak.displayName = 'SlideBreak'

// Delegates raw markdown tags to typography primitives so there's a single
// source of truth for type sizes. Authors can still use <Headline>, <Title>,
// etc. explicitly in JSX; this just makes `# heading` and `- item` markdown
// render with the same tokens.
//
// Inside <Syllabus>, SyllabusContentContext is true — each wrapper switches to
// native HTML elements styled with mdxStyles tokens (web/article scale) instead
// of slide-scale primitives. This removes the need for CSS !important resets.
const MarkdownHeading1 = ({ children }: { children?: ReactNode }) => {
  const inSyllabus = useContext(SyllabusContentContext)
  return inSyllabus ? (
    <h1 className={mdxStyles.headings.h1}>{children}</h1>
  ) : (
    <Headline>{children}</Headline>
  )
}
const MarkdownHeading2 = ({ children }: { children?: ReactNode }) => {
  const inSyllabus = useContext(SyllabusContentContext)
  return inSyllabus ? (
    <h2 className={mdxStyles.headings.h2}>{children}</h2>
  ) : (
    <Title>{children}</Title>
  )
}
const MarkdownHeading3 = ({ children }: { children?: ReactNode }) => {
  const inSyllabus = useContext(SyllabusContentContext)
  return inSyllabus ? (
    <h3 className={mdxStyles.headings.h3}>{children}</h3>
  ) : (
    <Subtitle color="default">{children}</Subtitle>
  )
}
const MarkdownParagraph = ({ children }: { children?: ReactNode }) => {
  const inSyllabus = useContext(SyllabusContentContext)
  return inSyllabus ? (
    <p className={mdxStyles.text.paragraph}>{children}</p>
  ) : (
    <div className="mt-[0.75em] first:mt-0">{children}</div>
  )
}
const MarkdownUnorderedList = ({ children }: { children?: ReactNode }) => {
  const inSyllabus = useContext(SyllabusContentContext)
  return inSyllabus ? (
    <ul className={mdxStyles.content.ul}>{children}</ul>
  ) : (
    <List marker="dash">{children}</List>
  )
}
const MarkdownOrderedList = ({ children }: { children?: ReactNode }) => {
  const inSyllabus = useContext(SyllabusContentContext)
  return inSyllabus ? (
    <ol className={mdxStyles.content.ol}>{children}</ol>
  ) : (
    <List marker="number">{children}</List>
  )
}
const MarkdownListItem = ({ children }: { children?: ReactNode }) => {
  const inSyllabus = useContext(SyllabusContentContext)
  return inSyllabus ? <li className={mdxStyles.content.li}>{children}</li> : <Item>{children}</Item>
}
const MarkdownStrong = ({ children }: { children?: ReactNode }) => (
  <strong className="font-semibold text-foreground">{children}</strong>
)
const MarkdownInlineCode = ({ children }: { children?: ReactNode }) => (
  <code className="rounded bg-foreground/8 px-[0.35em] py-[0.1em] font-mono text-[0.85em] text-foreground/90">
    {children}
  </code>
)
const MarkdownBlockquote = ({ children }: { children?: ReactNode }) => {
  const inSyllabus = useContext(SyllabusContentContext)
  return inSyllabus ? (
    <blockquote className="my-4 rounded-sm bg-muted/40 px-4 py-3 text-base text-secondary-foreground italic leading-relaxed [&_p:first-child]:mt-0 [&_p]:mt-2">
      {children}
    </blockquote>
  ) : (
    <blockquote className="relative max-w-[900px] text-pretty font-instrument-serif text-3xl text-foreground/80 italic leading-normal">
      {children}
    </blockquote>
  )
}
// rehype-pretty-code wraps <pre> in <figure data-rehype-pretty-code-figure>.
// Strip the figure (it carries web prose margins) and route <pre> through
// SlideCodeBlock so font sizes scale with --slide-type-scale.
const MarkdownFigure = ({ children }: { children?: ReactNode }) => <>{children}</>
const MarkdownPre = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & { 'data-language'?: string; 'data-theme'?: string }) => (
  <SlideCodeBlock dataTheme={props['data-theme']} language={props['data-language']}>
    {children}
  </SlideCodeBlock>
)

export const slideMdxComponents = {
  ...mdxComponents,

  // Markdown tag → typography primitive (single source of truth)
  h1: MarkdownHeading1,
  h2: MarkdownHeading2,
  h3: MarkdownHeading3,
  p: MarkdownParagraph,
  ul: MarkdownUnorderedList,
  ol: MarkdownOrderedList,
  li: MarkdownListItem,
  strong: MarkdownStrong,
  code: MarkdownInlineCode,
  blockquote: MarkdownBlockquote,
  figure: MarkdownFigure,
  pre: MarkdownPre,

  // Slide-specific components (legacy)
  hr: SlideBreak,
  TalkTrack,
  Syllabus,
  Slide,
  SlideImage,
  SlideVideo,
  SlideGrid,
  Overline,
  Caption,
  LegacyDivider,
  SlideNumber,
  Section,

  // Layout primitives
  Columns,
  Grid,
  Cell,
  Split,
  Trio,
  Stack,
  Row,
  Center,
  Spacer,

  // Typography primitives
  Display,
  Headline,
  Title,
  Subtitle,
  Body,
  Label,
  Accent,
  Mono,
  InlineCode,
  Quote,
  SlideCodeBlock,

  // Media primitives
  Image,
  Video,
  Icon,
  Avatar,

  // Visual primitives
  Box,
  Divider,
  Badge,
  Highlight,
  ColorBlock,
  FigureMark,
  SectionMarker,

  // List primitives
  List,
  Item,

  // Utility primitives
  Bleed,
  Fill,
  Demo,
  Live,
  Position,
  Reveal,

  // Template patterns (compose primitives)
  CoverSlide,
  FullBleedCoverSlide,
  QuoteSlide,
  SectionSlide,
  StatementSlide,
  SplitHalf,
  ClosingSlide,

  // Bento templates
  HeroBento,
  MediaTrio,
  StatBento,
  Collage,
  FullBleedGallery,
  QuoteWithMedia,
  SplitWithStat,
  TextLead,
  TimelineBento,
}
