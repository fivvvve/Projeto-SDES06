import { ComponentProps, forwardRef } from 'react'

type InputProps = ComponentProps<'input'>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Input = forwardRef(({ ...rest }: InputProps, _ref) => {
  return (
    <div className="rounded-lg border border-gray-600 px-4 py-3 focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-600/30 dark:border-gray-50 dark:focus-within:ring-cyan-300/20">
      <input
        className="w-full bg-transparent outline-none placeholder:text-gray-400 dark:text-gray-100"
        {...rest}
      />
    </div>
  )
})

Input.displayName = 'Input'
