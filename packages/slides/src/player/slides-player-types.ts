import type { SlideGateProvider } from '../components/config/password-gate'
import type { SlideDeckItem } from '../types'

export interface SlidesPlayerProps {
  deck: SlideDeckItem
  initialSlide?: number
  onBack: () => void
  onSlideChange?: (index: number) => void
  /** When provided, the toolbar shows a "</> MDX" toggle that calls this. */
  onToggleSource?: () => void
  isSourceOpen?: boolean
  gateProvider?: SlideGateProvider
  renderCodeGate?: (props: {
    backLabel: string
    onBack: () => void
    onUnlock: () => void
    subtitle: string
    title: string
    verifyCode: (code: string) => Promise<boolean>
  }) => React.ReactNode
}
