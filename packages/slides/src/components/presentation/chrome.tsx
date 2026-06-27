import { PanelLeft } from 'lucide-react'
import { Button } from '../primitives'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type React from 'react'
import { memo, useEffect, useState } from 'react'
import { cn } from '../../lib/cn'

const RESIZE_STEP = 16

interface PresentationSidebarProps {
  children: React.ReactNode
  className?: string
  isOverlay?: boolean
  isVisible: boolean
  maxWidth?: number
  minWidth?: number
  onClose?: () => void
  onWidthChange?: (width: number) => void
  overlayMaxWidth?: number
  side?: 'left' | 'right'
  width: number
}

export function PresentationSidebar({
  children,
  className,
  isOverlay = false,
  isVisible,
  maxWidth = 320,
  minWidth = 160,
  onClose,
  onWidthChange,
  overlayMaxWidth = 280,
  side = 'left',
  width,
}: PresentationSidebarProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const reducedMotion = Boolean(useReducedMotion())

  const handleMouseDown = (event: React.MouseEvent) => {
    if (isOverlay) return
    event.preventDefault()
    setIsResizing(true)
    setStartX(event.clientX)
    setStartWidth(width)
  }

  const handleResizeKeyDown = (event: React.KeyboardEvent) => {
    if (isOverlay) return
    let nextWidth: number | null = null
    // For a left sidebar, ArrowRight grows it; for a right sidebar the
    // directions invert so the key matches the visual edge being dragged.
    const grow = side === 'right' ? -RESIZE_STEP : RESIZE_STEP
    switch (event.key) {
      case 'ArrowLeft':
        nextWidth = width - grow
        break
      case 'ArrowRight':
        nextWidth = width + grow
        break
      case 'Home':
        nextWidth = minWidth
        break
      case 'End':
        nextWidth = maxWidth
        break
      default:
        return
    }
    event.preventDefault()
    onWidthChange?.(Math.max(minWidth, Math.min(maxWidth, nextWidth)))
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientX - startX
      const adjustedDelta = side === 'right' ? -delta : delta
      const nextWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + adjustedDelta))
      onWidthChange?.(nextWidth)
    }

    const handleMouseUp = () => setIsResizing(false)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, maxWidth, minWidth, onWidthChange, side, startWidth, startX])

  const effectiveWidth = isOverlay ? Math.min(width, overlayMaxWidth) : width

  return (
    <>
      <AnimatePresence initial={false}>
        {isVisible && isOverlay && (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 bg-background/40"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{ width: isVisible ? effectiveWidth : 0 }}
        className={cn(
          'relative flex flex-shrink-0 flex-col overflow-hidden border-[color:var(--theme-slide-sidebar-border)] bg-[var(--theme-slide-sidebar-bg)]',
          // Only draw the divider when the panel is open — a collapsed panel
          // (width 0) would otherwise still render its 1px side border as a
          // stray line at the canvas edge.
          isVisible && (side === 'right' ? 'border-l' : 'border-r'),
          isOverlay && side === 'left' && 'absolute top-0 bottom-0 left-0 z-50 shadow-xl',
          isOverlay && side === 'right' && 'absolute top-0 right-0 bottom-0 z-50 shadow-xl',
          className
        )}
        initial={{ width: 0 }}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        transition={
          isResizing || reducedMotion
            ? { duration: 0 }
            : { type: 'spring', damping: 30, stiffness: 300 }
        }
      >
        <div className="flex flex-1 flex-col overflow-hidden" style={{ minWidth: effectiveWidth }}>
          {children}
        </div>

        {!isOverlay && (
          // biome-ignore lint/a11y/useSemanticElements: a focusable, keyboard-resizable splitter handle must be a <button> with role="separator"; <hr> cannot be interactive
          <button
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuemax={maxWidth}
            aria-valuemin={minWidth}
            aria-valuenow={Math.round(width)}
            className={cn(
              'absolute top-0 h-full w-0.5 cursor-col-resize transition-colors hover:bg-border focus-visible:bg-ring focus-visible:outline-none',
              side === 'right' ? 'left-0' : 'right-0',
              isResizing && 'bg-ring'
            )}
            onKeyDown={handleResizeKeyDown}
            onMouseDown={handleMouseDown}
            role="separator"
            tabIndex={0}
            type="button"
          />
        )}
      </motion.div>
    </>
  )
}

interface PresentationToolbarProps {
  className?: string
  left?: React.ReactNode
  middle?: React.ReactNode
  right?: React.ReactNode
}

export const PresentationToolbar = memo(
  ({ className, left, middle, right }: PresentationToolbarProps) => (
    <div
      className={cn(
        'flex h-11 items-center justify-between gap-2 border-[color:var(--theme-slide-toolbar-border)] border-b bg-[var(--theme-slide-toolbar-bg)] px-2 shadow-sm',
        className
      )}
    >
      {left && <div className="flex shrink-0 items-center gap-1">{left}</div>}
      {middle && <div className="min-w-0 flex-1 items-center">{middle}</div>}
      {right && <div className="flex shrink-0 items-center gap-1">{right}</div>}
    </div>
  )
)

PresentationToolbar.displayName = 'PresentationToolbar'

interface PresentationSidebarToggleProps {
  isVisible: boolean
  onToggle: () => void
}

export function PresentationSidebarToggle({ isVisible, onToggle }: PresentationSidebarToggleProps) {
  return (
    <Button
      onClick={onToggle}
      size="icon"
      title={isVisible ? 'Hide sidebar' : 'Show sidebar'}
      type="button"
      variant="ghost"
      withMotion={false}
    >
      <PanelLeft aria-hidden />
    </Button>
  )
}

interface PresentationStatusBarProps {
  children: React.ReactNode
  className?: string
}

export function PresentationStatusBar({ children, className }: PresentationStatusBarProps) {
  return (
    <div
      className={cn(
        'flex items-center border-[color:var(--theme-slide-statusbar-border)] border-t bg-[var(--theme-slide-statusbar-bg)] px-4 py-1.5',
        className
      )}
    >
      <span className="text-muted-foreground text-sm">{children}</span>
    </div>
  )
}
