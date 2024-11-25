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
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import {
  IoIosArrowDropdown as Dropdown,
  IoIosCalendar as Calendar,
} from 'react-icons/io'
import { VscSearch as Search } from 'react-icons/vsc'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { getIzzys } from '../../api/get-izzys'
import { Button } from '../../components/button'
import { Input } from '../../components/input'
import { userStore } from '../../store/user'

const reportSchema = z.object({
  initialDate: z.string(),
  finalDate: z.string(),
})

type ReportSchema = z.infer<typeof reportSchema>

export function ReportsForm() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const [searchParams, setSearchParams] = useSearchParams()

  const initialDate = searchParams.get('initialDate')
  const finalDate = searchParams.get('finalDate')

  const { data: result } = useQuery({
    queryKey: ['get-izzys'],
    queryFn: () =>
      getIzzys({
        userId: user?.id || null,
      }),
  })

  const { control, handleSubmit } = useForm<ReportSchema>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      initialDate: initialDate ?? '',
      finalDate: finalDate ?? '',
    },
  })

  function handleReport(data: ReportSchema) {
    const { initialDate, finalDate } = data

    setSearchParams((state) => {
      if (initialDate) {
        state.set('initialDate', initialDate)
      } else {
        state.delete('initialDate')
      }

      if (finalDate) {
        state.set('finalDate', finalDate)
      } else {
        state.delete('finalDate')
      }

      return state
    })
  }

  return (
    <form
      onSubmit={handleSubmit(handleReport)}
      className="flex flex-col gap-5 pt-5"
    >
      <h2 className="flex items-center font-actor text-lg text-gray-800 dark:text-gray-100">
        Insira os dados sobre o relatório:
      </h2>
      <Controller
        name="initialDate"
        control={control}
        render={({ field }) => (
          <Input
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
            placeholder="Data Inicial"
          >
            <Calendar className="h-5 w-5 text-gray-800 dark:text-gray-100" />
          </Input>
        )}
      />
      <Controller
        name="finalDate"
        control={control}
        render={({ field }) => (
          <Input
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
            // max={format(new Date(), 'yyyy-MM-dd')}
            placeholder="Data Final"
          >
            <Calendar className="h-5 w-5 text-gray-800 dark:text-gray-100" />
          </Input>
        )}
      />
      <Select>
        <SelectTrigger className="flex items-center justify-between rounded-lg border border-gray-600 px-4 py-3 font-antic text-gray-800 data-[placeholder]:text-gray-400 dark:border-gray-50 dark:text-gray-100">
          <SelectValue placeholder="Izzy" />
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
              {result &&
                result.map((izzy) => (
                  <SelectItem
                    key={izzy.id}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 outline-none hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-300 hover:text-gray-100"
                    value={izzy.id}
                  >
                    <SelectItemText>{izzy.nome}</SelectItemText>
                  </SelectItem>
                ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>
      <Button className="flex items-center justify-center gap-2">
        <Search className="h-5 w-5" />
        Filtrar
      </Button>
    </form>
  )
}
