'use client'

import type { ReactElement, ReactNode } from 'react'
import { isValidElement } from 'react'

export type AsChildProps = {
  /** Merges trigger props onto the single child element (Radix-compatible). Prefer `render` for explicit control. */
  asChild?: boolean
}

export function resolveTriggerRender(
  asChild: boolean | undefined,
  render: ReactElement | undefined,
  children: ReactNode
): ReactElement | undefined {
  if (render) {
    return render
  }
  if (asChild && isValidElement(children)) {
    return children
  }
  return undefined
}

export type TriggerSlotProps = AsChildProps & {
  render?: ReactElement
  children?: ReactNode
}

export function splitTriggerSlotProps({ asChild, render, children }: TriggerSlotProps): {
  render?: ReactElement
  children?: ReactNode
} {
  const resolvedRender = resolveTriggerRender(asChild, render, children)

  // Explicit `render` — children compose into the render element (Base UI / shadcn).
  if (render) {
    return { render: resolvedRender, children }
  }

  // `asChild` — the single child element is the trigger.
  if (asChild && resolvedRender) {
    return { render: resolvedRender, children: undefined }
  }

  return {
    render: resolvedRender,
    children: resolvedRender ? undefined : children,
  }
}
