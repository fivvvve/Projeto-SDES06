import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import clsx from 'clsx'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { FaUserCircle as User } from 'react-icons/fa'
import { FiEdit3 as Edit } from 'react-icons/fi'
import { GoCheck as Check } from 'react-icons/go'
import { Outlet } from 'react-router-dom'
import { toast } from 'sonner'

import { getUser } from '../../api/get-user'
import { updateUser } from '../../api/update-user'
import { userStore } from '../../store/user'

export function SettingsLayout() {
  const [editMode, setEditMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { user, fetchUser } = userStore((state) => {
    return {
      user: state.user,
      fetchUser: state.fetchUser,
    }
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['get-user'],
    queryFn: () => getUser({ userId: user?.id || null }),
  })

  const { mutateAsync: updateUserFn } = useMutation({
    mutationKey: ['update-user'],
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success('Usuário alterado com sucesso!')
      fetchUser()
      setEditMode(false)
    },
    onError: (err: AxiosError<string>) => {
      if (err.response) {
        toast.error(err.response.data)
      }
    },
  })

  function handleToggleToEditMode() {
    setEditMode((state) => !state)
  }

  function handleSaveEdit(event: FormEvent) {
    if (!user) return

    event.preventDefault()

    if (!inputRef.current) return

    if (!inputRef.current.value) return

    if (user?.name === inputRef.current.value) {
      setEditMode(false)
      return
    }

    updateUserFn({
      id: user.id,
      nome: inputRef.current.value,
    })
  }

  useEffect(() => {
    if (!inputRef.current) return

    if (editMode) {
      inputRef.current.focus()
    }
  }, [editMode])

  return (
    <div className="flex flex-1 flex-col items-center justify-between py-10">
      <header className="flex flex-col items-center justify-center">
        <img
          className="w-48 select-none dark:hidden"
          src="/logo.png"
          alt="Izzy"
        />
        <img
          className="hidden w-48 select-none dark:block"
          src="/dark-logo.png"
          alt="Izzy"
        />
        <h1 className="select-none text-lg/10 text-gray-700 dark:text-gray-50">
          Unifique suas atividades
        </h1>
      </header>
      <div className="flex flex-col items-center gap-6 text-gray-700 dark:text-gray-50">
        <User className="h-60 w-60" />
        <form onSubmit={handleSaveEdit} className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-16 w-72 animate-pulse rounded-lg bg-gray-700/10 dark:bg-gray-50/10" />
          ) : (
            <input
              className={clsx(
                'w-full max-w-md truncate bg-transparent text-center font-barlow text-6xl outline-none',
                {
                  'border-b-2 border-gray-700 dark:border-gray-100': editMode,
                },
              )}
              disabled={!editMode}
              defaultValue={result?.nome}
              ref={inputRef}
            />
          )}
          {editMode ? (
            <button
              onClick={handleSaveEdit}
              type="button"
              className="mt-4 cursor-pointer outline-none"
            >
              <Check className="h-7 w-7" />
            </button>
          ) : (
            <button
              type="button"
              className="mt-4 cursor-pointer outline-none"
              onClick={handleToggleToEditMode}
            >
              <Edit className="h-7 w-7" />
            </button>
          )}
        </form>
        <p className="flex gap-2 font-barlow text-2xl">
          Email:{' '}
          {isLoading ? (
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-700/10 dark:bg-gray-50/10" />
          ) : (
            result?.email
          )}
        </p>
        <Outlet />
      </div>
      <div />
    </div>
  )
}
