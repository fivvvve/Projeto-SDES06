import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createIzzy } from '../../api/create-izzy'
import { Button } from '../../components/button'
import { Input } from '../../components/input'
import { Textarea } from '../../components/textarea'
import { queryClient } from '../../lib/queryClient'
import { userStore } from '../../store/user'

const createIzzySchema = z.object({
  name: z
    .string({ required_error: 'Nome deve ser preenchido' })
    .min(1, 'Nome deve ser preenchido'),
  description: z.string().optional(),
})

type CreateIzzySchema = z.infer<typeof createIzzySchema>

export function IzzyCreate() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIzzySchema>({
    resolver: zodResolver(createIzzySchema),
  })

  const { mutateAsync: createIzzyFn } = useMutation({
    mutationKey: ['create-izzy'],
    mutationFn: createIzzy,
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['get-izzys'] })
      toast.success(data)
    },
    onError: (error: AxiosError<string>) => {
      toast.error(error.response?.data)
    },
  })

  function handleCreateIzzy(data: CreateIzzySchema) {
    if (!user) return

    const { name, description } = data
    console.log(description)
    createIzzyFn({
      name,
      description,
      responsableId: user?.id,
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
        onSubmit={handleSubmit(handleCreateIzzy)}
        className="flex w-full max-w-xl flex-col gap-5"
      >
        <h2 className="text-xl text-gray-700 dark:text-gray-50">
          Insira os dados abaixo para criar o izzy:
        </h2>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Nome do Izzy" />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea {...field} placeholder="Descrição" />
          )}
        />
        {errors.name && (
          <p className="-my-2 text-red-500">{errors.name.message}</p>
        )}
        <Button
          type="submit"
          className="flex items-center justify-center gap-2"
        >
          <svg
            width="30"
            height="27"
            viewBox="0 0 30 27"
            className="fill-current"
          >
            <path d="M29.2519 12.3959H26.5615C26.4876 11.2934 26.2799 10.2098 25.9384 9.16325C25.8095 8.76977 25.3871 8.55506 24.9936 8.68388C24.6001 8.81271 24.3854 9.23515 24.5143 9.62863C24.8069 10.5254 24.9896 11.4522 25.0615 12.3959H22.1484C21.735 12.3959 21.3994 12.7315 21.3994 13.1449C21.3994 13.5584 21.735 13.8939 22.1484 13.8939H25.0795C25.0326 14.8417 24.8738 15.7764 24.6041 16.6802C24.4853 17.0767 24.711 17.4941 25.1075 17.612C25.1794 17.633 25.2513 17.6439 25.3222 17.6439C25.6448 17.6439 25.9424 17.4342 26.0392 17.1087C26.3508 16.066 26.5306 14.9875 26.5785 13.8939H29.2509C29.6644 13.8939 29.9999 13.5584 29.9999 13.1449C29.9999 12.7315 29.6654 12.3959 29.2519 12.3959Z" />
            <path d="M13.4762 4.85117C13.3583 4.84518 13.2375 4.84518 13.1186 4.85117C11.9322 4.91109 10.9266 5.64412 10.4961 6.76462C10.0537 7.91409 10.3164 9.16542 11.1822 10.0313L12.063 10.9121C12.3936 11.2417 12.832 11.4234 13.2984 11.4234C13.7648 11.4234 14.2042 11.2417 14.5337 10.9121L15.4146 10.0313C16.2794 9.16642 16.5421 7.91409 16.1007 6.76462C15.6682 5.64412 14.6626 4.91109 13.4762 4.85117ZM14.354 8.97168L13.4732 9.85251C13.3753 9.94938 13.2175 9.94938 13.1196 9.85251L12.2388 8.97168C11.7125 8.44538 11.7145 7.76429 11.8923 7.3029C12.111 6.73466 12.5973 6.37714 13.1925 6.34718C13.2265 6.34518 13.2614 6.34418 13.2964 6.34418C13.3313 6.34418 13.3663 6.34518 13.4003 6.34718C13.9965 6.37714 14.4818 6.73466 14.7005 7.3029C14.8783 7.76429 14.8813 8.44438 14.354 8.97168Z" />
            <path d="M23.4777 20.6714C23.1581 20.4088 22.6858 20.4557 22.4231 20.7753C20.9561 22.5639 18.9817 23.8881 16.7916 24.5682V15.8149C16.7916 13.8875 15.2237 12.3196 13.2963 12.3196C11.3688 12.3196 9.80093 13.8875 9.80093 15.8149V24.5682C4.93742 23.0563 1.498 18.4594 1.498 13.2973C1.498 6.79094 6.79094 1.498 13.2973 1.498C16.7027 1.498 19.9414 2.97004 22.1844 5.53562C22.4571 5.8472 22.9294 5.87916 23.241 5.60652C23.5526 5.33389 23.5846 4.86152 23.3119 4.54993C20.7853 1.65879 17.1342 0 13.2973 0C5.96505 0 0 5.96505 0 13.2973C0 16.3382 1.0526 19.3103 2.96505 21.6671C4.84854 23.99 7.48502 25.6258 10.3881 26.274L11.2999 26.4777V15.8149C11.2999 14.7134 12.1957 13.8176 13.2973 13.8176C14.3988 13.8176 15.2946 14.7134 15.2946 15.8149V26.4777L16.2064 26.274C19.0826 25.6318 21.7021 24.017 23.5816 21.726C23.8442 21.4055 23.7973 20.9341 23.4777 20.6714Z" />
          </svg>
          Criar
        </Button>
      </form>
      <div />
    </div>
  )
}
