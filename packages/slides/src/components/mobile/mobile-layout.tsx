import {
  Button,
  ButtonGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../primitives'
import { ArrowLeft } from 'lucide-react'
import { MDXProvider } from '@mdx-js/react'
import type { CSSProperties, Ref, RefObject } from 'react'
import { useRef } from 'react'
import { slideMdxComponents } from '../../content/mdx-components'
import type { DeckOutline } from '../../hooks/use-deck-outline'
import { useSwipeNav } from '../../hooks/use-swipe-nav'
import { SlidePaddingContext, useSlideConfig } from '../../stores/config-store'
import type { SlideDeckItem } from '../../types'
import { SlideConfigPanel } from '../config/config-panel'
import { SlideOverview } from '../stage/overview'
import { SlideStage } from '../stage/stage'
import { SyllabusView } from '../syllabus/syllabus-view'
import { MobileBottomBar } from './mobile-bottom-bar'

export interface MobilePresentationLayoutProps {
  configButtonRef: Ref<HTMLButtonElement>
  contentRef: RefObject<HTMLDivElement | null>
  currentSlideIndex: number
  deck: SlideDeckItem
  deckVersion: number
  domGeneration: number
  framePadding: { px: number; py: number }
  goNext: () => void
  goPrev: () => void
  handleOverviewSelect: (index: number) => void
  hasSyllabus: boolean
  isConfigOpen: boolean
  isSyllabusActive: boolean
  onBack: () => void
  onCloseConfig: () => void
  onToggleConfig: () => void
  onToggleOverview: () => void
  onToggleSyllabus: () => void
  outline: DeckOutline
  shareUrl: string | undefined
  showOverview: boolean
  slideCount: number
  typographyScaleValue: number
}

export function MobilePresentationLayout({
  configButtonRef,
  contentRef,
  currentSlideIndex,
  deck,
  deckVersion,
  domGeneration,
  framePadding,
  goNext,
  goPrev,
  handleOverviewSelect,
  hasSyllabus,
  isConfigOpen,
  isSyllabusActive,
  onBack,
  onCloseConfig,
  onToggleConfig,
  onToggleOverview,
  onToggleSyllabus,
  outline,
  shareUrl,
  showOverview,
  slideCount,
  typographyScaleValue,
}: MobilePresentationLayoutProps) {
  const Content = deck.content ?? (() => null)
  const theme = deck.meta.theme ?? 'auto'
  const preset = deck.meta.preset
  const padding = useSlideConfig(state => state.padding)

  // Attach swipe gestures to the slide stage area
  const stageRef = useRef<HTMLDivElement>(null)
  useSwipeNav(stageRef, { onNext: goNext, onPrev: goPrev })

  return (
    <div className="flex h-full flex-col bg-background" data-slide-app>
      {/* Slim top bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-border/40 border-b px-3">
        <TooltipProvider>
          <ButtonGroup size="icon-sm">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button onClick={onBack} size="icon-sm" type="button" variant="ghost">
                    <ArrowLeft aria-hidden />
                  </Button>
                }
              />
              <TooltipContent>Back to decks</TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </TooltipProvider>
        <span className="min-w-0 flex-1 truncate font-medium text-foreground/80 text-sm">
          {deck.meta.title}
        </span>
      </div>

      {/* Main area: slide stage or syllabus.
          IMPORTANT: The SlideStage + content div are always rendered (never
          unmounted) so that contentRef stays attached to the DOM. useSlidesDom
          holds a MutationObserver on contentRef.current — if it goes null the
          observer detaches and slide visibility won't recover when switching
          back from syllabus. We use `hidden` to visually hide it instead. */}
      <div className="relative min-h-0 flex-1" ref={stageRef}>
        <div className={isSyllabusActive ? 'hidden' : 'flex size-full flex-col'}>
          <SlideStage preset={preset} theme={theme}>
            <div
              className="scrollbar-reveal flex size-full min-h-0 flex-col justify-center overflow-y-auto"
              data-slide-content
              data-slide-theme={theme}
              ref={contentRef}
              style={
                {
                  paddingLeft: `${framePadding.px}px`,
                  paddingRight: `${framePadding.px}px`,
                  paddingTop: `${framePadding.py}px`,
                  paddingBottom: `${framePadding.py}px`,
                  '--slide-frame-px': `${framePadding.px}px`,
                  '--slide-frame-py': `${framePadding.py}px`,
                  '--slide-type-scale': String(typographyScaleValue),
                } as CSSProperties
              }
            >
              <SlidePaddingContext.Provider value={padding}>
                <MDXProvider components={slideMdxComponents}>
                  <Content key={deckVersion} />
                </MDXProvider>
              </SlidePaddingContext.Provider>
            </div>
          </SlideStage>
        </div>

        {isSyllabusActive && (
          <SyllabusView
            content={Content}
            contentVersion={deckVersion}
            deckDate={deck.meta.date}
            deckDescription={deck.meta.description}
            deckTitle={deck.meta.title}
            outline={outline}
            shareUrl={shareUrl}
          />
        )}

        {showOverview && (
          <SlideOverview
            currentSlide={currentSlideIndex}
            generation={domGeneration}
            onSelect={handleOverviewSelect}
            slideCount={slideCount}
            sourceRef={contentRef}
          />
        )}
      </div>

      {/* Bottom controls */}
      <MobileBottomBar
        configButtonRef={configButtonRef}
        currentSlide={currentSlideIndex}
        hasSyllabus={hasSyllabus}
        isConfigOpen={isConfigOpen}
        isSyllabusActive={isSyllabusActive}
        onNext={goNext}
        onPrev={goPrev}
        onToggleConfig={onToggleConfig}
        onToggleOverview={onToggleOverview}
        onToggleSyllabus={onToggleSyllabus}
        showOverview={showOverview}
        slideCount={slideCount}
      />

      <SlideConfigPanel
        anchorRef={configButtonRef as RefObject<HTMLElement | null>}
        isOpen={isConfigOpen}
        onClose={onCloseConfig}
      />
    </div>
  )
}
