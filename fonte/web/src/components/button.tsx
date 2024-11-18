import { Slot } from '@radix-ui/react-slot'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { tv, VariantProps } from 'tailwind-variants'

const button = tv({
  base: [
    'rounded-lg px-5 py-2.5 font-semibold text-white outline-none disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary:
        'border border-cyan-300 bg-gradient-to-r from-cyan-500/85 to-cyan-300/85 dark:from-cyan-500/50 dark:to-cyan-300/50 focus:ring-2 focus:ring-cyan-600/30 dark:focus:ring-cyan-300/30',
      danger:
        'border border-red-500 bg-gradient-to-r from-red-800/85 to-red-500/85 dark:from-red-800/50 dark:to-red-500/50 focus:ring-2 focus:ring-red-600/30 dark:focus:ring-red-300/30',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, variant, className, ...props }, ref) => {
    const Component = asChild ? Slot : 'button'

    return (
      <Component
        {...props}
        className={button({ variant, className })}
        ref={ref}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button }
