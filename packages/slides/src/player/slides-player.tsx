import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SlidePasswordGate } from '../components/config/password-gate'
import { MobilePresentationLayout } from '../components/mobile/mobile-layout'
import { DesktopPresentationLayout } from '../components/presentation/desktop-layout'
import { useDeckOutline } from '../hooks/use-deck-outline'
import { useFullscreen } from '../hooks/use-fullscreen'
import { useIsMobile } from '../hooks/use-is-mobile'
import { usePresenterPip } from '../hooks/use-presenter-pip'
import { useSlidesDom } from '../hooks/use-slides-dom'
import { useSyllabus } from '../hooks/use-syllabus'
import { useSyllabusToggle } from '../hooks/use-syllabus-toggle'
import { FRAME_PADDING_PX, TYPOGRAPHY_SCALE_VALUES, useSlideConfig } from '../stores/config-store'
import type { SlidesPlayerProps } from './slides-player-types'

/**
 * Host-agnostic presentation player. Receives a fully-loaded deck and renders
 * the full presentation UI (stage, sidebar, toolbar, keyboard nav).
 *
 * The host is responsible for: page meta, content loading, gate persistence,
 * and routing. This component only handles presentation orchestration.
 */
export function SlidesPlayer({
  deck,
  initialSlide = 0,
  onBack,
  onSlideChange,
  onToggleSource,
  isSourceOpen,
  gateProvider,
  renderCodeGate,
}: SlidesPlayerProps) {
  const [deckUnlocked, setDeckUnlocked] = useState(() => {
    if (!gateProvider) return true
    const isLocked = deck.meta.locked ?? false
    if (!isLocked) return true
    return gateProvider.isUnlocked(deck.slug)
  })

  const isLocked = deck.meta.locked ?? false

  if (isLocked && !deckUnlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <SlidePasswordGate
          deckTitle={deck.meta.title}
          gateProvider={gateProvider!}
          onBack={onBack}
          onUnlock={() => setDeckUnlocked(true)}
          renderCodeGate={renderCodeGate}
          slug={deck.slug}
        />
      </div>
    )
  }

  return (
    <SlidesPlayerMounted
      deck={deck}
      initialSlide={initialSlide}
      isSourceOpen={isSourceOpen}
      onBack={onBack}
      onSlideChange={onSlideChange}
      onToggleSource={onToggleSource}
    />
  )
}

const PAGE_NAV_NEXT_KEYS = ['ArrowRight', 'ArrowDown', ' ']
const PAGE_NAV_PREV_KEYS = ['ArrowLeft', 'ArrowUp']

function SlidesPlayerMounted({
  deck,
  initialSlide,
  onBack,
  onSlideChange,
  onToggleSource,
  isSourceOpen,
}: {
  deck: SlidesPlayerProps['deck']
  initialSlide: number
  onBack: () => void
  onSlideChange?: (index: number) => void
  onToggleSource?: () => void
  isSourceOpen?: boolean
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide)
  const [showGrid, setShowGrid] = useState(false)
  const [showOverview, setShowOverview] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(208)
  const [syllabusWidth, setSyllabusWidth] = useState(400)
  const [contentVersion, setContentVersion] = useState(0)
  const configButtonRef = useRef<HTMLButtonElement>(null)
  const contentAreaRef = useRef<HTMLDivElement>(null)

  const configPadding = useSlideConfig(state => state.padding)
  const showPagination = useSlideConfig(state => state.showPagination)
  const showInlineTalkTrack = useSlideConfig(state => state.showInlineTalkTrack)
  const typographyScale = useSlideConfig(state => state.typographyScale)
  const framePadding = FRAME_PADDING_PX[configPadding]
  const typographyScaleValue = TYPOGRAPHY_SCALE_VALUES[typographyScale]

  const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen()
  const presenterPip = usePresenterPip()

  const isMobile = useIsMobile()

  // When the layout switches (mobile ↔ desktop), the div holding ref={contentRef}
  // remounts. useSlidesDom's effects don't see the new node because contentRef is
  // a plain ref — bumping contentVersion forces a re-scan before the browser paints.
  // biome-ignore lint/correctness/useExhaustiveDependencies: isMobile is the change trigger, not a value consumed in the body
  useLayoutEffect(() => {
    setContentVersion(v => v + 1)
  }, [isMobile])

  const { contentRef, slideCount, currentTalkTrack, currentSection, domGeneration } = useSlidesDom(
    currentSlideIndex,
    contentVersion,
    true
  )
  const outline = useDeckOutline(contentRef, domGeneration)
  const { hasSyllabus } = useSyllabus(contentRef, domGeneration)
  const { isSyllabusActive, toggleSyllabus, closeSyllabus, shareUrl } = useSyllabusToggle({
    hasSyllabus,
    slug: deck.slug,
  })

  // Clamp to a valid index once slideCount resolves from MDX
  useEffect(() => {
    if (slideCount < 1) {
      return
    }
    setCurrentSlideIndex(prev => (prev >= slideCount ? slideCount - 1 : prev))
  }, [slideCount])

  // Notify host of slide changes without pushing history entries
  useEffect(() => {
    onSlideChange?.(currentSlideIndex)
  }, [currentSlideIndex, onSlideChange])

  const goNext = useCallback(() => {
    setCurrentSlideIndex(prev => Math.min(prev + 1, slideCount - 1))
  }, [slideCount])

  const goPrev = useCallback(() => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const goFirst = useCallback(() => {
    setCurrentSlideIndex(0)
  }, [])

  const goLast = useCallback(() => {
    setCurrentSlideIndex(slideCount - 1)
  }, [slideCount])

  const handleOverviewSelect = useCallback((index: number) => {
    setCurrentSlideIndex(index)
    setShowOverview(false)
  }, [])

  // Keyboard navigation — active on the standalone page and forwarded to the
  // presenter Picture-in-Picture window. Keydown fires in the focused document's
  // context, so the PiP window (a separate document) needs its own listener;
  // both share the handler below so navigation behaves identically in either.
  //
  // Refs keep all volatile values current so the listener is registered once
  // on mount and never torn down / re-added as callbacks or showOverview change.
  const goNextRef = useRef(goNext)
  const goPrevRef = useRef(goPrev)
  const goFirstRef = useRef(goFirst)
  const goLastRef = useRef(goLast)
  const showOverviewRef = useRef(showOverview)
  const toggleFullscreenRef = useRef(toggleFullscreen)
  const togglePresenterRef = useRef(presenterPip.toggle)
  goNextRef.current = goNext
  goPrevRef.current = goPrev
  goFirstRef.current = goFirst
  goLastRef.current = goLast
  showOverviewRef.current = showOverview
  toggleFullscreenRef.current = toggleFullscreen
  togglePresenterRef.current = presenterPip.toggle

  const playerRef = useRef<HTMLDivElement>(null)

  // Shared keydown logic for the main player and the PiP presenter window.
  // Returns true when the key was handled (and preventDefault was called).
  const handleNavKeyDown = useCallback((e: KeyboardEvent): boolean => {
    const el = e.target as HTMLElement
    const tag = el?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) {
      return false
    }
    const key = e.key
    if (key === 'Escape' && showOverviewRef.current) {
      e.preventDefault()
      setShowOverview(false)
      return true
    }

    let handled = true
    if (PAGE_NAV_NEXT_KEYS.includes(key)) {
      goNextRef.current()
    } else if (PAGE_NAV_PREV_KEYS.includes(key)) {
      goPrevRef.current()
    } else if (key === 'Home') {
      goFirstRef.current()
    } else if (key === 'End') {
      goLastRef.current()
    } else if (key === 'f' || key === 'F') {
      toggleFullscreenRef.current()
    } else if (key === 'p' || key === 'P') {
      togglePresenterRef.current()
    } else {
      handled = false
    }

    if (handled) {
      e.preventDefault()
    }
    return handled
  }, [])

  useEffect(() => {
    const el = playerRef.current
    if (!el) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (handleNavKeyDown(e)) {
        // Keep focus on the stable player root. The sidebar thumbnail list is
        // virtualized, so the focused thumbnail unmounts as the list scrolls;
        // without this, focus falls to <body> after ~one viewport of nav and
        // arrow keys stop reaching this handler (they revert to page scroll).
        playerRef.current?.focus()
      }
    }
    el.addEventListener('keydown', handleKeyDown)
    return () => {
      el.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleNavKeyDown])

  // Forward navigation keys typed while the presenter PiP window has focus.
  // Its keydown events fire in the PiP document, so they never reach the main
  // player's listener above — the PiP window needs its own.
  const pipWindow = presenterPip.pipWindow
  useEffect(() => {
    if (!pipWindow) return
    pipWindow.addEventListener('keydown', handleNavKeyDown)
    return () => {
      pipWindow.removeEventListener('keydown', handleNavKeyDown)
    }
  }, [pipWindow, handleNavKeyDown])

  useEffect(() => {
    playerRef.current?.focus()
  }, [])

  const handleRefreshDeck = useCallback(() => {
    setContentVersion(v => v + 1)
  }, [])

  if (isMobile) {
    return (
      <div
        className="flex h-full flex-col bg-transparent outline-none"
        ref={playerRef}
        tabIndex={-1}
      >
        <div className="min-h-0 flex-1">
          <MobilePresentationLayout
            configButtonRef={configButtonRef}
            contentRef={contentRef}
            currentSlideIndex={currentSlideIndex}
            deck={deck}
            deckVersion={0}
            domGeneration={domGeneration}
            framePadding={framePadding}
            goNext={goNext}
            goPrev={goPrev}
            handleOverviewSelect={handleOverviewSelect}
            hasSyllabus={hasSyllabus}
            isConfigOpen={isConfigOpen}
            isSyllabusActive={isSyllabusActive}
            onBack={onBack}
            onCloseConfig={() => setIsConfigOpen(false)}
            onToggleConfig={() => setIsConfigOpen(prev => !prev)}
            onToggleOverview={() => setShowOverview(prev => !prev)}
            onToggleSyllabus={toggleSyllabus}
            outline={outline}
            shareUrl={shareUrl}
            showOverview={showOverview}
            slideCount={slideCount}
            typographyScaleValue={typographyScaleValue}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-transparent outline-none" ref={playerRef} tabIndex={-1}>
      <div className="min-h-0 flex-1">
        <DesktopPresentationLayout
          configButtonRef={configButtonRef}
          containerRef={containerRef}
          contentAreaRef={contentAreaRef}
          contentRef={contentRef}
          currentSection={currentSection}
          currentSlideIndex={currentSlideIndex}
          currentTalkTrack={currentTalkTrack}
          deck={deck}
          deckVersion={0}
          domGeneration={domGeneration}
          framePadding={framePadding}
          handleOverviewSelect={handleOverviewSelect}
          hasSyllabus={hasSyllabus}
          isConfigOpen={isConfigOpen}
          isFullscreen={isFullscreen}
          isOverlay={false}
          isSidebarVisible={isSidebarVisible}
          isSourceOpen={isSourceOpen}
          isSyllabusActive={isSyllabusActive}
          onBack={onBack}
          onCloseConfig={() => setIsConfigOpen(false)}
          onCloseSidebar={() => setIsSidebarVisible(false)}
          onCloseSyllabus={closeSyllabus}
          onRefreshDeck={handleRefreshDeck}
          onSyllabusWidthChange={setSyllabusWidth}
          onToggleConfig={() => setIsConfigOpen(prev => !prev)}
          onToggleFullscreen={toggleFullscreen}
          onToggleGrid={() => setShowGrid(prev => !prev)}
          onToggleOverview={() => setShowOverview(prev => !prev)}
          onTogglePresenter={presenterPip.toggle}
          onToggleSidebar={() => setIsSidebarVisible(prev => !prev)}
          onToggleSource={onToggleSource}
          onToggleSyllabus={toggleSyllabus}
          onWidthChange={setSidebarWidth}
          outline={outline}
          presenterPip={presenterPip}
          setCurrentSlideIndex={setCurrentSlideIndex}
          shareUrl={shareUrl}
          showGrid={showGrid}
          showInlineTalkTrack={showInlineTalkTrack}
          showOverview={showOverview}
          showPagination={showPagination}
          sidebarWidth={sidebarWidth}
          slideCount={slideCount}
          syllabusWidth={syllabusWidth}
          typographyScaleValue={typographyScaleValue}
        />
      </div>
    </div>
  )
}
