import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { DESIGN_WIDTH } from '../stage/dimensions'
import { SlideThumbnail } from '../stage/thumbnail'

interface SlidePresenterPipProps {
  currentSlideIndex: number
  currentTalkTrack: string | null
  generation?: number
  nextSlideIndex: number | null
  slideCount: number
  sourceRef: RefObject<HTMLDivElement | null>
}

// Thumbnails inside the PiP are read-only — clicking does nothing.
const handleNoopSelect = () => {
  // intentionally empty
}

function useThumbnailScale(containerRef: RefObject<HTMLDivElement | null>): number {
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) {
      return
    }
    const measure = () => {
      const width = el.clientWidth
      if (width > 0) {
        setScale(width / DESIGN_WIDTH)
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])

  return scale
}

export function SlidePresenterPip({
  currentSlideIndex,
  nextSlideIndex,
  slideCount,
  currentTalkTrack,
  sourceRef,
  generation,
}: SlidePresenterPipProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const scale = useThumbnailScale(measureRef)

  return (
    <div className="flex h-full flex-col gap-4 bg-background p-4 text-foreground">
      <div className="flex items-center justify-end">
        <span className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {currentSlideIndex + 1} / {slideCount}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Current
          </div>
          <div ref={measureRef}>
            <SlideThumbnail
              generation={generation}
              isCurrent
              onSelect={handleNoopSelect}
              scale={scale}
              slideIndex={currentSlideIndex}
              sourceRef={sourceRef}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {nextSlideIndex === null ? 'End of deck' : `Next · ${nextSlideIndex + 1}`}
          </div>
          {nextSlideIndex === null ? (
            <div
              className="flex w-full items-center justify-center rounded-lg border border-border/40 border-dashed text-muted-foreground/60 text-xs"
              style={{ aspectRatio: '16 / 9' }}
            >
              End
            </div>
          ) : (
            <SlideThumbnail
              generation={generation}
              isCurrent={false}
              onSelect={handleNoopSelect}
              scale={scale}
              slideIndex={nextSlideIndex}
              sourceRef={sourceRef}
            />
          )}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
        <div className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          Talk track
        </div>
        <div className="scrollbar-reveal min-h-0 flex-1 overflow-y-auto rounded-lg border border-border/40 bg-card/30 p-3">
          {currentTalkTrack ? (
            <p className="whitespace-pre-line text-foreground text-sm leading-relaxed">
              {currentTalkTrack}
            </p>
          ) : (
            <p className="text-muted-foreground/40 text-xs italic">No talk track for this slide</p>
          )}
        </div>
      </div>
    </div>
  )
}
