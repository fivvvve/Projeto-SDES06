import * as Dialog from '@radix-ui/react-dialog'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ReactNode, useState } from 'react'
import { IoClose as X, IoTrashOutline as Trash } from 'react-icons/io5'
import { toast } from 'sonner'

import { deleteActivity } from '../../../api/delete-activity'
import { GetMinistiredActivitiesResponse } from '../../../api/get-ministerd-activities'
import { Button } from '../../../components/button'
import { queryClient } from '../../../lib/queryClient'

interface DeleteActivityModalProps {
  task: GetMinistiredActivitiesResponse
  children: ReactNode
}

export function DeleteActivityModal({
  task,
  children,
}: DeleteActivityModalProps) {
  const [open, setOpen] = useState<boolean>()

  const { mutateAsync: deleteActivityFn } = useMutation({
    mutationKey: ['delete-activitiy'],
    mutationFn: deleteActivity,
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['get-ministered-activities'] })
      toast.success(data)
      setOpen(false)
    },
    onError: (error: AxiosError<string>) => {
      toast.error(error.response?.data)
      setOpen(false)
    },
  })

  function handleDeleteActivity() {
    deleteActivityFn({
      activityId: task.id,
    })
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed top-0 min-h-screen w-full bg-gray-950 opacity-70 backdrop-blur" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="flex justify-between">
            <div className="rounded-full bg-red-100 p-2.5 dark:bg-red-500">
              <Trash className="h-6 w-6 text-red-600 dark:text-red-200" />
            </div>
            <Dialog.Close className="self-start rounded-lg p-2 focus:shadow-none">
              <X className="h-6 w-6 text-gray-800 dark:text-gray-100" />
            </Dialog.Close>
          </div>
          <Dialog.Title className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
            Deletar {task.titulo}?
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-gray-800 dark:text-gray-100">
            Tem certeza de que deseja excluir essa atividade? Essa ação não pode
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
              onClick={handleDeleteActivity}
              variant="danger"
              className="flex flex-1 items-center justify-center gap-2"
            >
              <Trash className="h-5 w-5" /> Excluir
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
