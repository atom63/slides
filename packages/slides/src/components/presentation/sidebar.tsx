import { useVirtualizer } from '@tanstack/react-virtual'
import type { RefObject } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DESIGN_WIDTH } from '../stage/dimensions'
import { SlideThumbnail } from '../stage/thumbnail'
import { PresentationSidebar } from './chrome'

/** Measure the inner container width to scale thumbnails dynamically. */
function useSidebarScale(containerRef: RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) {
      return
    }

    let raf = 0
    const measure = () => {
      // Account for padding (p-2 = 8px each side)
      const availableWidth = el.clientWidth - 16
      if (availableWidth > 0) {
        const next = availableWidth / DESIGN_WIDTH
        setScale(prev => (Math.abs(prev - next) < 0.0005 ? prev : next))
      }
    }

    const scheduleMeasure = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
      }
      raf = requestAnimationFrame(() => {
        raf = 0
        measure()
      })
    }

    measure()

    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(el)
    return () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
      }
      observer.disconnect()
    }
  }, [containerRef])

  return scale
}

export function SlideSidebar({
  slideCount,
  currentSlide,
  sourceRef,
  onSelect,
  isVisible,
  isOverlay,
  width,
  onWidthChange,
  onClose,
  generation,
}: {
  slideCount: number
  currentSlide: number
  sourceRef: RefObject<HTMLDivElement | null>
  onSelect: (index: number) => void
  isVisible: boolean
  isOverlay: boolean
  width: number
  onWidthChange: (width: number) => void
  onClose: () => void
  generation?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scale = useSidebarScale(containerRef)

  const virtualizer = useVirtualizer({
    count: slideCount,
    estimateSize: () => 120,
    getScrollElement: () => containerRef.current,
    overscan: 5,
    paddingEnd: 8,
    paddingStart: 8,
  })

  useLayoutEffect(() => {
    if (slideCount === 0 || scale <= 0) {
      return
    }
    virtualizer.scrollToIndex(currentSlide, { align: 'center' })
  }, [currentSlide, scale, slideCount, virtualizer])

  return (
    <PresentationSidebar
      isOverlay={isOverlay}
      isVisible={isVisible}
      maxWidth={320}
      minWidth={160}
      onClose={onClose}
      onWidthChange={onWidthChange}
      width={width}
    >
      <div
        className="scrollbar-reveal flex-1 overflow-y-auto"
        ref={containerRef}
        style={{ minWidth: width }}
      >
        <div
          className="relative w-full"
          style={{ height: `${String(virtualizer.getTotalSize())}px` }}
        >
          {virtualizer.getVirtualItems().map(vRow => (
            <div
              className="px-2 pb-2"
              data-index={vRow.index}
              key={vRow.key}
              ref={virtualizer.measureElement}
              style={{
                left: 0,
                position: 'absolute',
                top: 0,
                transform: `translateY(${String(vRow.start)}px)`,
                width: '100%',
              }}
            >
              <SlideThumbnail
                generation={generation}
                isCurrent={vRow.index === currentSlide}
                onSelect={onSelect}
                scale={scale}
                slideIndex={vRow.index}
                sourceRef={sourceRef}
              />
            </div>
          ))}
        </div>
      </div>
    </PresentationSidebar>
  )
}
