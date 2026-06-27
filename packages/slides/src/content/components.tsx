import type { CSSProperties, ReactNode } from 'react'
import { useSlideRenderMode } from '../stores/render-mode'
import type { SlideLayout } from '../types'

const layoutClasses: Record<SlideLayout, string> = {
  cover:
    'flex flex-1 flex-col justify-end text-left [&_h1]:text-[calc(128px*var(--slide-type-scale,1))] [&_h1]:font-light [&_h1]:tracking-[-0.05em] [&_h1]:leading-[0.85] [&_h1]:mb-6 [&_p]:text-2xl [&_p]:text-muted-foreground/50 [&_p]:leading-relaxed',
  title: 'flex flex-1 flex-col items-center justify-center text-center',
  content: 'flex flex-1 flex-col justify-center',
  split: 'grid flex-1 grid-cols-2 items-center gap-16',
  'media-full': 'flex flex-1 items-center justify-center -mx-32 -my-[120px]',
  quote: 'flex flex-1 flex-col items-center justify-center text-center max-w-[1200px] mx-auto',
}

/** Presenter script for the current slide — hidden on stage, surfaced in panels. */
export function TalkTrack({ children }: { children: ReactNode }) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  return (
    <div data-slide-talktrack hidden>
      {children}
    </div>
  )
}
TalkTrack.displayName = 'TalkTrack'

/** Hidden marker that sets the frame section label for this and following slides. */
export function Section({ children }: { children: ReactNode }) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  return (
    <div data-slide-section hidden>
      {children}
    </div>
  )
}
Section.displayName = 'Section'

export function Slide({ children, layout }: { children: ReactNode; layout?: SlideLayout }) {
  const mode = useSlideRenderMode()
  if (mode === 'web-syllabus') return null
  const resolved = layout ?? 'content'
  return (
    <div className={layoutClasses[resolved]} data-slide-layout={resolved}>
      {children}
    </div>
  )
}
Slide.displayName = 'Slide'

/** Small uppercase label — monospace, tracked-out. */
export function Overline({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 font-medium font-mono text-muted-foreground/60 text-sm uppercase tracking-[0.25em]">
      {children}
    </p>
  )
}
Overline.displayName = 'Overline'

/** Small muted text — attribution, dates, metadata. */
export function Caption({
  children,
  reveal,
  index,
}: {
  children: ReactNode
  reveal?: boolean
  index?: number
}) {
  return (
    <p
      className={`mt-8 font-mono text-muted-foreground/40 text-sm tracking-wider ${reveal ? 'reveal' : ''}`}
      style={
        reveal && index !== undefined
          ? ({ '--stagger-index': String(index) } as CSSProperties)
          : undefined
      }
    >
      {children}
    </p>
  )
}
Caption.displayName = 'Caption'

/** Thin decorative line — not a slide break. */
export function Divider() {
  return <div className="my-8 h-px w-16 bg-muted-foreground/20" />
}
Divider.displayName = 'Divider'

/** Large numeral — monospace display number. */
export function SlideNumber({ children }: { children: ReactNode }) {
  return (
    <span className="font-light font-mono text-8xl text-muted-foreground/15 leading-none tracking-tighter">
      {children}
    </span>
  )
}
SlideNumber.displayName = 'SlideNumber'

export function SlideImage({
  src,
  alt,
  fill,
  className,
}: {
  src: string
  alt: string
  fill?: boolean
  className?: string
}) {
  const base = fill
    ? 'size-full object-cover'
    : 'max-h-[700px] max-w-full rounded-lg object-contain'
  return (
    <img alt={alt} className={`${base} ${className ?? ''}`} height={700} src={src} width={1200} />
  )
}
SlideImage.displayName = 'SlideImage'

export function SlideVideo({
  src,
  alt,
  fill,
  className,
}: {
  src: string
  alt: string
  fill?: boolean
  className?: string
}) {
  const base = fill
    ? 'size-full object-cover'
    : 'max-h-[700px] max-w-full rounded-lg object-contain'
  return (
    <video autoPlay className={`${base} ${className ?? ''}`} loop muted playsInline>
      <source src={src} />
      <track kind="captions" label={alt} />
    </video>
  )
}
SlideVideo.displayName = 'SlideVideo'

const GRID_COL_CLASSES = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const

const GRID_GAP_CLASSES = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
} as const

export function SlideGrid({
  children,
  columns = 3,
  gap = 'md',
}: {
  children: ReactNode
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div
      className={`grid min-h-0 flex-1 auto-rows-fr ${GRID_COL_CLASSES[columns]} ${GRID_GAP_CLASSES[gap]} mt-6 overflow-hidden [&_img]:size-full [&_img]:object-cover`}
    >
      {children}
    </div>
  )
}
SlideGrid.displayName = 'SlideGrid'
