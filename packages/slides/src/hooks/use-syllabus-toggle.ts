import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseSyllabusToggleOptions {
  hasSyllabus: boolean
  initialView?: 'slides' | 'syllabus'
  onViewChange?: (view: 'slides' | 'syllabus') => void
  slug: string
}

interface UseSyllabusToggleResult {
  closeSyllabus: () => void
  isSyllabusActive: boolean
  shareUrl: string | undefined
  toggleSyllabus: () => void
}

/**
 * Encapsulates the in-app syllabus view toggle:
 *   - tracks whether the syllabus is the current inner view,
 *   - notifies the parent on every change so the URL can carry `view=syllabus`,
 *   - falls back to the slides view automatically if the syllabus disappears
 *     (e.g. the author removed the `<Syllabus>` block via HMR), so the user
 *     isn't stranded on an empty surface,
 *   - builds the canonical share URL for the standalone syllabus route.
 *
 * The fallback only fires after `hasSyllabus` has been `true` at least once.
 * This prevents the initial mount race where `hasSyllabus` starts `false`
 * (DOM not yet rendered) from immediately clobbering `initialView='syllabus'`.
 */
export function useSyllabusToggle({
  hasSyllabus,
  initialView = 'slides',
  onViewChange,
  slug,
}: UseSyllabusToggleOptions): UseSyllabusToggleResult {
  const [innerView, setInnerView] = useState<'slides' | 'syllabus'>(initialView)
  const isSyllabusActive = innerView === 'syllabus'
  // Tracks whether the deck has confirmed it has a syllabus at least once.
  // Guards against the initial-mount false-negative when hasSyllabus is still
  // false while the MDX tree hasn't rendered yet.
  const hasSyllabusEverBeenTrue = useRef(hasSyllabus)

  const toggleSyllabus = useCallback(() => {
    setInnerView(prev => (prev === 'syllabus' ? 'slides' : 'syllabus'))
  }, [])

  const closeSyllabus = useCallback(() => {
    setInnerView('slides')
  }, [])

  useEffect(() => {
    if (hasSyllabus) {
      hasSyllabusEverBeenTrue.current = true
    }
    // Only fall back when the syllabus genuinely disappears (HMR removal),
    // not on the initial render before the DOM has settled.
    if (innerView === 'syllabus' && !hasSyllabus && hasSyllabusEverBeenTrue.current) {
      setInnerView('slides')
    }
  }, [hasSyllabus, innerView])

  // Store in a ref so identity changes (e.g. when the parent rebuilds the
  // callback because `currentSlide` changed) do NOT re-trigger this effect —
  // we only want to notify when `innerView` itself changes.
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange

  useEffect(() => {
    onViewChangeRef.current?.(innerView)
  }, [innerView])

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    return `${window.location.origin}/syllabus/${slug}`
  }, [slug])

  return { isSyllabusActive, toggleSyllabus, closeSyllabus, shareUrl }
}
