import {
  Button,
  ButtonGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../primitives'
import {
  ArrowLeft,
  BookOpen,
  Code,
  Grid3x3,
  LayoutGrid,
  Maximize,
  Presentation,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react'
import type { Ref } from 'react'
import { memo } from 'react'
import { PresentationSidebarToggle, PresentationToolbar } from './chrome'

interface PresentationToolbarProps {
  configButtonRef?: Ref<HTMLButtonElement>
  hasSyllabus?: boolean
  isConfigOpen?: boolean
  isPresenterMode: boolean
  isPresenterSupported?: boolean
  isSyllabusActive?: boolean
  onRefreshDeck?: () => void
  onToggleConfig?: () => void
  onToggleFullscreen?: () => void
  onToggleGrid?: () => void
  onToggleOverview?: () => void
  onTogglePresenter?: () => void
  onToggleSource?: () => void
  isSourceOpen?: boolean
  onToggleSyllabus?: () => void
  showGrid: boolean
  showOverview: boolean
}

const ToolbarButton = memo(
  ({
    label,
    children,
    onClick,
    variant = 'ghost',
    disabled,
    buttonRef,
  }: {
    label: string
    children: React.ReactNode
    onClick?: () => void
    variant?: 'ghost' | 'secondary'
    disabled?: boolean
    buttonRef?: Ref<HTMLButtonElement>
  }) => (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            ref={buttonRef}
            size="icon-sm"
            type="button"
            variant={variant}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
)
ToolbarButton.displayName = 'ToolbarButton'

const PresentationToolbarButtons = memo(
  ({
    configButtonRef,
    hasSyllabus = false,
    isConfigOpen = false,
    isPresenterMode,
    isPresenterSupported = true,
    isSyllabusActive = false,
    onRefreshDeck,
    onToggleConfig,
    onToggleSyllabus,
    showGrid,
    showOverview,
    onTogglePresenter,
    onToggleFullscreen,
    onToggleGrid,
    onToggleOverview,
    onToggleSource,
    isSourceOpen = false,
  }: PresentationToolbarProps) => {
    const presenterLabel = !isPresenterSupported
      ? 'Presenter window requires Chrome 116+'
      : isPresenterMode
        ? 'Exit presenter window (P)'
        : 'Open presenter window (P)'

    return (
      <div className="flex items-center gap-1.5">
        {onRefreshDeck && (
          <ButtonGroup size="icon-sm">
            <ToolbarButton label="Reload deck" onClick={onRefreshDeck}>
              <RefreshCw aria-hidden />
            </ToolbarButton>
          </ButtonGroup>
        )}
        {hasSyllabus && onToggleSyllabus && (
          <ButtonGroup size="icon-sm">
            <ToolbarButton
              label={isSyllabusActive ? 'Back to slides' : 'View syllabus'}
              onClick={onToggleSyllabus}
              variant={isSyllabusActive ? 'secondary' : 'ghost'}
            >
              <BookOpen aria-hidden />
            </ToolbarButton>
          </ButtonGroup>
        )}
        <ButtonGroup size="icon-sm">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={showOverview ? 'Hide overview' : 'Slide overview'}
                  onClick={onToggleOverview}
                  size="icon-sm"
                  type="button"
                  variant={showOverview ? 'secondary' : 'ghost'}
                >
                  <LayoutGrid aria-hidden />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {showOverview ? 'Hide overview' : 'Slide overview'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={showGrid ? 'Hide layout grid' : 'Layout grid'}
                  onClick={onToggleGrid}
                  size="icon-sm"
                  type="button"
                  variant={showGrid ? 'secondary' : 'ghost'}
                >
                  <Grid3x3 aria-hidden />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {showGrid ? 'Hide layout grid' : 'Layout grid'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={isConfigOpen ? 'Close settings' : 'Slide settings'}
                  ref={configButtonRef}
                  onClick={onToggleConfig}
                  size="icon-sm"
                  type="button"
                  variant={isConfigOpen ? 'secondary' : 'ghost'}
                >
                  <SlidersHorizontal aria-hidden />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {isConfigOpen ? 'Close settings' : 'Slide settings'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={presenterLabel}
                  disabled={!isPresenterSupported}
                  onClick={onTogglePresenter}
                  size="icon-sm"
                  type="button"
                  variant={isPresenterMode ? 'secondary' : 'ghost'}
                >
                  <Presentation aria-hidden />
                </Button>
              }
            />
            <TooltipContent side="bottom">{presenterLabel}</TooltipContent>
          </Tooltip>
          {onToggleSource && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={isSourceOpen ? 'Hide MDX source' : 'View MDX source'}
                    aria-pressed={isSourceOpen}
                    onClick={onToggleSource}
                    size="icon-sm"
                    type="button"
                    variant={isSourceOpen ? 'secondary' : 'ghost'}
                  >
                    <Code aria-hidden />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                {isSourceOpen ? 'Hide MDX source' : 'View MDX source'}
              </TooltipContent>
            </Tooltip>
          )}
        </ButtonGroup>
        <ButtonGroup size="icon-sm">
          <ToolbarButton label="Fullscreen (F)" onClick={onToggleFullscreen}>
            <Maximize aria-hidden />
          </ToolbarButton>
        </ButtonGroup>
      </div>
    )
  }
)
PresentationToolbarButtons.displayName = 'PresentationToolbarButtons'

interface SlideToolbarProps extends Partial<PresentationToolbarProps> {
  isSidebarVisible?: boolean
  onBack: () => void
  onToggleSidebar?: () => void
  view: 'picker' | 'presentation'
}

export function SlideToolbar({
  view,
  onBack,
  configButtonRef,
  hasSyllabus = false,
  isConfigOpen = false,
  isSidebarVisible = false,
  isSyllabusActive = false,
  onToggleSidebar,
  isPresenterMode = false,
  isPresenterSupported = true,
  showGrid = false,
  showOverview = false,
  ...toggleProps
}: SlideToolbarProps) {
  const isPresentationView = view === 'presentation'

  const breadcrumb = !isPresentationView ? (
    <span className="font-medium text-foreground text-xs">Slides</span>
  ) : undefined

  const left = isPresentationView ? (
    <div className="flex items-center gap-1.5">
      <ButtonGroup size="icon-sm">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label="Back to decks"
                onClick={onBack}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ArrowLeft aria-hidden />
              </Button>
            }
          />
          <TooltipContent side="bottom">Back to decks</TooltipContent>
        </Tooltip>
      </ButtonGroup>
      {onToggleSidebar && (
        <ButtonGroup size="icon-sm">
          <PresentationSidebarToggle isVisible={isSidebarVisible} onToggle={onToggleSidebar} />
        </ButtonGroup>
      )}
    </div>
  ) : undefined

  const right = isPresentationView ? (
    <PresentationToolbarButtons
      configButtonRef={configButtonRef}
      hasSyllabus={hasSyllabus}
      isConfigOpen={isConfigOpen}
      isPresenterMode={isPresenterMode}
      isPresenterSupported={isPresenterSupported}
      isSyllabusActive={isSyllabusActive}
      showGrid={showGrid}
      showOverview={showOverview}
      {...toggleProps}
    />
  ) : undefined

  return (
    <TooltipProvider>
      <PresentationToolbar left={left} middle={breadcrumb} right={right} />
    </TooltipProvider>
  )
}
