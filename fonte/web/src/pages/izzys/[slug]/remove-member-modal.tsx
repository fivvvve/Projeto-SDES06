import * as Dialog from '@radix-ui/react-dialog'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ReactNode, useState } from 'react'
import {
  IoClose as X,
  IoRemoveCircleOutline as RemoveCircle,
} from 'react-icons/io5'
import { toast } from 'sonner'

import { removeMember } from '../../../api/remove-member'
import { Button } from '../../../components/button'
import { queryClient } from '../../../lib/queryClient'

interface RemoveMemberModalProps {
  izzyId: string | null
  email: string
  userId: string | null
  children: ReactNode
}

export function RemoveMemberModal({
  izzyId,
  email,
  userId,
  children,
}: RemoveMemberModalProps) {
  const [open, setOpen] = useState<boolean>()

  const { mutateAsync: removeMemberFn } = useMutation({
    mutationKey: ['remove-member'],
    mutationFn: removeMember,
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['get-izzy'] })
      toast.success(data)
      setOpen(false)
    },
    onError: (error: AxiosError<string>) => {
      if (error.response) {
        toast.error(error.response.data)
      }
    },
  })

  function handleRemoveMember() {
    removeMemberFn({
      izzyId: izzyId || null,
      email,
      userId: userId || null,
    })
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed top-0 min-h-screen w-full bg-gray-950 opacity-70 backdrop-blur" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl data-[state=open]:animate-contentShow dark:bg-gray-800">
          <div className="flex justify-between">
            <div className="rounded-full bg-red-100 p-2.5 dark:bg-red-500">
              <RemoveCircle className="h-6 w-6 text-red-600 dark:text-red-200" />
            </div>
            <Dialog.Close className="self-start rounded-lg p-2 focus:shadow-none">
              <X className="h-6 w-6 text-gray-800 dark:text-gray-100" />
            </Dialog.Close>
          </div>
          <Dialog.Title className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
            Remover membro
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-gray-800 dark:text-gray-100">
            Tem certeza de que deseja remover esse membro? Essa ação não pode
            ser desfeita.
          </Dialog.Description>
          <div className="mt-8 flex flex-col-reverse gap-3 md:flex-row">
            <Dialog.Close asChild>
              <Button className="flex flex-1 items-center justify-center gap-1.5">
                <X className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleRemoveMember}
              variant="danger"
              className="flex flex-1 items-center justify-center gap-2"
            >
              <RemoveCircle className="h-5 w-5" />
              Remover
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
