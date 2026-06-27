import {
  Button,
  ButtonGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../primitives'
import { BookOpen, ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal } from 'lucide-react'
import type { Ref } from 'react'

interface MobileBottomBarProps {
  configButtonRef: Ref<HTMLButtonElement>
  currentSlide: number
  hasSyllabus: boolean
  isConfigOpen: boolean
  isSyllabusActive: boolean
  onNext: () => void
  onPrev: () => void
  onToggleConfig: () => void
  onToggleOverview: () => void
  onToggleSyllabus: () => void
  showOverview: boolean
  slideCount: number
}

export function MobileBottomBar({
  configButtonRef,
  currentSlide,
  hasSyllabus,
  isConfigOpen,
  isSyllabusActive,
  onNext,
  onPrev,
  onToggleConfig,
  onToggleOverview,
  onToggleSyllabus,
  showOverview,
  slideCount,
}: MobileBottomBarProps) {
  return (
    <div className="shrink-0 border-border/40 border-t bg-background">
      {/* Row 1 — secondary actions */}
      <div className="flex items-center justify-end gap-1.5 px-3 pt-1.5">
        <TooltipProvider>
          <ButtonGroup size="icon-sm">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={onToggleOverview}
                    size="icon-sm"
                    type="button"
                    variant={showOverview ? 'secondary' : 'ghost'}
                  >
                    <LayoutGrid aria-hidden />
                  </Button>
                }
              />
              <TooltipContent side="top">
                {showOverview ? 'Hide overview' : 'Slide overview'}
              </TooltipContent>
            </Tooltip>

            {hasSyllabus && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      onClick={onToggleSyllabus}
                      size="icon-sm"
                      type="button"
                      variant={isSyllabusActive ? 'secondary' : 'ghost'}
                    >
                      <BookOpen aria-hidden />
                    </Button>
                  }
                />
                <TooltipContent side="top">
                  {isSyllabusActive ? 'Back to slides' : 'View syllabus'}
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={onToggleConfig}
                    ref={configButtonRef}
                    size="icon-sm"
                    type="button"
                    variant={isConfigOpen ? 'secondary' : 'ghost'}
                  >
                    <SlidersHorizontal aria-hidden />
                  </Button>
                }
              />
              <TooltipContent side="top">
                {isConfigOpen ? 'Close settings' : 'Slide settings'}
              </TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </TooltipProvider>
      </div>

      {/* Row 2 — navigation */}
      <div className="flex items-center px-3 pt-1 pb-3">
        <ButtonGroup size="icon-sm">
          <Button
            aria-label="Previous slide"
            onClick={onPrev}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <ChevronLeft aria-hidden />
          </Button>
        </ButtonGroup>
        <span className="flex-1 text-center font-mono text-muted-foreground text-xs tabular-nums">
          {currentSlide + 1} / {slideCount}
        </span>
        <ButtonGroup size="icon-sm">
          <Button
            aria-label="Next slide"
            onClick={onNext}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <ChevronRight aria-hidden />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
