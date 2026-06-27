/**
 * Slide Configurator Store
 *
 * Global visual density config for the slides app. Phase 1 exposes a
 * single `padding` setting that drives the default `Cell` padding and
 * `Grid` gap. Phase 2 will extend this with color/typography fields.
 *
 * Persisted to localStorage so the selected padding survives reloads.
 */

import { createContext, useContext } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SlideConfigPadding = 'sm' | 'md' | 'lg'

/**
 * Slide-only type multiplier. Applied as a CSS variable
 * (`--slide-type-scale`) on the slide content root; every slide
 * primitive wraps its canvas-px sizes in `calc(Npx * var(--slide-type-scale, 1))`
 * so nudging this knob scales every piece of slide text in lockstep.
 *
 * Deliberately isolated from the site-wide `--typography-scale`: the
 * slide artboard is sovereign, tuned to exact px ratios, and should
 * not follow global UI density changes.
 */
export type SlideConfigTypographyScale = 'sm' | 'md' | 'lg' | 'xl'

export const TYPOGRAPHY_SCALE_VALUES: Record<SlideConfigTypographyScale, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.1,
  xl: 1.2,
}

interface SlideConfigState {
  padding: SlideConfigPadding
  reset: () => void
  showInlineTalkTrack: boolean
  showPagination: boolean
  typographyScale: SlideConfigTypographyScale
  updateConfig: (patch: Partial<Omit<SlideConfigState, 'updateConfig' | 'reset'>>) => void
}

const DEFAULT_PADDING: SlideConfigPadding = 'md'
const DEFAULT_SHOW_PAGINATION = true
const DEFAULT_SHOW_INLINE_TALK_TRACK = false
const DEFAULT_TYPOGRAPHY_SCALE: SlideConfigTypographyScale = 'md'

/**
 * Content safe-area inset in pixels. Horizontal `px` matches where folio
 * chrome aligns on the left/right. Vertical `py` is larger than
 * `SLIDE_FRAME_WATERMARK_PX` so the layout grid sits below/above the thin
 * watermark band at the slide edges.
 */
export const FRAME_PADDING_PX: Record<SlideConfigPadding, { px: number; py: number }> = {
  sm: { px: 24, py: 36 },
  md: { px: 40, py: 52 },
  lg: { px: 72, py: 88 },
}

/**
 * Folio chrome offset from the slide top/bottom edges. Tighter than
 * `FRAME_PADDING_PX.py` so labels read as a margin watermark outside the
 * content grid while sharing the same horizontal gutters as `px`.
 */
export const SLIDE_FRAME_WATERMARK_PX: Record<SlideConfigPadding, { pb: number; pt: number }> = {
  sm: { pt: 8, pb: 8 },
  md: { pt: 12, pb: 12 },
  lg: { pt: 16, pb: 16 },
}

/**
 * Grid gap in pixels for each config padding level. Matches Tailwind's
 * `gap-4` / `gap-6` / `gap-10` utilities which the `Grid` primitive uses via
 * its `gapClasses` map, so the grid overlay renders the same gutters as the
 * real slide layout.
 */
export const CONFIG_GAP_PX: Record<SlideConfigPadding, number> = {
  sm: 16,
  md: 24,
  lg: 40,
}

export const useSlideConfig = create<SlideConfigState>()(
  persist(
    set => ({
      padding: DEFAULT_PADDING,
      showPagination: DEFAULT_SHOW_PAGINATION,
      showInlineTalkTrack: DEFAULT_SHOW_INLINE_TALK_TRACK,
      typographyScale: DEFAULT_TYPOGRAPHY_SCALE,
      updateConfig: patch => set(patch),
      reset: () =>
        set({
          padding: DEFAULT_PADDING,
          showPagination: DEFAULT_SHOW_PAGINATION,
          showInlineTalkTrack: DEFAULT_SHOW_INLINE_TALK_TRACK,
          typographyScale: DEFAULT_TYPOGRAPHY_SCALE,
        }),
    }),
    {
      name: 'atom63-slide-config',
      version: 5,
      partialize: state => ({
        padding: state.padding,
        showPagination: state.showPagination,
        showInlineTalkTrack: state.showInlineTalkTrack,
        typographyScale: state.typographyScale,
      }),
    }
  )
)

/**
 * Replaces per-primitive Zustand subscriptions for `padding` with a single
 * subscription at the slide content root. Grid and Cell read this context
 * instead of subscribing independently — N subscriptions become 1.
 * Default matches the store default so the fallback is always correct.
 */
export const SlidePaddingContext = createContext<SlideConfigPadding>('md')
export const useSlidePadding = () => useContext(SlidePaddingContext)
