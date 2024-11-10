import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { IoClose as X } from 'react-icons/io5'
import { TbLockCog as Lock } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateUser } from '../../api/update-user'
import { Button } from '../../components/button'
import { Input } from '../../components/input'
import { userStore } from '../../store/user'

const changePasswordSchema = z
  .object({
    password: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas são diferentes',
  })

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

export function ChangePassword() {
  const navigate = useNavigate()

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  })

  const { user, fetchUser } = userStore((state) => {
    return {
      user: state.user,
      fetchUser: state.fetchUser,
    }
  })

  const { mutateAsync: updateUserFn } = useMutation({
    mutationKey: ['update-user'],
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success('Usuário alterado com sucesso!')
      fetchUser()
      reset({
        password: '',
        newPassword: '',
        confirmPassword: '',
      })
    },
    onError: (err: AxiosError<string>) => {
      if (err.response) {
        toast.error(err.response.data)
      }
    },
  })

  function handleChangePassword(data: ChangePasswordSchema) {
    if (!user) return

    const { password, newPassword } = data

    updateUserFn({
      id: user.id,
      nome: user.name,
      senha: password,
      novasenha: newPassword,
    })
  }

  function handleNavigateToSettings() {
    navigate('/settings')
  }

  return (
    <form
      onSubmit={handleSubmit(handleChangePassword)}
      className="flex w-full flex-col gap-5"
    >
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            required
            type="password"
            placeholder="Senha atual"
            minLength={8}
          />
        )}
      />
      <Controller
        name="newPassword"
        control={control}
        render={({ field }) => (
          <Input {...field} required type="password" placeholder="Nova senha" minLength={8} />
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            required
            type="password"
            placeholder="Confirmar nova senha"
            minLength={8}
          />
        )}
      />
      {Object.entries(errors).map(([key, value]) => {
        return (
          <p key={key} className="text-red-500">
            {value.message}
          </p>
        )
      })}
      <Button
        type="submit"
        className="flex items-center justify-center gap-2 py-2.5"
      >
        <Lock className="h-5 w-5" />
        Alterar Senha
      </Button>
      <Button
        onClick={handleNavigateToSettings}
        className="flex items-center justify-center gap-2 py-2.5"
      >
        <X className="h-5 w-5" />
        Cancelar
      </Button>
    </form>
  )
}
