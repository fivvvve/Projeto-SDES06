import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionItemProps,
  AccordionTrigger,
} from '@radix-ui/react-accordion'
import { useQuery } from '@tanstack/react-query'
import { add, isSameDay, isToday, isTomorrow, parseISO } from 'date-fns'
import { FiEdit3 as Edit } from 'react-icons/fi'
import { IoTrashOutline as Trash } from 'react-icons/io5'
import { MdExpandMore as Expand } from 'react-icons/md'
import { TbPoint as Point } from 'react-icons/tb'
import { useParams, useSearchParams } from 'react-router-dom'

import {
  getMinistiredActivities,
  GetMinistiredActivitiesResponse,
} from '../../../api/get-ministerd-activities'
import { Button } from '../../../components/button'
import { format } from '../../../lib/date-fns'
import { DeleteActivityModal } from './delete-activity-modal'
import { UpdateActivityModal } from './update-activity-modal'

interface TasksPerDay {
  date: Date
  tasks: GetMinistiredActivitiesResponse[]
}

export function IzzyMinistered() {
  const [searchParams] = useSearchParams()

  const { id } = useParams()

  const name = searchParams.get('name')
  const type = searchParams.get('type')

  const { data: result, isLoading } = useQuery({
    queryKey: ['get-ministered-activities', name, type],
    queryFn: () =>
      getMinistiredActivities({
        izzyId: id || null,
        title: name,
        type,
      }),
  })

  const tasksPerDay = result?.reduce((acc: TasksPerDay[], curr) => {
    const initialDate = add(parseISO(curr.data_inicio), {
      days: 1,
    })

    const taskDay = acc.find((item) => isSameDay(initialDate, item.date))

    if (taskDay) {
      taskDay.tasks.push(curr)
    } else {
      acc.push({
        date: initialDate,
        tasks: [curr],
      })
    }

    return acc
  }, [] as TasksPerDay[])

  return (
    <>
      {!isLoading && !result?.length ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="relative">
            <img
              className="relative z-10 mx-auto"
              src="/logo-vertical.png"
              alt="Izzy"
            />
            <p className="relative mt-6 text-center text-2xl text-gray-800/75 dark:text-gray-100/75">
              Não há atividades a serem realizadas
            </p>
            <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 shadow-[0px_0px_250px_300px_rgba(0,0,0,0.25)]" />
          </div>
        </div>
      ) : (
        <main className="mt-4">
          {tasksPerDay?.map((item) => (
            <DayTasks key={item.date.toString()} taskPerDay={item} />
          ))}
        </main>
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
  task: GetMinistiredActivitiesResponse
}

export function TaskItem({ task, ...rest }: TaskItemProps) {
  return (
    <AccordionItem {...rest}>
      <div className="flex items-center px-3 py-4">
        <Point className="h-6 w-6 text-gray-800 dark:text-gray-100" />
        <div className="ml-3 flex items-center gap-4">
          <div className="font-dm-sans text-gray-800 dark:text-gray-100">
            <h3 className="text-2xl font-semibold">{task.titulo}</h3>
            <p className="font-semibold">
              Tipo: <span className="font-light">{task.tipo}</span>
            </p>
          </div>
        </div>
        <div className="ml-auto font-dm-sans font-semibold text-gray-800 dark:text-gray-100">
          {task.data_limite
            ? 'Data Limite:'
            : task.data_final
              ? 'Data Final:'
              : null}{' '}
          <span className="font-light">
            {task.data_limite
              ? format(task.data_limite, 'dd/MM/yyyy')
              : task.data_final
                ? format(task.data_final, 'dd/MM/yyyy')
                : null}
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
          <p className="text-justify text-lg font-light text-gray-800 dark:text-gray-100">
            <span className="font-dm-sans font-semibold">Descrição:</span>{' '}
            {task.descricao}
          </p>
        </div>
        <div className="my-5 mb-10 flex items-center justify-center gap-8">
          <UpdateActivityModal task={task}>
            <Button className="flex items-center gap-2 px-14 py-2">
              <Edit className="h-5 w-5" /> Alterar Informações
            </Button>
          </UpdateActivityModal>
          <DeleteActivityModal task={task}>
            <Button
              variant="danger"
              className="flex items-center gap-2 px-14 py-2"
            >
              <Trash className="h-5 w-5" /> Excluir Atividade
            </Button>
          </DeleteActivityModal>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
