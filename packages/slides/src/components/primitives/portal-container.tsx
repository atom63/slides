'use client'

import * as React from 'react'

type PortalContainer = HTMLElement | ShadowRoot | null | undefined

const PortalContainerContext = React.createContext<PortalContainer>(undefined)

function PortalContainerProvider({
  children,
  container,
}: {
  children: React.ReactNode
  container: PortalContainer
}) {
  return (
    <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>
  )
}

function usePortalContainer() {
  return React.useContext(PortalContainerContext) ?? undefined
}

export { PortalContainerProvider, usePortalContainer }
