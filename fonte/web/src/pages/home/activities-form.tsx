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
import { IoIosArrowDropdown as Dropdown } from 'react-icons/io'
import { PiWarning as Warning } from 'react-icons/pi'
import { VscSearch as Search } from 'react-icons/vsc'

import { getUserActivities } from '../../api/get-user-activities'
import { Button } from '../../components/button'
import { Checkbox } from '../../components/checkbox'
import { Input } from '../../components/input'
import { userStore } from '../../store/user'

export function ActivitiesForm() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const { data: result } = useQuery({
    queryKey: ['get-user-activities'],
    queryFn: () => getUserActivities({ userId: user?.id || null }),
  })

  return (
    <div className="py-6">
      <p className="text-gray-800 dark:text-gray-100">Filtros de pesquisa:</p>
      <form className="mt-6 flex flex-col gap-5">
        <Input placeholder="Nome" />
        <Select>
          <SelectTrigger className="flex items-center justify-between rounded-lg border border-gray-600 px-4 py-3 font-antic text-gray-800 data-[placeholder]:text-gray-400 dark:border-gray-50 dark:text-gray-100">
            <SelectValue placeholder="Tipo de atividade" />
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
        <Input type="date" placeholder="Data" />
        <label className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Checkbox />
          Exibir apenas atividades anteriores
        </label>
        <label className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Checkbox />
          Exibir apenas atividades pendentes
        </label>
        <Button className="flex items-center justify-center gap-2 py-2">
          <Search />
          Filtrar
        </Button>
        {result?.pendentes && (
          <p className="flex items-center gap-2 text-yellow-500">
            <Warning className="h-6 w-6" /> Você possui atividades atrasadas
          </p>
        )}
      </form>
    </div>
  )
}
