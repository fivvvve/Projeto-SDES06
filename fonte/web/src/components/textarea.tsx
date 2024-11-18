import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface TextareaProps extends ComponentProps<'textarea'> {}

export function Textarea({ ...props }: TextareaProps) {
  const { className, ...rest } = props

  return (
    <textarea
      {...rest}
      className={twMerge(
        'w-full rounded-lg border border-gray-600 bg-transparent px-4 py-3 outline-none placeholder:text-gray-400 focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-600/30 dark:border-gray-50 dark:text-gray-100 dark:focus-within:ring-cyan-300/20',
        className,
      )}
    />
  )
}
