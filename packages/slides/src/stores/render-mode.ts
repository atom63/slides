import { createContext, useContext } from 'react'

export type SlideRenderMode = 'presentation' | 'web-syllabus'

/** Controls how slide components render. Default is presentation mode. */
export const SlideRenderModeContext = createContext<SlideRenderMode>('presentation')

export function useSlideRenderMode(): SlideRenderMode {
  return useContext(SlideRenderModeContext)
}

/** Signals to the syllabus page that a <Syllabus> block was actually rendered. */
export const SyllabusDetectContext = createContext<(() => void) | null>(null)
