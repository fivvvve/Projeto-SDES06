import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { IoClose as X, IoTrashOutline as Trash } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { deleteUser } from '../../api/delete-user'
import { Button } from '../../components/button'
import { Input } from '../../components/input'
import { userStore } from '../../store/user'

const excludeAccountSchema = z.object({
  password: z.string(),
})

type ExcludeAccountSchema = z.infer<typeof excludeAccountSchema>

export function ExcludeAccount() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const navigate = useNavigate()

  const { control, handleSubmit } = useForm<ExcludeAccountSchema>({
    resolver: zodResolver(excludeAccountSchema),
  })

  const { mutateAsync: deleteUserFn } = useMutation({
    mutationKey: ['deleteUser'],
    mutationFn: deleteUser,
    onSuccess: (data) => {
      toast.success(data)
      navigate('/sign-in')
    },
    onError: (error: AxiosError<string>) => {
      if (error.response) {
        toast.error(error.response.data)
      }
    },
  })

  function handleExcludeAccount(data: ExcludeAccountSchema) {
    const { password } = data

    deleteUserFn({
      userId: user?.id || null,
      password,
    })
  }

  function handleNavigateToSettings() {
    navigate('/settings')
  }

  return (
    <form
      onSubmit={handleSubmit(handleExcludeAccount)}
      className="flex w-full flex-col gap-5"
    >
      <h2 className="text-xl text-gray-700 dark:text-gray-50">
        Insira sua senha para excluir a conta:
      </h2>
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input {...field} required type="password" placeholder="Senha" />
        )}
      />
      <Button
        type="submit"
        variant="danger"
        className="flex w-full items-center justify-center gap-2 py-2.5"
      >
        <Trash className="h-5 w-5" />
        Excluir Conta
      </Button>
      <Button
        onClick={handleNavigateToSettings}
        className="flex w-full items-center justify-center gap-2 py-2.5"
      >
        <X className="h-5 w-5" />
        Cancelar
      </Button>
    </form>
  )
}
