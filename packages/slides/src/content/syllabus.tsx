import type { ReactNode } from 'react'
import { createContext, Fragment, useContext, useEffect } from 'react'
import { SyllabusDetectContext, useSlideRenderMode } from '../stores/render-mode'

/**
 * Consumed by the MDX markdown wrappers (MarkdownParagraph, MarkdownUnorderedList,
 * etc.) to switch from slide-scale primitives to native web-MDX elements when
 * rendering inside a Syllabus block. This avoids the CSS !important reset layer
 * previously needed to undo slide typography inside the syllabus view.
 */
export const SyllabusContentContext = createContext(false)

// =============================================================================
// SYLLABUS ROOT
// =============================================================================

/**
 * Syllabus / handout block for a slide deck.
 *
 * In presentation mode: renders as a hidden DOM container so the slide stage
 * extractors (useSlidesDom, useSyllabus) can clone it into the reading layout.
 *
 * In web-syllabus mode: renders as a visible, styled document section.
 * Write standard MDX headings (## Overview, ## Objectives, etc.) as children —
 * no sub-component wrappers needed. Only <Syllabus.Meta> remains for
 * structured key-value metadata (duration, format, audience, etc.).
 */
export function Syllabus({ children }: { children: ReactNode }) {
  const mode = useSlideRenderMode()
  const notify = useContext(SyllabusDetectContext)

  useEffect(() => {
    if (mode === 'web-syllabus') {
      notify?.()
    }
  }, [mode, notify])

  if (mode === 'web-syllabus') {
    return (
      <SyllabusContentContext.Provider value={true}>
        <div className="flex flex-col gap-0 pb-8">{children}</div>
      </SyllabusContentContext.Provider>
    )
  }
  return (
    <SyllabusContentContext.Provider value={true}>
      <div data-slide-syllabus hidden>
        {children}
      </div>
    </SyllabusContentContext.Provider>
  )
}
Syllabus.displayName = 'Syllabus'

// =============================================================================
// META BLOCK
// =============================================================================

export interface SyllabusMetaProps {
  audience?: string
  date?: string
  duration?: string
  format?: string
  location?: string
}

const Meta = ({ duration, audience, format, location, date }: SyllabusMetaProps) => {
  const mode = useSlideRenderMode()

  if (mode === 'web-syllabus') {
    const rows: [string, string][] = [
      ...(duration ? [['Duration', duration] as [string, string]] : []),
      ...(format ? [['Format', format] as [string, string]] : []),
      ...(audience ? [['Audience', audience] as [string, string]] : []),
      ...(location ? [['Location', location] as [string, string]] : []),
      ...(date ? [['Date', date] as [string, string]] : []),
    ]

    if (rows.length === 0) return null

    return (
      <div className="flex flex-col gap-4 py-8">
        <p className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-wider">
          At a glance
        </p>
        <div className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-2.5">
          {rows.map(([label, value]) => (
            <Fragment key={label}>
              <span className="self-baseline pt-px font-medium font-mono text-muted-foreground text-xs uppercase tracking-wider">
                {label}
              </span>
              <span className="text-[0.9375rem] text-foreground/90 leading-[1.7]">{value}</span>
            </Fragment>
          ))}
        </div>
      </div>
    )
  }

  const rows: [label: string, value: string][] = []
  if (duration) rows.push(['Duration', duration])
  if (format) rows.push(['Format', format])
  if (audience) rows.push(['Audience', audience])
  if (location) rows.push(['Location', location])
  if (date) rows.push(['Date', date])

  return (
    <div data-syllabus-block="meta">
      {rows.map(([label, value]) => (
        <div data-syllabus-meta-key={label.toLowerCase()} key={label}>
          <span data-syllabus-meta-label>{label}</span>
          <span data-syllabus-meta-value>{value}</span>
        </div>
      ))}
    </div>
  )
}
Meta.displayName = 'Syllabus.Meta'

Syllabus.Meta = Meta
