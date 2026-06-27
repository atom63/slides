import { Lock } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '../primitives'

export interface SlideGateProvider {
  fetchConfigured: (slug: string) => Promise<boolean>
  gateEnvVarName: (slug: string) => string
  isUnlocked: (slug: string) => boolean
  setUnlocked: (slug: string) => void
  verify: (slug: string, code: string) => Promise<boolean>
}

interface SlidePasswordGateProps {
  deckTitle: string
  gateProvider: SlideGateProvider
  onBack: () => void
  onUnlock: () => void
  slug: string
  renderCodeGate?: (props: {
    backLabel: string
    onBack: () => void
    onUnlock: () => void
    subtitle: string
    title: string
    verifyCode: (code: string) => Promise<boolean>
  }) => React.ReactNode
}

export function SlidePasswordGate({
  deckTitle,
  slug,
  onUnlock,
  onBack,
  gateProvider,
  renderCodeGate,
}: SlidePasswordGateProps) {
  const [configured, setConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    gateProvider.fetchConfigured(slug).then(v => {
      if (!cancelled) setConfigured(v)
    })
    return () => {
      cancelled = true
    }
  }, [slug, gateProvider])

  const handleUnlock = () => {
    gateProvider.setUnlocked(slug)
    onUnlock()
  }

  const verifyCode = useCallback(
    (code: string) => gateProvider.verify(slug, code),
    [slug, gateProvider]
  )

  const envName = gateProvider.gateEnvVarName(slug)

  if (configured === null) {
    return (
      <div className="flex size-full flex-col items-center justify-center px-8">
        <p className="text-muted-foreground text-sm">Checking access…</p>
      </div>
    )
  }

  if (!configured) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-6 px-8">
        <div className="flex size-16 items-center justify-center rounded-full bg-warning/15 text-warning">
          <Lock aria-hidden className="size-8" />
        </div>
        <div className="max-w-sm text-center">
          <h2 className="mb-2 font-semibold text-foreground text-lg">{deckTitle} is locked</h2>
          <p className="text-base text-muted-foreground">
            Set <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{envName}</code>{' '}
            in your server environment to enable the passcode.
          </p>
        </div>
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
      </div>
    )
  }

  if (renderCodeGate) {
    return (
      <>
        {renderCodeGate({
          backLabel: 'Back',
          onBack,
          onUnlock: handleUnlock,
          subtitle: 'Enter the 4-digit code to view this deck.',
          title: `${deckTitle} is locked`,
          verifyCode,
        })}
      </>
    )
  }

  // Fallback: simple locked message (no CodeGate dependency)
  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 px-8">
      <div className="flex size-16 items-center justify-center rounded-full bg-warning/15 text-warning">
        <Lock aria-hidden className="size-8" />
      </div>
      <div className="text-center">
        <h2 className="mb-2 font-semibold text-foreground text-lg">{deckTitle} is locked</h2>
        <p className="text-muted-foreground text-sm">Enter the passcode to continue.</p>
      </div>
      <Button onClick={onBack} variant="outline">
        Back
      </Button>
    </div>
  )
}
