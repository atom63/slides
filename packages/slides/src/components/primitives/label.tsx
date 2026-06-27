'use client'

import type * as React from 'react'

import { cn } from '../../lib/cn'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: generic label primitive; consumers pass htmlFor/children via props
    <label
      className={cn(
        'text-base flex select-none items-center gap-2 font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        className
      )}
      data-slot="label"
      {...props}
    />
  )
}

export { Label }
