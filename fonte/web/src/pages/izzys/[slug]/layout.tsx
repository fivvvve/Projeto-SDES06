import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { IoClose as Close } from 'react-icons/io5'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'

import { getIzzy } from '../../../api/get-izzy'
import { userStore } from '../../../store/user'

export function IzzyLayout() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const { pathname } = useLocation()
  const { id } = useParams()

  const isDetails = pathname.includes('/details')

  const { data: result } = useQuery({
    queryKey: ['get-izzy', id],
    queryFn: () => getIzzy({ izzyId: id || null, userId: user?.id || null }),
  })

  return (
    <div className="mx-auto flex w-full max-w-[1170px] flex-col p-12">
      <header className="flex items-center justify-between">
        <div />
        <h1 className="text-center font-anton text-4xl text-gray-600 dark:text-gray-100">
          {result?.nome}
        </h1>
        <Link to="/izzys">
          <Close className="h-7 w-7 text-gray-800 dark:text-gray-100" />
        </Link>
      </header>
      <nav className="mt-6 flex items-center justify-center gap-8 font-actor text-xl text-gray-800 dark:divide-gray-100 dark:text-gray-100/50">
        <NavLink
          to=""
          className={clsx({
            'text-gray-600 dark:text-gray-100': !isDetails,
          })}
        >
          Atividades
        </NavLink>
        <div className="h-6 w-px bg-gray-800 dark:bg-gray-100" />
        <NavLink
          to="details"
          className={clsx({
            'text-gray-600 dark:text-gray-100': isDetails,
          })}
        >
          Informações
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
