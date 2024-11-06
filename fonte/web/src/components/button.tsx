import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends ComponentProps<'button'> {}

export function Button({ children, ...props }: ButtonProps) {
  const { className, ...rest } = props

  return (
    <button
      {...rest}
      className={twMerge(
        'rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-300 px-5 py-3 font-semibold text-white outline-none focus:ring-2 focus:ring-cyan-600/30 dark:focus:ring-cyan-300/30',
        className,
      )}
    >
      {children}
    </button>
  )
}
