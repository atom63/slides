import type { RefObject } from 'react'
import { memo, useLayoutEffect, useRef } from 'react'
import { DESIGN_HEIGHT, DESIGN_WIDTH } from './dimensions'

/** Extract the target slide's root element from the source container. */
function extractSlideElement(source: HTMLElement, targetSlide: number): HTMLElement | null {
  let slideIdx = 0
  for (const child of source.children) {
    const el = child as HTMLElement
    if (el.hasAttribute('data-slide-break')) {
      slideIdx++
      continue
    }
    if (
      el.hasAttribute('data-slide-talktrack') ||
      el.hasAttribute('data-slide-section') ||
      el.hasAttribute('data-slide-syllabus')
    ) {
      continue
    }
    if (slideIdx === targetSlide) {
      return el
    }
  }
  return null
}

/**
 * Captured-frame cache: gif/video frames are expensive to rasterize, so we draw
 * each once and reuse the data URL. Keyed by deck generation + media src so a
 * deck edit (new generation) invalidates stale frames. A `null` value means the
 * frame couldn't be captured (e.g. cross-origin taint) — fall back to a neutral
 * block. Bounded so long sessions don't grow it unbounded.
 */
const THUMB_FRAME_CACHE = new Map<string, string | null>()
const THUMB_FRAME_CACHE_MAX = 200

const THUMB_FRAME_MAX_WIDTH = 480

function neutralPlaceholder(reference: HTMLElement): HTMLDivElement {
  const placeholder = document.createElement('div')
  placeholder.className = reference.className
  placeholder.style.backgroundColor = 'oklch(0.5 0 0 / 0.2)'
  return placeholder
}

function staticImage(src: string, className: string): HTMLImageElement {
  const img = document.createElement('img')
  img.src = src
  img.className = className
  img.decoding = 'async'
  img.setAttribute('aria-hidden', 'true')
  return img
}

/** Draw a single frame of a loaded <img>/<video> to a data URL. Returns null on
 *  a tainted (cross-origin) canvas or any draw failure. Result is cached. */
function captureFrame(
  el: HTMLImageElement | HTMLVideoElement,
  naturalWidth: number,
  naturalHeight: number,
  cacheKey: string
): string | null {
  if (THUMB_FRAME_CACHE.has(cacheKey)) {
    return THUMB_FRAME_CACHE.get(cacheKey) ?? null
  }
  let url: string | null = null
  try {
    const ratio = naturalWidth > 0 ? naturalHeight / naturalWidth : 0.5625
    const width = Math.min(naturalWidth || THUMB_FRAME_MAX_WIDTH, THUMB_FRAME_MAX_WIDTH)
    const height = Math.max(1, Math.round(width * ratio))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(el, 0, 0, width, height)
      url = canvas.toDataURL('image/jpeg', 0.72)
    }
  } catch {
    url = null
  }
  if (THUMB_FRAME_CACHE.size >= THUMB_FRAME_CACHE_MAX) {
    THUMB_FRAME_CACHE.clear()
  }
  THUMB_FRAME_CACHE.set(cacheKey, url)
  return url
}

/**
 * Replace a cloned media node with a STATIC representation so thumbnails are
 * accurate without autoplay:
 *  - static <img>: leave as-is (the live deck already decoded the src — cache hit)
 *  - animated GIF: freeze to a captured first/current frame
 *  - <video>: poster if set, else a captured current frame, else neutral block
 * `live` is the on-stage element (which has loaded pixels); `clone` is the node
 * in the thumbnail subtree being rendered.
 */
function replaceThumbnailMedia(
  live: HTMLElement | undefined,
  clone: HTMLElement,
  generation: number
): void {
  if (!live) {
    clone.replaceWith(neutralPlaceholder(clone))
    return
  }

  if (clone.tagName === 'IMG') {
    const liveImg = live as HTMLImageElement
    const src = liveImg.currentSrc || liveImg.src
    const isAnimated = /\.gif(\?|#|$)/i.test(src)
    if (isAnimated) {
      const url =
        liveImg.complete && liveImg.naturalWidth > 0
          ? captureFrame(
              liveImg,
              liveImg.naturalWidth,
              liveImg.naturalHeight,
              `${generation}:gif:${src}`
            )
          : null
      clone.replaceWith(url ? staticImage(url, clone.className) : neutralPlaceholder(clone))
    }
    // Static image: leave the cloned <img> as-is — same src is already cached.
    return
  }

  // <video>: never keep a live (autoplaying) video in a thumbnail.
  const liveVideo = live as HTMLVideoElement
  if (liveVideo.poster) {
    clone.replaceWith(staticImage(liveVideo.poster, clone.className))
    return
  }
  if (liveVideo.readyState >= 2 && liveVideo.videoWidth > 0) {
    const url = captureFrame(
      liveVideo,
      liveVideo.videoWidth,
      liveVideo.videoHeight,
      `${generation}:vid:${liveVideo.currentSrc || liveVideo.src}`
    )
    clone.replaceWith(url ? staticImage(url, clone.className) : neutralPlaceholder(clone))
    return
  }
  clone.replaceWith(neutralPlaceholder(clone))
}

export const SlideThumbnail = memo(
  ({
    slideIndex,
    isCurrent,
    sourceRef,
    scale,
    onSelect,
    generation = 0,
  }: {
    slideIndex: number
    isCurrent: boolean
    sourceRef: RefObject<HTMLDivElement | null>
    scale: number
    onSelect: (index: number) => void
    generation?: number
  }) => {
    const cloneRef = useRef<HTMLDivElement>(null)

    // Clone only the target slide rather than the entire deck container.
    // Cloning the full container (all N slides) × visible thumbnail count creates
    // O(N×T) DOM nodes. For decks with Shiki-highlighted code blocks — which
    // generate hundreds of <span> tags each — this can exhaust browser memory.
    //
    // Strategy: shallow-clone the source container (copies its flex/layout classes
    // and inline CSS vars, no children), then deep-clone only the target slide into
    // it. Slide primitives use flex-1 / h-full which need a flex parent — without
    // the wrapper they collapse. This keeps layout correct at O(single_slide) cost.
    useLayoutEffect(() => {
      const source = sourceRef.current
      const container = cloneRef.current
      if (!(source && container)) {
        return
      }

      const slideEl = extractSlideElement(source, slideIndex)
      if (!slideEl) {
        container.replaceChildren()
        return
      }

      // Shallow clone preserves all CSS classes and inline styles (padding,
      // --slide-type-scale, etc.) without copying any sibling slide nodes.
      const wrapper = source.cloneNode(false) as HTMLElement
      const slideClone = slideEl.cloneNode(true) as HTMLElement
      // Non-current slides have display:none set by hideElement. Clear it so
      // the clone is always visible regardless of the slide's live visibility.
      slideClone.style.display = ''

      // Freeze media to static frames so thumbnails are accurate without
      // autoplay. Pair each cloned node with its live on-stage source (same DOM
      // order) so we can read already-decoded pixels — static <img> is kept,
      // gif/video collapse to a captured frame (cached) or a neutral block.
      const liveMedia = slideEl.querySelectorAll<HTMLElement>('img, video')
      const cloneMedia = slideClone.querySelectorAll<HTMLElement>('img, video')
      for (let i = 0; i < cloneMedia.length; i++) {
        replaceThumbnailMedia(liveMedia[i], cloneMedia[i], generation)
      }

      // Replace Shiki-highlighted code blocks with placeholder divs. A single
      // highlighted block generates hundreds of <span> tags; at thumbnail scale
      // the syntax colouring is unreadable anyway.
      for (const pre of slideClone.querySelectorAll<HTMLElement>('pre[data-theme]')) {
        const placeholder = document.createElement('div')
        placeholder.className = pre.className
        placeholder.style.borderRadius = '0.25rem'
        placeholder.style.backgroundColor = 'oklch(0.5 0 0 / 0.1)'
        pre.replaceWith(placeholder)
      }

      wrapper.appendChild(slideClone)
      container.replaceChildren(wrapper)
    }, [slideIndex, sourceRef, generation])

    return (
      <button
        aria-label={`Go to slide ${String(slideIndex + 1)}`}
        aria-current={isCurrent ? 'true' : undefined}
        className={`group relative w-full cursor-pointer overflow-hidden rounded-lg text-left transition-colors ${
          isCurrent
            ? 'border-primary ring-1 ring-primary/30'
            : 'border-border/40 hover:border-border'
        }`}
        onClick={() => onSelect(slideIndex)}
        style={{ aspectRatio: '16 / 9', borderWidth: isCurrent ? 2 : 1, borderStyle: 'solid' }}
        type="button"
      >
        <div
          className="pointer-events-none relative origin-top-left bg-background text-left"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${String(scale)})`,
          }}
        >
          <div className="absolute inset-0 text-left" ref={cloneRef} />
        </div>

        <span className="absolute right-2 bottom-1.5 z-10 rounded bg-foreground/60 px-1.5 py-0.5 font-mono text-[10px] text-background/80">
          {slideIndex + 1}
        </span>
      </button>
    )
  }
)
SlideThumbnail.displayName = 'SlideThumbnail'
