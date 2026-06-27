import { Button, Kbd, Label, SegmentControl, Separator, Switch } from '../primitives'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { RefObject } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../../hooks/use-focus-trap'
import {
  type SlideConfigPadding,
  type SlideConfigTypographyScale,
  useSlideConfig,
} from '../../stores/config-store'

const PANEL_VISIBLE = { opacity: 1, y: 0 } as const
const PANEL_HIDDEN = { opacity: 0, y: -4 } as const
const PANEL_TRANSITION = { duration: 0.15, ease: [0.16, 1, 0.3, 1] } as const

const PANEL_WIDTH = 272

interface SlideConfigPanelProps {
  anchorRef: RefObject<HTMLElement | null>
  isOpen: boolean
  onClose: () => void
}

const PADDING_OPTIONS: { label: string; value: SlideConfigPadding }[] = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
]

const TYPE_SCALE_OPTIONS: { label: string; value: SlideConfigTypographyScale }[] = [
  { label: '0.9×', value: 'sm' },
  { label: '1.0×', value: 'md' },
  { label: '1.1×', value: 'lg' },
  { label: '1.2×', value: 'xl' },
]

function SwitchRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <Label className="cursor-pointer font-medium text-foreground text-sm">{label}</Label>
      <Switch aria-label={label} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function SlideConfigPanel({ anchorRef, isOpen, onClose }: SlideConfigPanelProps) {
  const padding = useSlideConfig(state => state.padding)
  const typographyScale = useSlideConfig(state => state.typographyScale)
  const showPagination = useSlideConfig(state => state.showPagination)
  const showInlineTalkTrack = useSlideConfig(state => state.showInlineTalkTrack)
  const updateConfig = useSlideConfig(state => state.updateConfig)
  const reset = useSlideConfig(state => state.reset)
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 56, left: 16 })
  const reducedMotion = Boolean(useReducedMotion())

  // Trap focus within the panel while open: move initial focus in, loop Tab,
  // close on Escape, and restore focus to the trigger on close.
  useFocusTrap(panelRef, { active: isOpen, onEscape: onClose })

  // Compute position from anchor button so the panel opens below it,
  // right-aligned to the button's right edge, clamped to stay on-screen.
  useLayoutEffect(() => {
    if (!(anchorRef.current && isOpen)) return
    const rect = anchorRef.current.getBoundingClientRect()
    const left = Math.min(rect.right - PANEL_WIDTH, window.innerWidth - PANEL_WIDTH - 8)
    setPos({ top: rect.bottom + 6, left: Math.max(8, left) })
  }, [anchorRef, isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose, anchorRef])

  const handleReset = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const handlePaddingChange = useCallback(
    (value: SlideConfigPadding) => updateConfig({ padding: value }),
    [updateConfig]
  )

  const handleTypographyScaleChange = useCallback(
    (value: SlideConfigTypographyScale) => updateConfig({ typographyScale: value }),
    [updateConfig]
  )

  const handlePaginationChange = useCallback(
    (show: boolean) => updateConfig({ showPagination: show }),
    [updateConfig]
  )

  const handleTalkTrackChange = useCallback(
    (show: boolean) => updateConfig({ showInlineTalkTrack: show }),
    [updateConfig]
  )

  // Portal renders outside the presentation surface transform context so that
  // position:fixed resolves against the viewport, matching getBoundingClientRect().
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={PANEL_VISIBLE}
          className="fixed z-50 overflow-hidden rounded-xl border border-border bg-background/95 shadow-lg backdrop-blur-xl"
          exit={reducedMotion ? { opacity: 0 } : PANEL_HIDDEN}
          initial={reducedMotion ? { opacity: 0 } : PANEL_HIDDEN}
          key="slide-config-panel"
          ref={panelRef}
          style={{ top: pos.top, left: pos.left, width: PANEL_WIDTH }}
          tabIndex={-1}
          transition={reducedMotion ? { duration: 0 } : PANEL_TRANSITION}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-border/60 border-b px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="block size-3 shrink-0 rounded-full ring-1 ring-border ring-inset"
                style={{ backgroundColor: 'var(--primary)' }}
              />
              <span className="font-semibold text-foreground text-sm">Slide settings</span>
            </div>
            <Kbd>C</Kbd>
          </div>

          <div className="space-y-3 p-3">
            {/* Layout card */}
            <section className="space-y-3 rounded-lg border border-border/60 bg-card p-3 shadow-none">
              <div className="space-y-1.5">
                <Label className="font-medium text-foreground text-xs">Padding</Label>
                <SegmentControl
                  className="w-full"
                  items={PADDING_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }))}
                  onValueChange={value => handlePaddingChange(value as SlideConfigPadding)}
                  size="sm"
                  tabClassName="w-full"
                  value={padding}
                  variant="label"
                />
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label className="font-medium text-foreground text-xs">Type scale</Label>
                <SegmentControl
                  className="w-full"
                  items={TYPE_SCALE_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }))}
                  onValueChange={value =>
                    handleTypographyScaleChange(value as SlideConfigTypographyScale)
                  }
                  size="sm"
                  tabClassName="w-full font-mono tabular-nums"
                  value={typographyScale}
                  variant="label"
                />
              </div>
            </section>

            {/* Chrome card */}
            <section className="space-y-2.5 rounded-lg border border-border/60 bg-card p-3 shadow-none">
              <SwitchRow
                checked={showPagination}
                label="Pagination overlay"
                onChange={handlePaginationChange}
              />
              <Separator />
              <SwitchRow
                checked={showInlineTalkTrack}
                label="Inline talk track"
                onChange={handleTalkTrackChange}
              />
            </section>

            <Button className="w-full" onClick={handleReset} size="lg" variant="ghost">
              Reset to defaults
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
