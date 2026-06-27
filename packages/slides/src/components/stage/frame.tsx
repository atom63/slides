import { memo } from 'react'

import {
  FRAME_PADDING_PX,
  SLIDE_FRAME_WATERMARK_PX,
  useSlideConfig,
} from '../../stores/config-store'

/** Inset (px) from the slide edge for the four corner register marks.
 *  Positioning them in the bleed — outside both the content padding and
 *  the watermark metadata row — so they never touch text, media, or the
 *  folio chrome. This matches real printer's registration-mark
 *  placement: marks sit on the trim corners, not on the live area. */
const TRIM_MARK_INSET_PX = 14

/** Register-mark cross — a tiny plus glyph used to mark the four trim
 *  corners of the slide. Structural, not decorative. */
function RegistrationMark() {
  return (
    <svg
      aria-hidden="true"
      className="text-foreground/20"
      fill="none"
      height={12}
      viewBox="0 0 12 12"
      width={12}
    >
      <title>register mark</title>
      <line stroke="currentColor" strokeWidth={1} x1={6} x2={6} y1={0} y2={12} />
      <line stroke="currentColor" strokeWidth={1} x1={0} x2={12} y1={6} y2={6} />
    </svg>
  )
}

/** Decorative text frame overlay — positions metadata in the margin area
 *  between the slide edge and the content grid. Also renders four
 *  register-mark crosshairs at the corners of the content area and a
 *  hairline rule above the footer watermark so the chrome reads like a
 *  printed form instead of a web UI.
 *
 *  Memoized so it only re-renders when the section/slide-count/title
 *  actually change, not on every parent re-render. */
function SlideFrameComponent({
  section,
  currentSlide,
  totalSlides,
  deckTitle,
}: {
  section: string | null
  currentSlide: number
  totalSlides: number
  deckTitle: string
}) {
  const padding = useSlideConfig(s => s.padding)
  const { px } = FRAME_PADDING_PX[padding]
  const { pb, pt } = SLIDE_FRAME_WATERMARK_PX[padding]

  const current = String(currentSlide + 1).padStart(2, '0')
  const total = String(totalSlides).padStart(2, '0')

  // Offset the glyph by -6 (half its 12px size) so the crosshair is
  // visually centered at the trim inset, not just flush-anchored to it.
  const markOffset = TRIM_MARK_INSET_PX - 6

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top-left: section label */}
      <div className="absolute" style={{ left: px, top: pt }}>
        {section && (
          <span className="font-medium font-mono text-muted-foreground text-xs uppercase tabular-nums tracking-[0.22em]">
            ■ {section}
          </span>
        )}
      </div>

      {/* Top-right: slide counter */}
      <div className="absolute flex items-baseline gap-1" style={{ right: px, top: pt }}>
        <span className="font-mono text-muted-foreground text-xs tabular-nums tracking-[0.1em]">
          {current}
        </span>
        <span className="font-mono text-muted-foreground text-xs">/</span>
        <span className="font-mono text-muted-foreground text-xs tabular-nums tracking-[0.1em]">
          {total}
        </span>
      </div>

      {/* Corner registration marks at the slide trim corners */}
      <div className="absolute" style={{ left: markOffset, top: markOffset }}>
        <RegistrationMark />
      </div>
      <div className="absolute" style={{ right: markOffset, top: markOffset }}>
        <RegistrationMark />
      </div>
      <div className="absolute" style={{ bottom: markOffset, left: markOffset }}>
        <RegistrationMark />
      </div>
      <div className="absolute" style={{ right: markOffset, bottom: markOffset }}>
        <RegistrationMark />
      </div>

      {/* Bottom-left: deck title with a hairline rule above it */}
      <div className="absolute flex items-center gap-3" style={{ bottom: pb, left: px, right: px }}>
        <span className="font-mono text-muted-foreground text-xs uppercase tabular-nums tracking-[0.2em]">
          {deckTitle}
        </span>
        <div className="h-px flex-1 bg-foreground/10" />
      </div>
    </div>
  )
}

export const SlideFrame = memo(SlideFrameComponent)
