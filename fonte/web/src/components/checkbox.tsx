import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { ControllerRenderProps } from 'react-hook-form'
import { MdCheck as Check } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

interface CheckboxProps
  extends Partial<ControllerRenderProps>,
    Omit<
      CheckboxPrimitive.CheckboxProps,
      'name' | 'onBlur' | 'onChange' | 'value'
    > {}

export function Checkbox(props: CheckboxProps) {
  const { className, ...rest } = props

  return (
    <CheckboxPrimitive.Root
      className={twMerge(
        'flex h-4 w-4 items-center justify-center rounded-[2px] border border-gray-800 dark:border-gray-100',
        className,
      )}
      {...rest}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="text-gray-800 dark:text-gray-100" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
