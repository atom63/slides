import type { ComponentType, ReactNode } from 'react'

export type SlideLayout = 'cover' | 'title' | 'content' | 'split' | 'media-full' | 'quote'

export interface SlideDeckMeta {
  date: string
  description?: string
  /**
   * When `true`, deck requires a password (server env `SLIDE_PASSWORD_<SLUG>`).
   * Defaults to `false`.
   */
  locked?: boolean
  preset?: string
  /**
   * Deck theme. `'auto'` (the default) inherits the site theme so the deck
   * follows the user's current setting. `'dark'` / `'light'` force the canvas
   * regardless of the site theme.
   */
  theme?: 'auto' | 'dark' | 'light'
  title: string
}

export interface SlideDeckItem {
  content?: ComponentType
  meta: SlideDeckMeta
  slideCount?: number
  slug: string
}

export interface ParsedSlide {
  content: ReactNode[]
  layout: SlideLayout
  notes: ReactNode | null
}
