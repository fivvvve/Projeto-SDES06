import { zodResolver } from '@hookform/resolvers/zod'
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from '@radix-ui/react-select'
import { Controller, useForm } from 'react-hook-form'
import { IoIosArrowDropdown as Dropdown } from 'react-icons/io'
import { LiaClipboardListSolid as Clipboard } from 'react-icons/lia'
import { VscSearch as Search } from 'react-icons/vsc'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '../../components/button'
import { Input } from '../../components/input'

const izzyFormSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
})

type IzzyFormSchema = z.infer<typeof izzyFormSchema>

export function IzzyForm() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { id } = useParams()

  const name = searchParams.get('name')
  const type = searchParams.get('type')

  const { control, handleSubmit } = useForm<IzzyFormSchema>({
    defaultValues: {
      name: name || '',
      type: type || '',
    },
    resolver: zodResolver(izzyFormSchema),
  })

  function handleSearchIzzys(data: IzzyFormSchema) {
    const { name, type } = data

    setSearchParams((state) => {
      if (name) {
        state.set('name', name)
      } else {
        state.delete('name')
      }

      if (type) {
        state.set('type', type)
      } else {
        state.delete('type')
      }

      return state
    })
  }

  function handleNavigateToActivityCreate() {
    navigate(`/izzys/${id}/new-activity`)
  }

  return (
    <form
      onSubmit={handleSubmit(handleSearchIzzys)}
      className="flex flex-col gap-5 pt-6"
    >
      <div className="flex items-center text-xl text-gray-800 dark:text-gray-100">
        Filtros de pesquisa:{' '}
      </div>

      <Controller
        name="name"
        control={control}
        render={({ field }) => <Input {...field} placeholder="Nome" />}
      />
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select {...field} onValueChange={field.onChange}>
            <SelectTrigger className="flex items-center justify-between rounded-lg border border-gray-600 px-4 py-3 font-antic text-gray-800 data-[placeholder]:text-gray-400 dark:border-gray-50 dark:text-gray-100">
              <SelectValue placeholder="Tipo" />
              <SelectIcon>
                <Dropdown className="h-6 w-6 text-gray-800 dark:text-gray-100" />
              </SelectIcon>
            </SelectTrigger>
            <SelectPortal>
              <SelectContent
                position="popper"
                side="bottom"
                sideOffset={5}
                className="w-[--radix-select-trigger-width] rounded-[10px] bg-gray-550 p-2 text-gray-100 outline-none dark:divide-gray-800 dark:bg-gray-75 dark:text-gray-800"
              >
                <SelectViewport>
                  <SelectItem
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 outline-none hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-300 hover:text-gray-100"
                    value="unique"
                  >
                    <SelectItemText>Única</SelectItemText>
                  </SelectItem>
                  <SelectItem
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 outline-none hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-300 hover:text-gray-100"
                    value="iterative"
                  >
                    <SelectItemText>Iterativa</SelectItemText>
                  </SelectItem>
                </SelectViewport>
              </SelectContent>
            </SelectPortal>
          </Select>
        )}
      />
      <Button className="flex items-center justify-center gap-2">
        <Search className="h-5 w-5" />
        Filtrar
      </Button>
      <Button
        onClick={handleNavigateToActivityCreate}
        className="flex items-center justify-center gap-1.5"
      >
        <Clipboard className="h-5 w-5" /> Nova atividade
      </Button>
    </form>
  )
}
