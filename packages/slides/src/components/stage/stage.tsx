import type React from 'react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DESIGN_HEIGHT, DESIGN_WIDTH } from './dimensions'

export function SlideStage({
  children,
  theme = 'auto',
  preset,
}: {
  children: ReactNode
  /**
   * Deck theme from frontmatter. `'auto'` inherits the site theme; `'dark'`
   * and `'light'` force the canvas regardless of the site setting.
   */
  theme?: 'auto' | 'dark' | 'light'
  /** Optional style preset from frontmatter */
  preset?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const recalculate = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    const { width, height } = container.getBoundingClientRect()
    const scaleX = width / DESIGN_WIDTH
    const scaleY = height / DESIGN_HEIGHT
    const next = Math.min(scaleX, scaleY)
    setScale(prev => (Math.abs(prev - next) < 0.0005 ? prev : next))
  }, [])

  useEffect(() => {
    recalculate()

    const container = containerRef.current
    if (!container) {
      return
    }

    let raf = 0
    const observer = new ResizeObserver(() => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
      }
      raf = requestAnimationFrame(() => {
        raf = 0
        recalculate()
      })
    })
    observer.observe(container)
    return () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
      }
      observer.disconnect()
    }
  }, [recalculate])

  // 'auto' adds no class so the canvas inherits whichever theme class
  // (`light` / `dark`) the site theme system has placed on <html>. 'light' and
  // 'dark' force the canvas regardless of the surrounding theme.
  const themeClass = theme === 'auto' ? '' : theme

  return (
    <div
      className="relative flex-1 overflow-hidden bg-[var(--theme-slide-stage-bg,transparent)]"
      ref={containerRef}
    >
      <div
        className={`absolute top-1/2 left-1/2 overflow-hidden bg-[var(--theme-slide-bg,var(--background))] ring-1 ring-[color:var(--theme-slide-stage-slide-ring,rgba(0,0,0,0.08))] ${themeClass}`}
        data-slide-preset={preset}
        style={
          {
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            '--slide-stage-scale': String(scale),
            '--slide-stage-zoom': String(1 / scale),
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  )
}
