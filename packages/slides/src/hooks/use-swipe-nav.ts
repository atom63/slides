import { type RefObject, useEffect, useRef } from 'react'

const SWIPE_THRESHOLD_PX = 50

/**
 * Attaches touch-swipe navigation to a container element.
 *
 * - Leftward swipe  (deltaX < -50px) → onNext
 * - Rightward swipe (deltaX >  50px) → onPrev
 * - Vertical-dominant swipes are ignored so the user can scroll slide content.
 * - Confirmed horizontal swipes call `event.preventDefault()` to suppress
 *   browser back/forward gesture on mobile Safari/Chrome.
 */
export function useSwipeNav(
  ref: RefObject<HTMLElement | null>,
  {
    onNext,
    onPrev,
  }: {
    onNext: () => void
    onPrev: () => void
  }
) {
  const startX = useRef(0)
  const startY = useRef(0)
  // Refs for callbacks so listener identity doesn't change when slideCount
  // (and thus goNext/goPrev) gets a new identity — avoids listener churn.
  const onNextRef = useRef(onNext)
  const onPrevRef = useRef(onPrev)
  onNextRef.current = onNext
  onPrevRef.current = onPrev

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) {
        return
      }
      startX.current = touch.clientX
      startY.current = touch.clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      if (!touch) {
        return
      }
      const deltaX = touch.clientX - startX.current
      const deltaY = touch.clientY - startY.current

      // Ignore vertical-dominant swipes
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }

      if (deltaX < -SWIPE_THRESHOLD_PX) {
        e.preventDefault()
        onNextRef.current()
      } else if (deltaX > SWIPE_THRESHOLD_PX) {
        e.preventDefault()
        onPrevRef.current()
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref])
}
