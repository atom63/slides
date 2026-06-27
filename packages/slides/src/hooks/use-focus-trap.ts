import { type RefObject, useEffect } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

interface UseFocusTrapOptions {
  /** When false, the trap is inert (no focus moves, no listeners). */
  active: boolean
  /** Called when Escape is pressed inside the trapped container. */
  onEscape?: () => void
}

/**
 * Traps keyboard focus within `containerRef` while `active`.
 *
 * - Moves initial focus into the container on activation (first focusable
 *   element, falling back to the container itself).
 * - Loops Tab / Shift+Tab within the container.
 * - Calls `onEscape` on Escape.
 * - Restores focus to the previously focused element on deactivation.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  { active, onEscape }: UseFocusTrapOptions
) {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        el => el.offsetParent !== null || el === document.activeElement
      )

    // Move initial focus into the panel.
    const focusables = getFocusable()
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      container.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.()
        return
      }
      if (event.key !== 'Tab') return

      const items = getFocusable()
      if (items.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const activeEl = document.activeElement

      if (event.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          event.preventDefault()
          last.focus()
        }
      } else if (activeEl === last || !container.contains(activeEl)) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the trigger if it's still in the document.
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus()
      }
    }
  }, [active, containerRef, onEscape])
}
