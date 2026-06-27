import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

// Tracks the currently-running entrance animation per slide element so we
// can cancel it before starting a new one when navigating rapidly. WeakMap
// lets the element (and animation) be GC'd once the slide is removed from DOM.
const slideEntranceAnims = new WeakMap<HTMLElement, Animation>()

function isBreak(el: HTMLElement): boolean {
  return el.hasAttribute('data-slide-break')
}

function isTalkTrack(el: HTMLElement): boolean {
  return el.hasAttribute('data-slide-talktrack')
}

/** Join block-level children with double newlines so paragraphs stay separate when rendered as plain text. Falls back to textContent for leaf nodes. */
function extractBlockText(el: HTMLElement): string {
  if (el.children.length === 0) return el.textContent ?? ''
  const parts: string[] = []
  for (const child of el.children) {
    const text = (child as HTMLElement).textContent?.trim()
    if (text) {
      parts.push(text)
    }
  }
  return parts.join('\n\n')
}

function isSection(el: HTMLElement): boolean {
  return el.hasAttribute('data-slide-section')
}

function isSyllabus(el: HTMLElement): boolean {
  return el.hasAttribute('data-slide-syllabus')
}

function hideElement(el: HTMLElement) {
  el.style.display = 'none'
  // Cancel any in-flight entrance animation so it doesn't run as a ghost on a
  // display:none element. Animation.cancel() fires oncancel (not onfinish), so
  // we also delete the WeakMap entry here — onfinish won't do it.
  const anim = slideEntranceAnims.get(el)
  if (anim) {
    anim.cancel()
    slideEntranceAnims.delete(el)
  }
  for (const video of el.querySelectorAll<HTMLVideoElement>('video')) {
    video.pause()
    // Remove <source> srcs to release the WebMediaPlayer. Chrome creates one
    // WebMediaPlayer per <video> element in the document; with many slides in
    // the tree the count exceeds Chrome's limit (~75) and floods the console
    // with "too many WebMediaPlayers" warnings. Storing the src in a data
    // attribute lets showElement restore it without a React re-render.
    for (const source of video.querySelectorAll<HTMLSourceElement>('source')) {
      const src = source.getAttribute('src')
      if (src !== null) {
        source.dataset.deferredSrc = src
        source.removeAttribute('src')
      }
    }
    video.load()
  }
}

function showElement(el: HTMLElement, animate: boolean) {
  el.style.display = ''

  // Restore <source> srcs that were deferred by hideElement, then resume play.
  for (const video of el.querySelectorAll<HTMLVideoElement>('video')) {
    let restored = false
    for (const source of video.querySelectorAll<HTMLSourceElement>('source')) {
      const deferred = source.dataset.deferredSrc
      if (deferred !== undefined) {
        source.setAttribute('src', deferred)
        source.removeAttribute('data-deferred-src')
        restored = true
      }
    }
    if (restored) {
      video.load()
    }
  }

  // Resume autoplay videos that were paused when the slide was hidden.
  for (const video of el.querySelectorAll<HTMLVideoElement>('video[autoplay]')) {
    video.play().catch(() => {
      // autoplay blocked by browser policy — ignore
    })
  }

  // Reset CSS reveal animations so they replay on every slide entry.
  // Batch: write animation:none for all reveals → one reflow on the container
  // → write animation:'' for all reveals. N elements = 1 layout recalculation
  // instead of 1 per element.
  const reveals = el.querySelectorAll<HTMLElement>('.reveal')
  if (reveals.length > 0) {
    for (const reveal of reveals) {
      reveal.style.animation = 'none'
    }
    // Force a single reflow to commit all animation resets before re-enabling.
    el.offsetHeight
    for (const reveal of reveals) {
      reveal.style.animation = ''
    }
  }

  if (animate) {
    // Cancel any still-running entrance animation so rapid navigation doesn't
    // stack multiple Animation objects on the same element.
    slideEntranceAnims.get(el)?.cancel()
    const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 180,
      easing: 'ease-out',
    })
    slideEntranceAnims.set(el, anim)
    anim.onfinish = () => {
      slideEntranceAnims.delete(el)
    }
  }
}

interface ProcessResult {
  section: string | null
  slideCount: number
  talkTrack: string | null
}

// Sections "carry forward" — the most recent section heading at-or-before the
// current slide wins, so that subsequent slides inherit the section label.
function handleMetaElement(
  el: HTMLElement,
  slideIdx: number,
  currentSlide: number,
  meta: { talkTrack: string | null; section: string | null }
) {
  if (isSection(el)) {
    hideElement(el)
    const text = el.textContent
    if (slideIdx <= currentSlide) {
      meta.section = text
    }
    return true
  }
  if (isTalkTrack(el)) {
    hideElement(el)
    if (slideIdx === currentSlide) {
      meta.talkTrack = extractBlockText(el)
    }
    return true
  }
  if (isSyllabus(el)) {
    hideElement(el)
    return true
  }
  return false
}

function processChildren(
  children: HTMLCollection,
  currentSlide: number,
  shouldAnimate: boolean
): ProcessResult {
  let slideIdx = 0
  const meta = { talkTrack: null as string | null, section: null as string | null }

  for (const child of children) {
    const el = child as HTMLElement

    if (isBreak(el)) {
      hideElement(el)
      slideIdx++
      continue
    }

    if (handleMetaElement(el, slideIdx, currentSlide, meta)) {
      continue
    }

    if (slideIdx === currentSlide) {
      showElement(el, shouldAnimate)
    } else {
      hideElement(el)
    }
  }

  return { slideCount: slideIdx + 1, talkTrack: meta.talkTrack, section: meta.section }
}

/**
 * @param currentSlide - Index of the currently visible slide.
 * @param contentGeneration - Bumped when the deck MDX is manually refreshed.
 * @param isActive - Whether the content container is mounted in the DOM.
 *   Pass `false` while the deck is gated (e.g. password lock) so the hook
 *   can attach its observer / rescan as soon as the container appears.
 *   Without this signal, both effects would early-return on the initial
 *   render (when `contentRef.current` is null) and never re-run after the
 *   gate clears, leaving every slide visible at once.
 */
export function useSlidesDom(currentSlide: number, contentGeneration = 0, isActive = true) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [slideCount, setSlideCount] = useState(0)
  const [currentTalkTrack, setCurrentTalkTrack] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [domGeneration, setDomGeneration] = useState(0)
  const prevSlideRef = useRef(-1)
  const prevIsActiveRef = useRef(false)

  // When content transitions from inactive → active (e.g. password gate
  // dismissed), bump domGeneration so useSyllabus / useDeckOutline re-scan
  // the newly mounted content. The MutationObserver can't cover this case
  // because it is set up in a useEffect (after paint) while the content is
  // already committed to the DOM by then.
  useLayoutEffect(() => {
    if (isActive && !prevIsActiveRef.current) {
      setDomGeneration(g => g + 1)
    }
    prevIsActiveRef.current = isActive
  }, [isActive])

  // Watch for structural changes inside the content container (HMR module
  // swaps add/remove slide nodes) and bump domGeneration so the rescan effect
  // and downstream thumbnail clones invalidate. Observed scope is intentionally
  // narrow:
  //   - childList + subtree → catches added/removed slides (HMR, dynamic content)
  //   - NO attributes → showElement/hideElement set inline styles; observing
  //     them would create an infinite loop with the rescan effect below.
  //   - NO characterData → runtime stateful slides updating text would
  //     constantly bust thumbnail clones.
  // Mutations are coalesced via rAF so a burst of HMR updates triggers one bump.
  useEffect(() => {
    if (!isActive) {
      return
    }
    const container = contentRef.current
    if (!container) {
      return
    }

    let raf = 0
    const bump = () => {
      if (raf !== 0) {
        return
      }
      raf = requestAnimationFrame(() => {
        raf = 0
        setDomGeneration(g => g + 1)
      })
    }

    const observer = new MutationObserver(bump)
    observer.observe(container, { childList: true, subtree: true })
    return () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
      }
      observer.disconnect()
    }
  }, [isActive])

  // After a print cycle the browser briefly applies @media print layout,
  // which causes the SlideStage ResizeObserver to fire and can clear the
  // manually-set display:none inline styles during React reconciliation.
  // No tracked dependency changes after afterprint, so processChildren
  // would never re-run without this listener. The rAF defers the bump
  // until the browser has removed print CSS and restored screen layout.
  useEffect(() => {
    const handleAfterPrint = () => {
      requestAnimationFrame(() => {
        setDomGeneration(g => g + 1)
      })
    }
    window.addEventListener('afterprint', handleAfterPrint)
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  // contentGeneration bumps when MDX is manually refreshed (deckVersion).
  // domGeneration bumps when the DOM mutates (HMR, dynamic structural changes).
  // isActive flips when a gate (e.g. password lock) clears and the container
  // mounts. Any of these should trigger a rescan.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional invalidation when deck DOM is replaced
  useLayoutEffect(() => {
    if (!isActive) {
      return
    }
    const container = contentRef.current
    if (!container) {
      return
    }

    const isFirstRender = prevSlideRef.current === -1
    const slideChanged = prevSlideRef.current !== currentSlide
    const shouldAnimate = slideChanged && !isFirstRender

    const result = processChildren(container.children, currentSlide, shouldAnimate)

    prevSlideRef.current = currentSlide
    setSlideCount(c => (c === result.slideCount ? c : result.slideCount))
    setCurrentTalkTrack(t => (t === result.talkTrack ? t : result.talkTrack))
    setCurrentSection(s => (s === result.section ? s : result.section))
  }, [currentSlide, contentGeneration, domGeneration, isActive])

  return useMemo(
    () => ({ contentRef, slideCount, currentTalkTrack, currentSection, domGeneration }),
    [slideCount, currentTalkTrack, currentSection, domGeneration]
  )
}
