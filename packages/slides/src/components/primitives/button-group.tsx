import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { ButtonGroupProvider } from './button-group-context'
import { cn } from '../../lib/cn'
import { Separator } from './separator'

const buttonGroupVariants = cva(
  "flex w-fit items-stretch overflow-hidden rounded-[var(--button-group-radius)] border-solid [--button-group-radius:var(--theme-button-group-radius,var(--radius-lg))] [--theme-button-group-background:transparent] [--theme-button-group-border-color:transparent] [--theme-button-group-border-width:0px] [--theme-button-group-separator-color:var(--input)] [--theme-button-group-shadow:none] [--theme-button-group-text-background:var(--muted)] [--theme-button-group-text-border-color:var(--input)] [--theme-button-group-text-foreground:var(--foreground)] [background:var(--theme-button-group-background)] [border-color:var(--theme-button-group-border-color)] [border-width:var(--theme-button-group-border-width)] [box-shadow:var(--theme-button-group-shadow)] *:focus-visible:relative *:focus-visible:z-[var(--z-layer-base)] has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-[var(--button-group-radius)] [&>[data-slot=button-group-text]]:rounded-[var(--button-group-radius)] [&>[data-button]]:h-full [&>[data-button]]:!rounded-[var(--button-group-radius)] [&>[data-button]]:[--button-radius:var(--button-group-radius)] [&>[data-button]]:before:!shadow-none [&>[data-slot=input-control]]:flex-1 [&>[data-slot=input-control]]:rounded-[var(--button-group-radius)] [&>[data-slot=input-control]]:!border-input [&>[data-slot=input-control]]:before:rounded-[inherit] [&>[data-slot=input-control]:has(:focus-visible)]:!ring-0 [&>[data-slot=input-control]:has(:focus-visible)]:!ring-offset-0 [&>[data-slot=input-control]>[data-slot=input]]:h-full [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>[data-slot]:has(~[data-slot])]:!rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:!rounded-r-[var(--button-group-radius)] [&>[data-slot]~[data-slot]]:!rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0 [&>[data-slot=input-control]:not(:last-child)]:rounded-r-none [&>[data-slot=input-control]:not(:first-child)]:rounded-l-none [&>[data-slot=input-control]:not(:first-child)]:border-l-0',
        vertical:
          'flex-col [&>[data-slot]:has(~[data-slot])]:!rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:!rounded-b-[var(--button-group-radius)] [&>[data-slot]~[data-slot]]:!rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0 [&>[data-slot=input-control]:not(:last-child)]:rounded-b-none [&>[data-slot=input-control]:not(:first-child)]:rounded-t-none [&>[data-slot=input-control]:not(:first-child)]:border-t-0',
      },
      size: {
        default:
          '[&>[data-slot=button-group-text]]:h-9 [&>[data-button]]:h-9 [&>[data-slot=input-control]]:h-9 sm:[&>[data-slot=button-group-text]]:h-8 sm:[&>[data-button]]:h-8 sm:[&>[data-slot=input-control]]:h-8',
        icon: '[&>[data-button]]:size-9 [&>[data-slot=input-control]]:h-9 sm:[&>[data-button]]:size-8 sm:[&>[data-slot=input-control]]:h-8',
        'icon-lg':
          '[&>[data-button]]:size-10 [&>[data-slot=input-control]]:h-10 sm:[&>[data-button]]:size-9 sm:[&>[data-slot=input-control]]:h-9',
        'icon-sm':
          '[&>[data-button]]:size-8 [&>[data-slot=input-control]]:h-8 sm:[&>[data-button]]:size-7 sm:[&>[data-slot=input-control]]:h-7',
        'icon-xl':
          '[&>[data-button]]:size-11 [&>[data-slot=input-control]]:h-11 sm:[&>[data-button]]:size-10 sm:[&>[data-slot=input-control]]:h-10',
        'icon-xs':
          '[--button-group-radius:var(--radius-md)] [&>[data-button]]:size-7 [&>[data-slot=input-control]]:h-7 sm:[&>[data-button]]:size-6 sm:[&>[data-slot=input-control]]:h-6',
        lg: '[&>[data-slot=button-group-text]]:h-10 [&>[data-button]]:h-10 [&>[data-slot=input-control]]:h-10 sm:[&>[data-slot=button-group-text]]:h-9 sm:[&>[data-button]]:h-9 sm:[&>[data-slot=input-control]]:h-9',
        sm: '[&>[data-slot=button-group-text]]:h-8 [&>[data-button]]:h-8 [&>[data-slot=input-control]]:h-8 sm:[&>[data-slot=button-group-text]]:h-7 sm:[&>[data-button]]:h-7 sm:[&>[data-slot=input-control]]:h-7',
        xl: '[&>[data-slot=button-group-text]]:h-11 [&>[data-button]]:h-11 [&>[data-slot=input-control]]:h-11 sm:[&>[data-slot=button-group-text]]:h-10 sm:[&>[data-button]]:h-10 sm:[&>[data-slot=input-control]]:h-10',
        xs: '[--button-group-radius:var(--radius-md)] [&>[data-slot=button-group-text]]:h-7 [&>[data-button]]:h-7 [&>[data-slot=input-control]]:h-7 sm:[&>[data-slot=button-group-text]]:h-6 sm:[&>[data-button]]:h-6 sm:[&>[data-slot=input-control]]:h-6',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      size: 'default',
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  size,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  const resolvedOrientation = orientation ?? 'horizontal'
  const resolvedSize = size ?? 'default'

  return (
    <ButtonGroupProvider>
      <div
        data-slot="button-group"
        data-orientation={resolvedOrientation}
        data-size={resolvedSize}
        className={cn(buttonGroupVariants({ orientation, size }), className)}
        {...props}
      />
    </ButtonGroupProvider>
  )
}

function ButtonGroupText({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          "flex items-center gap-2 rounded-[var(--button-group-radius)] border border-input bg-muted px-2.5 text-sm font-medium [background:var(--theme-button-group-text-background,var(--muted))] [border-color:var(--theme-button-group-text-border-color,var(--input))] [color:var(--theme-button-group-text-foreground,var(--foreground))] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: 'button-group-text',
    },
  })
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'relative z-[var(--z-layer-base)] shrink-0 [background:var(--theme-button-group-separator-color,var(--input))] data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
