'use client'

import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

import { cn } from '../../lib/cn'
import { focusVisibleThemeClassName } from './lib/theme-contract'

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        `inline-flex h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)] shrink-0 items-center rounded-[var(--switch-radius)] border p-px outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out [--switch-radius:var(--radius-3xl)] [--thumb-size:--spacing(5)] [border-style:var(--theme-selection-border-style)] [border-width:var(--theme-selection-border-width)] [box-shadow:var(--theme-switch-track-shadow)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-checked:bg-primary data-unchecked:bg-input data-disabled:opacity-64 sm:[--thumb-size:--spacing(4)] ${focusVisibleThemeClassName}`,
        className
      )}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block aspect-square h-full origin-left rounded-[max(0px,calc(var(--switch-radius)-1px))] border bg-background shadow-sm/5 will-change-transform [border-style:var(--theme-switch-thumb-border-style)] [border-width:var(--theme-switch-thumb-border-width)] [box-shadow:var(--theme-switch-thumb-shadow)] [transition:translate_150ms_ease-out,scale_100ms_ease-out_100ms,transform-origin_150ms_ease-out] in-[[role=switch]:active,[data-slot=label]:active]:not-data-disabled:scale-x-110 data-checked:origin-[var(--thumb-size)_50%] data-checked:translate-x-[calc(var(--thumb-size)-4px)]'
        )}
        data-slot="switch-thumb"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
