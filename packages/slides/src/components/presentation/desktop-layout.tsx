import { MDXProvider } from '@mdx-js/react'
import type { CSSProperties, Dispatch, Ref, RefObject, SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import { slideMdxComponents } from '../../content/mdx-components'
import type { DeckOutline } from '../../hooks/use-deck-outline'
import type { usePresenterPip } from '../../hooks/use-presenter-pip'
import { SlidePaddingContext, useSlideConfig } from '../../stores/config-store'
import type { SlideDeckItem } from '../../types'
import { SlideConfigPanel } from '../config/config-panel'
import { SlideFrame } from '../stage/frame'
import { SlideLayoutGrid } from '../stage/layout-grid'
import { SlideOverview } from '../stage/overview'
import { SlideStage } from '../stage/stage'
import { SyllabusView } from '../syllabus/syllabus-view'
import { PresentationSidebar } from './chrome'
import { SlidePresenterPip } from './presenter-pip'
import { SlideSidebar } from './sidebar'
import { SlideStatusBar } from './status-bar'
import { SlideToolbar } from './toolbar'

export interface DesktopPresentationLayoutProps {
  configButtonRef: Ref<HTMLButtonElement>
  containerRef: RefObject<HTMLDivElement | null>
  contentAreaRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  currentSection: string | null
  currentSlideIndex: number
  currentTalkTrack: string | null
  deck: SlideDeckItem
  deckVersion: number
  domGeneration: number
  framePadding: { px: number; py: number }
  handleOverviewSelect: (index: number) => void
  hasSyllabus: boolean
  isConfigOpen: boolean
  isFullscreen: boolean
  isOverlay: boolean
  isSidebarVisible: boolean
  isSyllabusActive: boolean
  onBack: () => void
  onCloseConfig: () => void
  onCloseSidebar: () => void
  onCloseSyllabus: () => void
  onRefreshDeck: () => void
  onSyllabusWidthChange: (w: number) => void
  onToggleConfig: () => void
  onToggleFullscreen: () => void
  onToggleGrid: () => void
  onToggleOverview: () => void
  onTogglePresenter: () => void
  onToggleSidebar: () => void
  onToggleSource?: () => void
  isSourceOpen?: boolean
  onToggleSyllabus: () => void
  onWidthChange: (w: number) => void
  outline: DeckOutline
  presenterPip: ReturnType<typeof usePresenterPip>
  setCurrentSlideIndex: Dispatch<SetStateAction<number>>
  shareUrl: string | undefined
  showGrid: boolean
  showInlineTalkTrack: boolean
  showOverview: boolean
  showPagination: boolean
  sidebarWidth: number
  slideCount: number
  syllabusWidth: number
  typographyScaleValue: number
}

export function DesktopPresentationLayout({
  configButtonRef,
  containerRef,
  contentAreaRef,
  contentRef,
  currentSection,
  currentSlideIndex,
  currentTalkTrack,
  deck,
  deckVersion,
  domGeneration,
  framePadding,
  handleOverviewSelect,
  hasSyllabus,
  isConfigOpen,
  isFullscreen,
  isOverlay,
  isSidebarVisible,
  isSyllabusActive,
  onBack,
  onCloseConfig,
  onCloseSidebar,
  onRefreshDeck,
  onToggleConfig,
  onToggleFullscreen,
  onToggleGrid,
  onToggleOverview,
  onTogglePresenter,
  onToggleSidebar,
  onToggleSource,
  isSourceOpen,
  onCloseSyllabus,
  onToggleSyllabus,
  onSyllabusWidthChange,
  onWidthChange,
  outline,
  syllabusWidth,
  presenterPip,
  setCurrentSlideIndex,
  shareUrl,
  showGrid,
  showInlineTalkTrack,
  showOverview,
  showPagination,
  sidebarWidth,
  slideCount,
  typographyScaleValue,
}: DesktopPresentationLayoutProps) {
  const showChrome = !(isFullscreen || presenterPip.isOpen)
  const padding = useSlideConfig(state => state.padding)

  const Content = deck.content ?? (() => null)
  const theme = deck.meta.theme ?? 'auto'
  const preset = deck.meta.preset

  return (
    <div
      className={`flex h-full flex-col ${isFullscreen ? 'bg-background' : ''}`}
      data-slide-app
      ref={containerRef}
    >
      {showChrome && (
        <SlideToolbar
          configButtonRef={configButtonRef}
          hasSyllabus={hasSyllabus}
          isConfigOpen={isConfigOpen}
          isPresenterMode={presenterPip.isOpen}
          isPresenterSupported={presenterPip.isSupported}
          isSidebarVisible={isSidebarVisible}
          isSourceOpen={isSourceOpen}
          isSyllabusActive={isSyllabusActive}
          onBack={onBack}
          onRefreshDeck={onRefreshDeck}
          onToggleConfig={onToggleConfig}
          onToggleFullscreen={onToggleFullscreen}
          onToggleGrid={onToggleGrid}
          onToggleOverview={onToggleOverview}
          onTogglePresenter={onTogglePresenter}
          onToggleSidebar={onToggleSidebar}
          onToggleSource={onToggleSource}
          onToggleSyllabus={onToggleSyllabus}
          showGrid={showGrid}
          showOverview={showOverview}
          view="presentation"
        />
      )}

      <div className="relative flex min-h-0 flex-1" ref={contentAreaRef}>
        {showChrome && (
          <SlideSidebar
            currentSlide={currentSlideIndex}
            generation={domGeneration}
            isOverlay={isOverlay}
            isVisible={isSidebarVisible}
            onClose={onCloseSidebar}
            onSelect={setCurrentSlideIndex}
            onWidthChange={onWidthChange}
            slideCount={slideCount}
            sourceRef={contentRef}
            width={sidebarWidth}
          />
        )}
        {/* Stage + syllabus side panel share a flex row so the slide
            rescales automatically when the panel opens/closes. */}
        <div className="flex min-h-0 flex-1">
          <SlideStage preset={preset} theme={theme}>
            {showGrid && <SlideLayoutGrid />}
            {showPagination && (
              <SlideFrame
                currentSlide={currentSlideIndex}
                deckTitle={deck.meta.title}
                section={currentSection}
                totalSlides={slideCount}
              />
            )}
            <div
              className="scrollbar-reveal flex size-full min-h-0 flex-col justify-center overflow-y-auto transition-[padding] duration-300 ease-out"
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

          <PresentationSidebar
            isOverlay={isOverlay}
            isVisible={isSyllabusActive && !presenterPip.isOpen}
            maxWidth={600}
            minWidth={320}
            onClose={onCloseSyllabus}
            onWidthChange={onSyllabusWidthChange}
            overlayMaxWidth={400}
            side="right"
            width={syllabusWidth}
          >
            <SyllabusView
              content={Content}
              contentVersion={deckVersion}
              deckDate={deck.meta.date}
              deckDescription={deck.meta.description}
              deckTitle={deck.meta.title}
              outline={outline}
              shareUrl={shareUrl}
            />
          </PresentationSidebar>
        </div>

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

      {showInlineTalkTrack && showChrome && (
        <div className="border-border/50 border-t bg-secondary/30 px-6 py-4">
          <div className="mb-1 font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Talk track
          </div>
          <div className="scrollbar-reveal max-h-32 overflow-y-auto" key={currentTalkTrack}>
            {currentTalkTrack ? (
              <p className="whitespace-pre-line text-base text-foreground/80 leading-relaxed">
                {currentTalkTrack}
              </p>
            ) : (
              <p className="text-muted-foreground/40 text-xs italic">
                No talk track for this slide
              </p>
            )}
          </div>
        </div>
      )}

      {showChrome && (
        <SlideStatusBar
          currentSlide={currentSlideIndex}
          totalSlides={slideCount}
          view="presentation"
        />
      )}

      {presenterPip.pipRoot &&
        createPortal(
          <SlidePresenterPip
            currentSlideIndex={currentSlideIndex}
            currentTalkTrack={currentTalkTrack}
            generation={domGeneration}
            nextSlideIndex={currentSlideIndex + 1 < slideCount ? currentSlideIndex + 1 : null}
            slideCount={slideCount}
            sourceRef={contentRef}
          />,
          presenterPip.pipRoot
        )}

      <SlideConfigPanel
        anchorRef={configButtonRef as RefObject<HTMLElement | null>}
        isOpen={isConfigOpen}
        onClose={onCloseConfig}
      />
    </div>
  )
}
