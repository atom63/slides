'use client'

import { Tabs } from '@base-ui/react/tabs'
import type React from 'react'
import { cn } from '../../lib/cn'
import { focusVisibleThemeClassName } from './lib/theme-contract'

export interface SegmentControlItem {
  icon?: React.ReactNode
  label: string
  value: string
}

export interface SegmentControlProps {
  activeVariant?: 'neutral' | 'primary'
  animateBackplate?: boolean
  className?: string
  items: SegmentControlItem[]
  onValueChange: (value: string) => void
  size?: 'default' | 'sm' | 'lg'
  tabClassName?: string
  value: string
  variant?: 'icon' | 'label'
}

export function SegmentControl({
  activeVariant = 'neutral',
  animateBackplate = true,
  items,
  value,
  onValueChange,
  className,
  size = 'default',
  tabClassName,
  variant = 'icon',
}: SegmentControlProps) {
  return (
    <Tabs.Root
      data-slot="segment-control"
      onValueChange={newValue => {
        if (newValue && newValue !== value) {
          onValueChange(newValue as string)
        }
      }}
      value={value || items[0]?.value}
    >
      <Tabs.List
        className={cn(
          'relative isolate z-[var(--z-layer-default)] inline-flex items-center justify-center overflow-hidden border text-(--theme-segment-item-foreground) backdrop-blur-sm [--segment-active-radius:calc(var(--segment-shell-radius)-var(--segment-inset))] [--segment-item-radius:var(--segment-active-radius)] [background:var(--theme-segment-list-background)] [border-color:var(--theme-segment-list-border-color)] [border-style:var(--theme-tabs-list-border-style)] [border-width:var(--theme-tabs-list-border-width)] [box-shadow:var(--theme-segment-list-shadow)] rounded-[var(--segment-shell-radius)]',
          size === 'default' &&
            'h-8 gap-0.5 p-0.5 [--segment-inset:2px] [--segment-shell-radius:var(--radius-lg)]',
          size === 'sm' &&
            'h-7 gap-0.5 p-0.5 [--segment-inset:2px] [--segment-shell-radius:var(--radius-md)]',
          size === 'lg' &&
            'h-10 gap-0.5 p-1 [--segment-inset:4px] [--segment-shell-radius:var(--radius-xl)]',
          className
        )}
        data-active-variant={activeVariant}
        data-backplate-animation={animateBackplate ? 'on' : 'off'}
        data-size={size}
        data-slot="segment-control-list"
        data-variant={variant}
      >
        {items.map(item => (
          <Tabs.Tab
            aria-label={item.label}
            className={cn(
              'relative z-[var(--z-layer-base)] inline-flex cursor-pointer items-center justify-center rounded-[var(--segment-item-radius)] text-(--theme-segment-item-foreground) transition-[background-color,box-shadow,color,filter,opacity] duration-150 ease-out [text-shadow:var(--theme-segment-item-text-shadow)] hover:[background:var(--theme-segment-item-hover-background)] hover:text-(--theme-segment-item-hover-foreground) hover:shadow-none data-active:text-(--theme-segment-active-foreground) data-active:shadow-none data-active:[text-shadow:var(--theme-segment-active-text-shadow)] data-active:hover:bg-transparent data-active:hover:text-(--theme-segment-active-foreground)',
              'focus-visible:z-[var(--z-layer-sticky)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              focusVisibleThemeClassName,
              'data-disabled:pointer-events-none data-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50',
              variant === 'icon' && 'aspect-square',
              variant === 'icon' && size === 'default' && 'size-7',
              variant === 'icon' && size === 'sm' && 'size-6',
              variant === 'icon' && size === 'lg' && 'size-8',
              variant === 'label' && 'h-full min-w-0 gap-2 px-2.5 font-medium text-xs leading-none',
              variant === 'label' && size === 'sm' && 'px-2 text-[11px]',
              variant === 'label' && size === 'lg' && 'px-3.5 text-sm',
              '[&_svg]:pointer-events-none [&_svg]:size-full [&_svg]:shrink-0 [&_svg:not([class*="opacity-"])]:opacity-72 data-active:[&_svg]:[filter:var(--theme-segment-active-icon-filter)] data-active:[&_svg:not([class*="opacity-"])]:opacity-100',
              tabClassName
            )}
            key={item.value}
            data-slot="segment-control-item"
            title={item.label}
            value={item.value}
          >
            {variant === 'icon' ? (
              <span
                className={cn(
                  'inline-flex aspect-square items-center justify-center',
                  size === 'default' && 'size-4',
                  size === 'sm' && 'size-3.5',
                  size === 'lg' && 'size-4.5'
                )}
                data-slot="segment-control-icon"
              >
                {item.icon ?? item.label}
              </span>
            ) : (
              <>
                {item.icon ? (
                  <span
                    className={cn(
                      'inline-flex aspect-square shrink-0 items-center justify-center',
                      size === 'sm' ? 'size-3.5' : 'size-4'
                    )}
                    data-slot="segment-control-icon"
                  >
                    {item.icon}
                  </span>
                ) : null}
                <span className="min-w-0 truncate" data-slot="segment-control-label">
                  {item.label}
                </span>
              </>
            )}
          </Tabs.Tab>
        ))}

        <Tabs.Indicator
          className={cn(
            'absolute top-1/2 left-0 z-[var(--z-layer-below)] h-(--active-tab-height) w-(--active-tab-width) origin-center translate-x-(--active-tab-left) -translate-y-1/2 rounded-[var(--segment-active-radius)] border [background:var(--theme-segment-active-background)] [background-color:var(--theme-segment-active-background-color)] [border-color:var(--theme-segment-active-border-color)] [border-style:var(--theme-tabs-active-border-style)] [border-width:var(--theme-tabs-active-border-width)] [box-shadow:var(--theme-segment-active-shadow)]',
            animateBackplate
              ? 'transition-[width,translate,scale] duration-200 ease-out motion-reduce:transition-none'
              : 'transition-none'
          )}
          data-backplate-animation={animateBackplate ? 'on' : 'off'}
          data-slot="tab-indicator"
        />
      </Tabs.List>
    </Tabs.Root>
  )
}
