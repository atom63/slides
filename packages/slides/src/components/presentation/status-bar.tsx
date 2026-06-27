import { PresentationStatusBar } from './chrome'

interface SlideStatusBarProps {
  currentSlide?: number
  deckCount?: number
  totalSlides?: number
  view: 'picker' | 'presentation'
}

export function SlideStatusBar({
  view,
  deckCount,
  currentSlide,
  totalSlides,
}: SlideStatusBarProps) {
  if (view === 'picker') {
    return (
      <PresentationStatusBar>
        {deckCount ?? 0} deck{deckCount !== 1 ? 's' : ''}
      </PresentationStatusBar>
    )
  }

  return (
    <PresentationStatusBar>
      {(currentSlide ?? 0) + 1} / {totalSlides ?? 0}
    </PresentationStatusBar>
  )
}
