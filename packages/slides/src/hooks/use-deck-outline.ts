import { type RefObject, useLayoutEffect, useState } from 'react'

export interface OutlineSection {
  endSlide: number
  section: string
  /** Number of slides covered by this section (inclusive). */
  slideCount: number
  startSlide: number
}

export interface DeckOutline {
  /** Sections in document order, each with the slide range it covers. */
  sections: OutlineSection[]
  /** Total slides in the deck — same number `useSlidesDom` reports. */
  totalSlides: number
}

const EMPTY_OUTLINE: DeckOutline = { sections: [], totalSlides: 0 }

/**
 * Walks the deck DOM to derive a structured outline from `<Section>` markers
 * and `<hr data-slide-break>` boundaries. Sections "carry forward": a Section
 * marker labels the slide it precedes plus all slides until the next marker.
 *
 * Re-runs whenever the source mounts or `generation` bumps (HMR / manual deck
 * refresh signals from `useSlidesDom`).
 */
export function useDeckOutline(
  sourceRef: RefObject<HTMLDivElement | null>,
  generation = 0
): DeckOutline {
  const [outline, setOutline] = useState<DeckOutline>(EMPTY_OUTLINE)

  // biome-ignore lint/correctness/useExhaustiveDependencies: generation is an explicit invalidation trigger
  useLayoutEffect(() => {
    const container = sourceRef.current
    if (!container) {
      return
    }

    const sections: Array<{ section: string; startSlide: number }> = []
    let slideIdx = 0

    for (const child of container.children) {
      const el = child as HTMLElement
      if (el.hasAttribute('data-slide-break')) {
        slideIdx++
        continue
      }
      if (el.hasAttribute('data-slide-section')) {
        const text = el.textContent?.trim()
        if (text) {
          sections.push({ section: text, startSlide: slideIdx })
        }
      }
    }

    const totalSlides = slideIdx + 1
    const built: OutlineSection[] = sections.map((entry, i) => {
      const next = sections[i + 1]
      const endSlide = next ? next.startSlide - 1 : totalSlides - 1
      return {
        section: entry.section,
        startSlide: entry.startSlide,
        endSlide,
        slideCount: endSlide - entry.startSlide + 1,
      }
    })

    setOutline(prev => {
      if (
        prev.totalSlides === totalSlides &&
        prev.sections.length === built.length &&
        prev.sections.every(
          (s, i) =>
            s.section === built[i].section &&
            s.startSlide === built[i].startSlide &&
            s.endSlide === built[i].endSlide
        )
      ) {
        return prev
      }
      return { sections: built, totalSlides }
    })
  }, [sourceRef, generation])

  return outline
}
