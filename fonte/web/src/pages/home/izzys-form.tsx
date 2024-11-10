import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { IoIosArrowForward as ArrowRight } from 'react-icons/io'
import { IoAdd as Add } from 'react-icons/io5'
import { VscSearch as Search } from 'react-icons/vsc'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { getIzzys } from '../../api/get-izzys'
import { Button } from '../../components/button'
import { Checkbox } from '../../components/checkbox'
import { Input } from '../../components/input'
import { queryClient } from '../../lib/queryClient'
import { userStore } from '../../store/user'

const izzyFormSchema = z.object({
  onlyResponsable: z.boolean().optional(),
  name: z.string().optional(),
})

type IzzyFormSchema = z.infer<typeof izzyFormSchema>

export function IzzysForm() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const name = searchParams.get('name')
  const onlyResponsable = searchParams.get('onlyResponsable')

  const { control, handleSubmit } = useForm<IzzyFormSchema>({
    defaultValues: {
      name: name || '',
      onlyResponsable: onlyResponsable === 'sim' ? true : undefined,
    },
    resolver: zodResolver(izzyFormSchema),
  })

  const { data: result } = useQuery({
    queryKey: ['get-izzys', name, onlyResponsable],
    queryFn: () =>
      getIzzys({
        name,
        onlyResponsable,
        userId: user?.id || null,
      }),
  })

  function handleSearchIzzys(data: IzzyFormSchema) {
    const { name, onlyResponsable } = data

    setSearchParams((state) => {
      if (name) {
        state.set('name', name)
      } else {
        state.delete('name')
      }

      if (onlyResponsable) {
        state.set('onlyResponsable', 'sim')
      } else {
        state.delete('onlyResponsable')
      }

      return state
    })
  }

  function handleNavigateToIzzyCreate() {
    navigate('/izzys/create')
  }

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ['get-izzys'] })
  }, [user])

  return (
    <form
      onSubmit={handleSubmit(handleSearchIzzys)}
      className="flex flex-col gap-5 pt-6"
    >
      <div className="flex items-center text-xl text-gray-800 dark:text-gray-100">
        Meus izzys:{' '}
        <Button
          onClick={handleNavigateToIzzyCreate}
          type="button"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300 p-0"
        >
          <Add className="h-5 w-5" />
        </Button>
        <Button
          type="submit"
          className="ml-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300 p-0"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <label className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <Controller
          name="onlyResponsable"
          control={control}
          render={({ field }) => (
            <Checkbox onCheckedChange={field.onChange} {...field} />
          )}
        />
        Exibir apenas meus izzys
      </label>
      <Controller
        name="name"
        control={control}
        render={({ field }) => <Input {...field} placeholder="Nome do izzy" />}
      />
      <main className="divide-y divide-gray-800/30 border-y border-gray-800/30 dark:divide-gray-100/30 dark:border-gray-100/30">
        {result &&
          result.map((item) => (
            <Link
              key={item.id}
              to={`/izzys/${item.id}`}
              className="flex items-center justify-between py-4 text-gray-800 dark:text-gray-100"
            >
              {item.nome}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ))}
      </main>
    </form>
  )
}
