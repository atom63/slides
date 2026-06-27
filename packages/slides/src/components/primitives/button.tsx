'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../../lib/cn'
import { useButtonGroupContext } from './button-group-context'
import { focusVisibleThemeClassName } from './lib/theme-contract'
import { Spinner } from './spinner'

const primaryFilledVariant =
  '[--theme-button-active-background:color-mix(in_oklch,var(--primary)_90%,transparent)] [--theme-button-background:var(--primary)] [--theme-button-border-color:var(--primary)] [--theme-button-foreground:var(--primary-foreground)] [--theme-button-hover-background:color-mix(in_oklch,var(--primary)_90%,transparent)] [--theme-button-loading-foreground:var(--primary-foreground)]'

const buttonContractStyles =
  '[background:var(--theme-button-background)] text-(--theme-button-foreground) [border-color:var(--theme-button-border-color)] [box-shadow:var(--theme-button-shadow)] [text-shadow:var(--theme-button-text-shadow)] hover:[background:var(--theme-button-hover-background)] hover:[border-color:var(--theme-button-hover-border-color)] data-pressed:[background:var(--theme-button-active-background)] data-pressed:[border-color:var(--theme-button-active-border-color)] *:data-[slot=button-loading-indicator]:text-(--theme-button-loading-foreground)'

/** Lucide/SVG + Material icon scale per button size (use `size` on MaterialIcon only to override). */
const buttonIconChildStyles =
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:[filter:var(--theme-button-icon-filter)] [&_svg:not([class*='opacity-'])]:opacity-80 [&_.material-symbols-rounded]:[filter:var(--theme-button-icon-filter)] [&_.material-symbols-rounded]:leading-none [&_.material-symbols-rounded]:shrink-0"

const buttonMotionStyles =
  'origin-center transform-gpu motion-safe:transition-[box-shadow,transform] motion-safe:duration-150 motion-safe:ease-out hover:[transform:scale(var(--button-hover-scale))_rotate(var(--button-hover-rotate))] active:[transform:scale(var(--button-tap-scale))_rotate(var(--button-tap-rotate))] data-pressed:[transform:scale(var(--button-tap-scale))_rotate(var(--button-tap-rotate))] motion-reduce:transform-none'

/** Invisible coarse-pointer hit slop on ::before so ::after stays free for theme gel layers. */
const buttonCoarseHitTargetClassName =
  'pointer-coarse:before:top-1/2 pointer-coarse:before:right-auto pointer-coarse:before:bottom-auto pointer-coarse:before:left-1/2 pointer-coarse:before:h-11 pointer-coarse:before:min-h-11 pointer-coarse:before:w-full pointer-coarse:before:min-w-11 pointer-coarse:before:max-w-none pointer-coarse:before:-translate-x-1/2 pointer-coarse:before:-translate-y-1/2'

export const buttonVariants = cva(
  `relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[var(--button-radius)] border [--button-radius:var(--radius-lg)] [--theme-button-active-border-color:var(--theme-button-hover-border-color)] [--theme-button-active-background:var(--theme-button-hover-background)] [--theme-button-border-color:transparent] [--theme-button-hover-border-color:var(--theme-button-border-color)] [--theme-button-hover-background:var(--theme-button-background)] [--theme-button-icon-filter:none] [--theme-button-loading-foreground:var(--theme-button-foreground)] [--theme-button-shadow:var(--theme-control-shadow)] [--theme-button-text-shadow:none] [border-style:var(--theme-control-border-style)] [border-width:var(--theme-control-border-width)] font-medium text-base outline-none transition-shadow active:[background:var(--theme-button-active-background)] active:[border-color:var(--theme-button-active-border-color)] active:[border-style:var(--theme-control-active-border-style)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[max(0px,calc(var(--button-radius)-var(--theme-control-border-width)))] ${buttonCoarseHitTargetClassName} focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 data-loading:select-none data-loading:text-transparent data-pressed:[border-style:var(--theme-control-active-border-style)] sm:text-sm [&_svg]:-mx-0.5 ${buttonContractStyles} ${focusVisibleThemeClassName} ${buttonIconChildStyles}`,
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default:
          "h-9 px-[calc(--spacing(3)-1px)] [--button-icon-font-size:1.125rem] sm:h-8 sm:[--button-icon-font-size:1rem] [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
        icon: "size-9 [--button-icon-font-size:1.125rem] sm:size-8 sm:[--button-icon-font-size:1rem] [&_svg]:mx-0 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
        'icon-lg':
          "size-10 [--button-icon-font-size:1.25rem] sm:size-9 sm:[--button-icon-font-size:1.125rem] [&_svg]:mx-0 [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        'icon-sm':
          "size-8 [--button-icon-font-size:1rem] sm:size-7 sm:[--button-icon-font-size:0.875rem] [&_svg]:mx-0 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
        'icon-xl':
          "size-11 [--button-icon-font-size:1.375rem] sm:size-10 sm:[--button-icon-font-size:1.25rem] [&_svg]:mx-0 [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        'icon-xs':
          "size-7 [--button-radius:var(--radius-md)] [--button-icon-font-size:0.875rem] sm:size-6 sm:[--button-icon-font-size:0.875rem] [&_svg]:mx-0 not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-4 sm:not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-10 px-[calc(--spacing(3.5)-1px)] [--button-icon-font-size:1.125rem] sm:h-9 sm:[--button-icon-font-size:1rem]',
        sm: "h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] [--button-icon-font-size:1rem] sm:h-7 sm:[--button-icon-font-size:0.875rem] [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
        tile: "h-auto min-h-20 w-full flex-col gap-1.5 whitespace-normal px-3 py-3 text-center [--button-icon-font-size:1.5rem] [&_svg:not([class*='size-'])]:size-6",
        xl: "h-11 px-[calc(--spacing(4)-1px)] text-lg [--button-icon-font-size:1.25rem] sm:h-10 sm:text-base sm:[--button-icon-font-size:1.125rem] [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        xs: "h-7 gap-1 px-[calc(--spacing(2)-1px)] text-sm [--button-radius:var(--radius-md)] [--button-icon-font-size:0.875rem] sm:h-6 sm:text-xs sm:[--button-icon-font-size:0.875rem] [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
      },
      variant: {
        default:
          '[--theme-button-active-background:color-mix(in_oklch,var(--foreground)_90%,transparent)] [--theme-button-background:var(--foreground)] [--theme-button-border-color:var(--foreground)] [--theme-button-foreground:var(--background)] [--theme-button-hover-background:color-mix(in_oklch,var(--foreground)_90%,transparent)] [--theme-button-loading-foreground:var(--background)]',
        primary: primaryFilledVariant,
        destructive:
          '[--theme-button-active-background:color-mix(in_oklch,var(--destructive)_90%,transparent)] [--theme-button-background:var(--destructive)] [--theme-button-border-color:var(--destructive)] [--theme-button-foreground:white] [--theme-button-hover-background:color-mix(in_oklch,var(--destructive)_90%,transparent)] [--theme-button-loading-foreground:white]',
        'destructive-outline':
          '[--theme-button-active-background:color-mix(in_oklch,var(--destructive)_15%,transparent)] [--theme-button-active-border-color:color-mix(in_oklch,var(--destructive)_30%,transparent)] [--theme-button-background:color-mix(in_oklch,var(--destructive)_10%,transparent)] [--theme-button-border-color:color-mix(in_oklch,var(--destructive)_20%,transparent)] [--theme-button-foreground:var(--destructive)] [--theme-button-hover-background:color-mix(in_oklch,var(--destructive)_15%,transparent)] [--theme-button-hover-border-color:color-mix(in_oklch,var(--destructive)_30%,transparent)] [--theme-button-loading-foreground:var(--destructive)]',
        ghost:
          '[--theme-button-active-background:var(--accent)] [--theme-button-background:transparent] [--theme-button-border-color:transparent] [--theme-button-foreground:var(--foreground)] [--theme-button-hover-background:var(--accent)] [--theme-button-loading-foreground:var(--foreground)]',
        link: '[--theme-button-active-background:transparent] [--theme-button-background:transparent] [--theme-button-border-color:transparent] [--theme-button-foreground:var(--foreground)] [--theme-button-hover-background:transparent] [--theme-button-loading-foreground:var(--foreground)] underline-offset-4 hover:underline data-pressed:underline',
        outline:
          '[--theme-button-active-background:color-mix(in_oklch,var(--accent)_50%,transparent)] [--theme-button-background:var(--popover)] [--theme-button-border-color:var(--input)] [--theme-button-foreground:var(--foreground)] [--theme-button-hover-background:color-mix(in_oklch,var(--accent)_50%,transparent)] [--theme-button-loading-foreground:var(--foreground)] not-dark:bg-clip-padding dark:[--theme-button-active-background:color-mix(in_oklch,var(--input)_64%,transparent)] dark:[--theme-button-background:color-mix(in_oklch,var(--input)_32%,transparent)] dark:[--theme-button-hover-background:color-mix(in_oklch,var(--input)_64%,transparent)]',
        secondary:
          '[--theme-button-active-background:color-mix(in_oklch,var(--secondary)_80%,transparent)] [--theme-button-background:var(--secondary)] [--theme-button-border-color:transparent] [--theme-button-foreground:var(--secondary-foreground)] [--theme-button-hover-background:color-mix(in_oklch,var(--secondary)_90%,transparent)] [--theme-button-loading-foreground:var(--secondary-foreground)]',
        overlay:
          '[--theme-button-active-background:color-mix(in_oklch,var(--dark)_34%,transparent)] [--theme-button-active-border-color:color-mix(in_oklch,var(--light)_18%,transparent)] [--theme-button-background:color-mix(in_oklch,var(--dark)_26%,transparent)] [--theme-button-border-color:color-mix(in_oklch,var(--light)_14%,transparent)] [--theme-button-foreground:var(--light)] [--theme-button-hover-background:color-mix(in_oklch,var(--dark)_30%,transparent)] [--theme-button-hover-border-color:color-mix(in_oklch,var(--light)_22%,transparent)] [--theme-button-icon-filter:drop-shadow(0_1px_1px_color-mix(in_oklch,var(--dark)_64%,transparent))] [--theme-button-loading-foreground:var(--light)] [--theme-button-shadow:0_1px_3px_color-mix(in_oklch,var(--dark)_18%,transparent)] [--theme-button-text-shadow:0_1px_1px_color-mix(in_oklch,var(--dark)_64%,transparent)] backdrop-blur-md backdrop-saturate-125',
        glass:
          '[--theme-button-active-background:color-mix(in_oklch,var(--dark)_34%,transparent)] [--theme-button-active-border-color:color-mix(in_oklch,var(--light)_18%,transparent)] [--theme-button-background:color-mix(in_oklch,var(--dark)_26%,transparent)] [--theme-button-border-color:color-mix(in_oklch,var(--light)_14%,transparent)] [--theme-button-foreground:var(--light)] [--theme-button-hover-background:color-mix(in_oklch,var(--dark)_30%,transparent)] [--theme-button-hover-border-color:color-mix(in_oklch,var(--light)_22%,transparent)] [--theme-button-icon-filter:drop-shadow(0_1px_1px_color-mix(in_oklch,var(--dark)_64%,transparent))] [--theme-button-loading-foreground:var(--light)] [--theme-button-shadow:0_1px_3px_color-mix(in_oklch,var(--dark)_18%,transparent)] [--theme-button-text-shadow:0_1px_1px_color-mix(in_oklch,var(--dark)_64%,transparent)] backdrop-blur-md backdrop-saturate-125',
      },
    },
  }
)

export interface ButtonProps extends useRender.ComponentProps<'button'> {
  'data-slot'?: string
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  loading?: boolean
  /** @deprecated Use `render` instead */
  asChild?: boolean
  withMotion?: boolean
  motionProps?: {
    hoverScale?: number
    tapScale?: number
    hoverRotate?: number
    tapRotate?: number
  }
}

type ButtonMotionStyle = React.CSSProperties & {
  '--button-hover-scale'?: number
  '--button-tap-scale'?: number
  '--button-hover-rotate'?: string
  '--button-tap-rotate'?: string
}

export function Button({
  className,
  variant,
  size,
  render,
  asChild = false,
  children,
  loading = false,
  disabled: disabledProp,
  withMotion,
  motionProps = {
    hoverScale: 1,
    tapScale: 0.98,
    hoverRotate: 0,
    tapRotate: 0,
  },
  'data-slot': triggerSlot,
  style,
  ...props
}: ButtonProps): React.ReactElement {
  const isInButtonGroup = useButtonGroupContext()
  const shouldUseMotion = withMotion ?? !isInButtonGroup
  const isDisabled = Boolean(loading || disabledProp)
  const resolvedRender =
    render ?? (asChild && React.isValidElement(children) ? children : undefined)
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>['type'] = resolvedRender
    ? undefined
    : 'button'
  const motionStyle: ButtonMotionStyle | undefined = shouldUseMotion
    ? {
        '--button-hover-rotate': `${motionProps.hoverRotate}deg`,
        '--button-hover-scale': motionProps.hoverScale,
        '--button-tap-rotate': `${motionProps.tapRotate}deg`,
        '--button-tap-scale': motionProps.tapScale,
        transformOrigin: 'center',
        ...style,
      }
    : style

  const defaultProps = {
    'aria-disabled': loading || undefined,
    children: (
      <>
        {resolvedRender ? undefined : children}
        {loading ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inline-flex items-center justify-center"
            data-slot="button-loading-indicator"
          >
            <Spinner />
          </span>
        ) : null}
      </>
    ),
    className: cn(
      buttonVariants({ className, size, variant }),
      shouldUseMotion && buttonMotionStyles
    ),
    'data-button': '',
    'data-loading': loading ? '' : undefined,
    'data-size': size ?? 'default',
    'data-slot': 'button',
    'data-trigger-slot': triggerSlot,
    'data-variant': variant ?? 'default',
    disabled: isDisabled,
    style: motionStyle,
    type: typeValue,
  }

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render: resolvedRender,
  })
}
