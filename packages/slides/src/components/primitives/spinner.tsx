import type * as React from 'react'

import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Spinner({ className, ...props }: React.ComponentProps<'svg'>): React.ReactElement {
  return (
    <Loader2
      aria-label="Loading"
      className={cn('size-4 animate-spin motion-reduce:animate-none', className)}
      data-slot="spinner"
      role="status"
      {...props}
    />
  )
}
