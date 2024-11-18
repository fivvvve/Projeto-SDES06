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

  const isActivities = pathname === `/izzys/${id}/activities`
  const isMinistered = pathname === `/izzys/${id}/ministered`
  const isNewActivity = pathname === `/izzys/${id}/new-activity`
  const isDetails = pathname.includes('/details')

  const { data: result } = useQuery({
    queryKey: ['get-izzy', id],
    queryFn: () => getIzzy({ izzyId: id || null, userId: user?.id || null }),
  })

  const isResponsable = result
    ? result.users.find((item) => item.user.email === user?.email)?.responsavel
    : null

  return (
    <div className="mx-auto flex w-full max-w-[1170px] flex-col p-12">
      {result && (
        <>
          <header className="flex items-center justify-between">
            <div />
            <h1 className="text-center font-anton text-4xl text-gray-600 dark:text-gray-100">
              {result?.nome}
            </h1>
            <Link to="/izzys">
              <Close className="h-7 w-7 text-gray-800 dark:text-gray-100" />
            </Link>
          </header>
          <nav className="mt-6 flex items-center justify-center gap-8 font-actor text-xl text-gray-800 dark:text-gray-100/50">
            {isNewActivity && (
              <>
                <NavLink
                  to="new-activity"
                  className={clsx({
                    'text-gray-600 dark:text-gray-100': isNewActivity,
                  })}
                >
                  Nova atividade
                </NavLink>
                <div className="h-6 w-px bg-gray-800 dark:bg-gray-100" />
              </>
            )}
            <NavLink
              to="activities"
              className={clsx({
                'text-gray-600 dark:text-gray-100': isActivities,
              })}
            >
              Atividades
            </NavLink>
            {isResponsable && (
              <>
                <div className="h-6 w-px bg-gray-800 dark:bg-gray-100" />
                <NavLink
                  to="ministered"
                  className={clsx({
                    'text-gray-600 dark:text-gray-100': isMinistered,
                  })}
                >
                  Ministradas por mim
                </NavLink>
              </>
            )}
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
        </>
      )}
    </div>
  )
}
