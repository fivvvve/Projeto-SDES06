import { useMutation, useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { FiEdit3 as Edit } from 'react-icons/fi'
import { GoCheck as Check } from 'react-icons/go'
import { IoClose as Close } from 'react-icons/io5'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getIzzy } from '../../../api/get-izzy'
import { updateIzzy } from '../../../api/update-izzy'
import { queryClient } from '../../../lib/queryClient'
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

  const [editMode, setEditMode] = useState(false)
  const divRef = useRef<HTMLDivElement | null>(null)

  const { data: result } = useQuery({
    queryKey: ['get-izzy', id],
    queryFn: () => getIzzy({ izzyId: id || null, userId: user?.id || null }),
  })

  const { mutateAsync: updateIzzyFn } = useMutation({
    mutationKey: ['update-izzy'],
    mutationFn: updateIzzy,
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['get-izzy'] })
      handleToggleEditMode()
      toast.success(data)
    },
  })

  const isResponsable = result
    ? result.users.find((item) => item.user.email === user?.email)?.responsavel
    : null

  function handleToggleEditMode() {
    setEditMode((state) => !state)
  }

  function handleSaveEdit() {
    if (!id) return

    if (!divRef.current?.innerText) return

    if (divRef.current?.innerText === result?.nome) {
      handleToggleEditMode()
      return
    }

    const name = divRef.current?.innerText

    updateIzzyFn({
      id,
      name,
      description: result?.descricao || null,
      responsableId: user?.id || null,
    })
  }

  useEffect(() => {
    if (!divRef.current) return

    if (editMode) {
      divRef.current.focus()
    }
  }, [editMode])

  return (
    <div className="mx-auto flex w-full max-w-[1170px] flex-col p-12">
      {result && (
        <>
          <header className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-5 text-gray-600 dark:text-gray-100">
              <div
                contentEditable={editMode}
                className={clsx(
                  'w-fit max-w-72 truncate bg-transparent text-center font-anton text-4xl outline-none',
                  {
                    'border-b-2 border-gray-700 dark:border-gray-100': editMode,
                  },
                )}
                defaultValue={result?.nome}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSaveEdit()
                  }
                }}
                ref={divRef}
              >
                {result.nome}
              </div>
              {isResponsable && isDetails && (
                <>
                  {editMode ? (
                    <button onClick={handleSaveEdit} type="button">
                      <Check className="h-7 w-7" />
                    </button>
                  ) : (
                    <button onClick={handleToggleEditMode}>
                      <Edit className="h-7 w-7" />
                    </button>
                  )}
                </>
              )}
            </div>
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
