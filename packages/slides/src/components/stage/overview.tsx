import { useVirtualizer } from '@tanstack/react-virtual'
import type { RefObject } from 'react'
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DESIGN_WIDTH } from './dimensions'
import { SlideThumbnail } from './thumbnail'

const GRID_COLS = 4
/** Horizontal padding: p-8 = 32px each side */
const PAD_X = 64
/** gap-4 between columns (3 internal gaps per row) */
const GAP = 16

function useOverviewScale(scrollRef: RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }

    let raf = 0
    const measure = () => {
      const inner = el.clientWidth - PAD_X
      const cell = (inner - GAP * (GRID_COLS - 1)) / GRID_COLS
      if (cell > 0) {
        const next = cell / DESIGN_WIDTH
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
  }, [scrollRef])

  return scale
}

interface SlideOverviewProps {
  currentSlide: number
  generation?: number
  onSelect: (index: number) => void
  slideCount: number
  sourceRef: RefObject<HTMLDivElement | null>
}

function SlideOverviewComponent({
  slideCount,
  currentSlide,
  sourceRef,
  onSelect,
  generation,
}: SlideOverviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scale = useOverviewScale(scrollRef)
  const rowCount = Math.ceil(slideCount / GRID_COLS)

  const virtualizer = useVirtualizer({
    count: rowCount,
    estimateSize: () => 200,
    getScrollElement: () => scrollRef.current,
    overscan: 2,
    paddingEnd: 32,
    paddingStart: 32,
  })

  useLayoutEffect(() => {
    if (slideCount === 0 || scale <= 0) {
      return
    }
    const row = Math.floor(currentSlide / GRID_COLS)
    virtualizer.scrollToIndex(row, { align: 'center' })
  }, [currentSlide, scale, slideCount, virtualizer])

  return (
    <div
      className="scrollbar-reveal absolute inset-0 z-30 overflow-auto bg-background/95 backdrop-blur-sm"
      ref={scrollRef}
    >
      <div className="relative" style={{ height: `${String(virtualizer.getTotalSize())}px` }}>
        {virtualizer.getVirtualItems().map(vRow => (
          <div
            className="pb-4"
            data-index={vRow.index}
            key={vRow.key}
            ref={virtualizer.measureElement}
            style={{
              left: 0,
              paddingLeft: '2rem',
              paddingRight: '2rem',
              position: 'absolute',
              top: 0,
              transform: `translateY(${String(vRow.start)}px)`,
              width: '100%',
            }}
          >
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: GRID_COLS }, (_, c) => {
                const i = vRow.index * GRID_COLS + c
                if (i >= slideCount) {
                  return <div key={`empty-${String(c)}`} />
                }
                return (
                  <SlideThumbnail
                    generation={generation}
                    isCurrent={i === currentSlide}
                    key={`slide-${String(i)}`}
                    onSelect={onSelect}
                    scale={scale}
                    slideIndex={i}
                    sourceRef={sourceRef}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const SlideOverview = memo(SlideOverviewComponent)
