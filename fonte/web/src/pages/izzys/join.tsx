import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { joinIzzy } from '../../api/join-izzy'
import { Button } from '../../components/button'
import { Input } from '../../components/input'
import { queryClient } from '../../lib/queryClient'
import { userStore } from '../../store/user'

const izzyJoinSchema = z.object({
  code: z.string(),
  password: z.string(),
})

type IzzyJoinSchema = z.infer<typeof izzyJoinSchema>

export function IzzyJoin() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const { handleSubmit, control } = useForm<IzzyJoinSchema>({
    resolver: zodResolver(izzyJoinSchema),
  })

  const { mutateAsync: joinIzzyFn } = useMutation({
    mutationKey: ['join-izzy'],
    mutationFn: joinIzzy,
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['get-izzys'] })
      toast.success(data)
    },
    onError: (error: AxiosError<string>) => {
      if (error.response) {
        toast.error(error.response.data)
      }
    },
  })

  function handleJoinIzzy(data: IzzyJoinSchema) {
    const { code, password } = data

    joinIzzyFn({
      code,
      password,
      userId: user?.id || null,
    })
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between py-10">
      <header className="flex flex-col items-center justify-center">
        <img
          className="w-48 select-none dark:hidden"
          src="/logo.png"
          alt="Izzy"
        />
        <img
          className="hidden w-48 select-none dark:block"
          src="/dark-logo.png"
          alt="Izzy"
        />
        <h1 className="select-none text-lg/10 text-gray-700 dark:text-gray-50">
          Unifique suas atividades
        </h1>
      </header>
      <form
        onSubmit={handleSubmit(handleJoinIzzy)}
        className="flex w-full max-w-xl flex-col gap-5"
      >
        <h2 className="text-xl text-gray-700 dark:text-gray-50">
          Insira os dados abaixo para entrar no izzy:
        </h2>
        <Controller
          name="code"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Código" />}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input {...field} type="password" placeholder="Senha" />
          )}
        />
        <Button
          type="submit"
          className="flex items-center justify-center gap-2"
        >
          <svg
            width="31"
            height="31"
            viewBox="0 0 31 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.6562 10.6562V8.23438C10.6562 7.59205 10.9114 6.97604 11.3656 6.52185C11.8198 6.06766 12.4358 5.8125 13.0781 5.8125H25.6719C26.3142 5.8125 26.9302 6.06766 27.3844 6.52185C27.8386 6.97604 28.0938 7.59205 28.0938 8.23438V22.7656C28.0938 23.4079 27.8386 24.024 27.3844 24.4781C26.9302 24.9323 26.3142 25.1875 25.6719 25.1875H13.0781C12.4358 25.1875 11.8198 24.9323 11.3656 24.4781C10.9114 24.024 10.6562 23.4079 10.6562 22.7656V20.3438"
              stroke="white"
              strokeWidth="1.77604"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.4688 20.3438L21.3125 15.5L16.4688 10.6562M2.90625 15.5H20.3438"
              stroke="white"
              strokeWidth="1.77604"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Entrar
        </Button>
      </form>
      <div />
    </div>
  )
}
