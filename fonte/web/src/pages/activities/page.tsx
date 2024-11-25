import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionItemProps,
  AccordionTrigger,
} from '@radix-ui/react-accordion'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import clsx from 'clsx'
import { add, format, isSameDay, isToday, isTomorrow, parseISO } from 'date-fns'
import { useState } from 'react'
import { MdExpandMore as Expand } from 'react-icons/md'
import { toast } from 'sonner'

import {
  GetUserAcitivitiesResponse,
  getUserActivities,
  Task,
} from '../../api/get-user-activities'
import { updateActivityStatus } from '../../api/update-activity-status'
import { Checkbox } from '../../components/checkbox'
import { queryClient } from '../../lib/queryClient'
import { userStore } from '../../store/user'

export interface TasksPerDay {
  date: Date
  tasks: Task[]
}

export function Activities() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['get-user-activities'],
    queryFn: () => getUserActivities({ userId: user?.id || null }),
  })

  const tasksPerDay = result?.atividades.reduce((acc: TasksPerDay[], curr) => {
    const limitDate = add(parseISO(curr.data_limite), {
      days: 1,
    })

    const taskDay = acc.find((item) => isSameDay(limitDate, item.date))

    if (taskDay) {
      taskDay.tasks.push(curr)
    } else {
      acc.push({
        date: limitDate,
        tasks: [curr],
      })
    }

    return acc
  }, [] as TasksPerDay[])

  return (
    <>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="relative">
            <img
              className="relative z-10 mx-auto"
              src="/logo-vertical.png"
              alt="Izzy"
            />
            <p className="relative mt-6 text-center text-2xl text-gray-800/75 dark:text-gray-100/75">
              Gere uma atividade em um izzy
            </p>
            <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 shadow-[0px_0px_250px_300px_rgba(0,0,0,0.25)]" />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1170px] p-12">
          <h1 className="text-center font-anton text-4xl text-gray-600 dark:text-gray-100">
            Meu Calendário
          </h1>
          <main className="mt-4 space-y-6">
            {tasksPerDay?.map((item) => (
              <DayTasks key={item.date.toString()} taskPerDay={item} />
            ))}
          </main>
        </div>
      )}
    </>
  )
}

interface DayTasksProps {
  taskPerDay: TasksPerDay
}

export function DayTasks({ taskPerDay }: DayTasksProps) {
  return (
    <div>
      <h2 className="mb-4 font-barlow text-3xl font-bold text-gray-800 dark:text-gray-100">
        {isToday(taskPerDay.date)
          ? 'Hoje'
          : isTomorrow(taskPerDay.date)
            ? 'Amanhã'
            : format(taskPerDay.date, 'dd/MM/yyyy')}
      </h2>
      <div className="h-px w-full bg-black dark:bg-gray-100" />
      <Accordion
        type="multiple"
        className="dark:divide-gray-10 w-full divide-y divide-dotted divide-gray-500"
      >
        {taskPerDay.tasks.map((task) => (
          <TaskItem key={task.id} task={task} value={String(task.id)} />
        ))}
      </Accordion>
    </div>
  )
}

interface TaskItemProps extends AccordionItemProps {
  task: Task
}

export function TaskItem({ task, ...rest }: TaskItemProps) {
  const [checked, setChecked] = useState(
    task.status === 'Concluída' || task.status === 'Concluída com Atraso',
  )

  const { mutateAsync: updateActivityStatusFn } = useMutation({
    mutationKey: ['update-status'],
    mutationFn: updateActivityStatus,
    onSuccess: (data, variables) => {
      const userActivitiesListingCache =
        queryClient.getQueriesData<GetUserAcitivitiesResponse>({
          queryKey: ['get-user-activities'],
        })

      userActivitiesListingCache.forEach(([cacheKey, cached]) => {
        if (!cached) {
          return
        }

        queryClient.setQueryData<GetUserAcitivitiesResponse>(cacheKey, {
          pendentes: cached.pendentes,
          atividades: cached.atividades.map((activity) => {
            if (activity.id === variables.taskId) {
              return {
                ...activity,
                status: variables.status,
              }
            }

            return activity
          }),
        })
      })

      toast.success(data)
      setChecked((state) => !state)
    },
    onError: (error: AxiosError<string>) => {
      toast.error(error.response?.data)
    },
  })

  async function handleUpdateStatus(checked: boolean) {
    const status = checked ? 'Concluída' : 'Pendente'

    updateActivityStatusFn({
      taskId: task.id,
      status,
    })
  }

  return (
    <AccordionItem {...rest}>
      <div className="flex items-center px-3 py-4">
        <div className="flex items-center gap-4">
          <Checkbox
            className="h-6 w-6"
            checked={checked}
            disabled={!task.editable}
            onCheckedChange={(checked) => handleUpdateStatus(!!checked)}
          />
          <div className="font-dm-sans text-gray-800 dark:text-gray-100">
            <h3 className="text-2xl font-semibold">{task.titulo}</h3>
            <p className="font-light">{task.izzy}</p>
          </div>
        </div>
        <div className="ml-auto font-dm-sans font-semibold text-gray-800 dark:text-gray-100">
          Status:{' '}
          <span
            className={clsx('font-light', {
              'text-yellow-500': task.status === 'Pendente',
              'text-green-500': task.status === 'Concluída',
            })}
          >
            {task.status}
          </span>
        </div>
        <AccordionTrigger asChild>
          <div className="group ml-5 cursor-pointer">
            <Expand className="h-6 w-6 text-gray-800 group-data-[state=open]:rotate-180 group-data-[state=open]:transition-all dark:text-gray-100" />
          </div>
        </AccordionTrigger>
      </div>
      <AccordionContent className="overflow-clip data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
        <div className="mt-4 px-3 pb-4">
          <div className="flex justify-between text-gray-800 dark:text-gray-100">
            <div className="font-dm-sans font-semibold">
              Criador: <span className="font-light">{task.criador}</span>
            </div>
            <div className="font-dm-sans font-semibold">
              Tipo: <span className="font-light">{task.tipo}</span>
            </div>
            <div className="font-dm-sans font-semibold">
              Data Inicial:{' '}
              <span className="font-light">
                {format(
                  add(parseISO(task.data_inicial), { days: 1 }),
                  'dd/MM/yyyy',
                )}
              </span>
            </div>
          </div>
          <p className="mt-5 text-justify font-light text-gray-800 dark:text-gray-100">
            <span className="font-dm-sans font-semibold">Descrição:</span>{' '}
            {task.descricao}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
