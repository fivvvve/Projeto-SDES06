import { useQuery } from '@tanstack/react-query'
import { add, isSameDay, parseISO } from 'date-fns'
import { useParams } from 'react-router-dom'

import { getUserActivities } from '../../../api/get-user-activities'
import { userStore } from '../../../store/user'
import { DayTasks, TasksPerDay } from '../../activities/page'

export function Izzy() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const { id } = useParams()

  const { data: result, isLoading } = useQuery({
    queryKey: ['get-user-activities', id],
    queryFn: () =>
      getUserActivities({ userId: user?.id || null, izzyId: id || null }),
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
      {!isLoading && !result?.atividades.length ? (
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
