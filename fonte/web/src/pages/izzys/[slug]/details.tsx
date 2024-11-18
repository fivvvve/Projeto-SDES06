import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { RiExpandRightLine as Leave } from 'react-icons/ri'
import { useParams } from 'react-router-dom'

import { getIzzy } from '../../../api/get-izzy'
import { Button } from '../../../components/button'
import { userStore } from '../../../store/user'

export function IzzyDetails() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const { id } = useParams()

  const { data: result } = useQuery({
    queryKey: ['get-izzy'],
    queryFn: () => getIzzy({ izzyId: id || null, userId: user?.id || null }),
  })

  return (
    <main className="mt-4">
      <h2 className="mb-4 font-dm-sans text-3xl font-bold text-gray-800 dark:text-gray-100">
        Informações sobre o izzy:
      </h2>
      <div className="h-px w-full bg-black dark:bg-gray-100" />
      <p
        className={clsx(
          'p-4 text-lg font-light text-gray-600 dark:text-gray-100',
          {
            'opacity-60': !result?.descricao,
          },
        )}
      >
        {result?.descricao || 'Sem descrição'}
      </p>
      <div className="h-px w-full bg-black dark:bg-gray-100" />
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-dm-sans text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Membros: {result?.users.length}
          </h2>
        </div>
        <main className="mt-6 divide-y divide-gray-600/30 border-y border-gray-600/30 dark:divide-gray-100/30 dark:border-gray-100/30">
          {result?.users.map((user) => (
            <div
              key={user.user_id}
              className="flex justify-between px-5 py-4 font-dm-sans text-lg text-gray-600 dark:text-gray-100"
            >
              {user.user.nome}
              {user.responsavel && (
                <span className="rounded-md border border-green-500 p-1 font-dm-sans text-sm text-green-500">
                  Administrador
                </span>
              )}
            </div>
          ))}
        </main>
        <div className="mt-12 w-full">
          <Button
            variant="danger"
            className="mx-auto flex items-center justify-center gap-2 px-24"
          >
            <Leave className="h-5 w-5" />
            Sair do Izzy
          </Button>
        </div>
      </div>
    </main>
  )
}
