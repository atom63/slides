'use client'

import * as React from 'react'

const ButtonGroupContext = React.createContext(false)

function ButtonGroupProvider({ children }: { children: React.ReactNode }) {
  return <ButtonGroupContext.Provider value={true}>{children}</ButtonGroupContext.Provider>
}

function useButtonGroupContext() {
  return React.useContext(ButtonGroupContext)
}

export { ButtonGroupProvider, useButtonGroupContext }
