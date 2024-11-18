import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ReactNode, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FiEdit3 as Edit } from 'react-icons/fi'
import { IoIosCalendar as Calendar } from 'react-icons/io'
import { IoClose as X } from 'react-icons/io5'
import { toast } from 'sonner'
import { z } from 'zod'

import { GetMinistiredActivitiesResponse } from '../../../api/get-ministerd-activities'
import { updateActivity } from '../../../api/update-activity'
// import { updateActivity } from '../../../api/update-activity'
import { Button } from '../../../components/button'
import { Input } from '../../../components/input'
import { Textarea } from '../../../components/textarea'
import { format } from '../../../lib/date-fns'
import { queryClient } from '../../../lib/queryClient'
import { userStore } from '../../../store/user'
interface UpdateActivityModalProps {
  task: GetMinistiredActivitiesResponse
  children: ReactNode
}

const updateActivitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().optional(),
})

type UpdateActivitySchema = z.infer<typeof updateActivitySchema>

export function UpdateActivityModal({
  task,
  children,
}: UpdateActivityModalProps) {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const [open, setOpen] = useState<boolean>()

  const {
    control,
    reset,
    formState: { isDirty },
    handleSubmit,
  } = useForm<UpdateActivitySchema>({
    defaultValues: {
      title: task.titulo,
      description: task.descricao,
      date: task.data_limite
        ? format(task.data_limite, 'yyyy-MM-dd')
        : task.data_final
          ? format(task.data_final, 'yyyy-MM-dd')
          : '',
    },
    resolver: zodResolver(updateActivitySchema),
  })

  const { mutateAsync: updateActivityFn } = useMutation({
    mutationKey: ['update-activitiy'],
    mutationFn: updateActivity,
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

  function handleUpdateActivity(data: UpdateActivitySchema) {
    const { title, description, date } = data

    updateActivityFn({
      activityId: task.id,
      userId: user?.id || null,
      title,
      description,
      ...(task.tipo === 'Iterativa'
        ? {
            data_final: date,
          }
        : {
            data_limite: date,
          }),
    })
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        reset({
          title: task.titulo,
          description: task.descricao,
          date: task.data_limite
            ? format(task.data_limite, 'yyyy-MM-dd')
            : task.data_final
              ? format(task.data_final, 'yyyy-MM-dd')
              : '',
        })
        setOpen(open)
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed top-0 min-h-screen w-full bg-gray-950 opacity-70 backdrop-blur" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <Dialog.Title className="text-center font-anton text-4xl text-gray-800 dark:text-gray-100">
            Atualizar atividade
          </Dialog.Title>
          <form
            onSubmit={handleSubmit(handleUpdateActivity)}
            className="mt-8 flex flex-col gap-5"
          >
            <Controller
              name="title"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Nome" />}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea {...field} placeholder="Descrição" />
              )}
            />
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Input
                  type="date"
                  {...field}
                  onFocus={(e) => {
                    e.currentTarget.type = 'date'
                    e.currentTarget.showPicker()
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.value) {
                      e.currentTarget.type = 'text'
                    }
                  }}
                  className="flex items-center"
                >
                  <Calendar className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                </Input>
              )}
            />
            <Button
              type="submit"
              disabled={!isDirty}
              className="flex flex-1 items-center justify-center gap-2"
            >
              <Edit className="h-5 w-5" /> Atualizar
            </Button>
            <Dialog.Close asChild>
              <Button
                variant="danger"
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5"
              >
                <X className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                Cancelar
              </Button>
            </Dialog.Close>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
