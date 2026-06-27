import { useCallback, useEffect, useRef, useState } from 'react'

export function useFullscreen() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }

    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) {
      return
    }

    if (document.fullscreenElement) {
      // Can reject if exiting is blocked; the fullscreenchange listener keeps
      // isFullscreen authoritative either way.
      document.exitFullscreen().catch(error => {
        console.error('Failed to exit fullscreen:', error)
      })
    } else {
      // Rejects on user denial / locked fullscreen — swallow so it doesn't
      // surface as an unhandled rejection.
      containerRef.current.requestFullscreen().catch(error => {
        console.error('Failed to enter fullscreen:', error)
      })
    }
  }, [])

  return { containerRef, isFullscreen, toggleFullscreen }
}
