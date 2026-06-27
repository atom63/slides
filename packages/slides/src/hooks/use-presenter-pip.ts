import { useCallback, useEffect, useRef, useState } from 'react'

// Document Picture-in-Picture API types (not yet in standard lib.dom)
interface DocumentPictureInPictureOptions {
  height?: number
  width?: number
}

interface DocumentPictureInPictureApi {
  requestWindow: (options?: DocumentPictureInPictureOptions) => Promise<Window>
  readonly window: Window | null
}

declare global {
  interface Window {
    readonly documentPictureInPicture?: DocumentPictureInPictureApi
  }
}

const PIP_WIDTH = 640
const PIP_HEIGHT = 480

/**
 * Mirror parent document's stylesheets, base URI, and theme classes into
 * the PiP document so cloned content renders identically.
 */
function setupPipDocument(source: Document, target: Document): void {
  // Set base href so relative URLs in cloned <img>/<video> resolve correctly
  const baseTag = target.createElement('base')
  baseTag.href = source.baseURI
  target.head.appendChild(baseTag)

  // Clone all linked stylesheets and inline style tags from parent head
  const styleNodes = source.head.querySelectorAll('link[rel="stylesheet"], style')
  for (const node of styleNodes) {
    target.head.appendChild(node.cloneNode(true))
  }

  // Mirror root attributes (data-theme, color-scheme, etc.) and class lists
  for (const attr of source.documentElement.attributes) {
    target.documentElement.setAttribute(attr.name, attr.value)
  }
  target.documentElement.className = source.documentElement.className
  target.body.className = source.body.className

  // Reset PiP body margin so the React root can fill the viewport
  target.body.style.margin = '0'
  target.body.style.height = '100vh'
}

interface UsePresenterPipResult {
  close: () => void
  isOpen: boolean
  isSupported: boolean
  open: () => Promise<void>
  pipRoot: HTMLElement | null
  pipWindow: Window | null
  toggle: () => Promise<void>
}

/**
 * Manages a Document Picture-in-Picture window. The caller renders content
 * into `pipRoot` via `createPortal`. State is reactive because the React
 * tree spans both the parent window and the PiP window.
 */
export function usePresenterPip(): UsePresenterPipResult {
  const [pipWindow, setPipWindow] = useState<Window | null>(null)
  const [pipRoot, setPipRoot] = useState<HTMLElement | null>(null)
  const isOpeningRef = useRef(false)

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window

  const close = useCallback(() => {
    if (pipWindow) {
      pipWindow.close()
    }
  }, [pipWindow])

  const open = useCallback(async () => {
    if (!isSupported || pipWindow || isOpeningRef.current) {
      return
    }
    const api = window.documentPictureInPicture
    if (!api) {
      return
    }
    isOpeningRef.current = true
    try {
      const win = await api.requestWindow({
        width: PIP_WIDTH,
        height: PIP_HEIGHT,
      })

      setupPipDocument(document, win.document)

      const root = win.document.createElement('div')
      root.style.height = '100%'
      win.document.body.appendChild(root)

      // Self-removing so a closed PiP window leaves no stale listener.
      const handlePageHide = () => {
        win.removeEventListener('pagehide', handlePageHide)
        setPipWindow(null)
        setPipRoot(null)
      }
      win.addEventListener('pagehide', handlePageHide)

      setPipWindow(win)
      setPipRoot(root)
    } catch (error) {
      // requestWindow rejects on blocked permissions / policy. Swallow it so the
      // failure doesn't become an unhandled rejection; finally re-arms isOpeningRef
      // so a later attempt can still open.
      console.error('Failed to open presenter Picture-in-Picture window:', error)
    } finally {
      isOpeningRef.current = false
    }
  }, [isSupported, pipWindow])

  const toggle = useCallback(async () => {
    if (pipWindow) {
      close()
      return
    }
    await open()
  }, [pipWindow, open, close])

  // Close on Escape from the main window
  useEffect(() => {
    if (!pipWindow) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pipWindow, close])

  // Cleanup on unmount: close any open PiP window
  useEffect(() => {
    return () => {
      if (pipWindow) {
        pipWindow.close()
      }
    }
  }, [pipWindow])

  return {
    isOpen: pipWindow !== null,
    isSupported,
    open,
    close,
    toggle,
    pipRoot,
    pipWindow,
  }
}
