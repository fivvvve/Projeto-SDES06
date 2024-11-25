import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { FaLink as Link } from 'react-icons/fa6'
import { FiEdit3 as Edit } from 'react-icons/fi'
import { GoCheck as Check } from 'react-icons/go'
import { IoRemoveCircleOutline as RemoveCircle } from 'react-icons/io5'
import { RiExpandRightLine as Leave } from 'react-icons/ri'
import { RxDividerHorizontal as AnyOption } from 'react-icons/rx'
import {
  TbUserDown as UserDown,
  TbUsersPlus as UserPlus,
  TbUserUp as UserUp,
} from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { generateIzzyInvite } from '../../../api/generate-izzy-invite'
import { getIzzy } from '../../../api/get-izzy'
import { promoteMember } from '../../../api/promote-member'
import { updateIzzy } from '../../../api/update-izzy'
import { Button } from '../../../components/button'
import { queryClient } from '../../../lib/queryClient'
import { userStore } from '../../../store/user'
import { LeaveIzzyModal } from './leave-izzy-modal'
import { RemoveMemberModal } from './remove-member-modal'

export function IzzyDetails() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const [editMode, setEditMode] = useState(false)
  const divRef = useRef<HTMLDivElement | null>(null)

  const { id } = useParams()

  const { mutateAsync: updateIzzyFn } = useMutation({
    mutationKey: ['update-izzy'],
    mutationFn: updateIzzy,
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['get-izzy'] })
      toast.success(data)
      handleToggleEditMode()
    },
  })

  const { mutateAsync: generateIzzyInviteFn } = useMutation({
    mutationKey: ['generate-invite'],
    mutationFn: generateIzzyInvite,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['get-izzy'] })
      toast.success('Convite gerado com sucesso!')
    },
    onError: (error: AxiosError<string>) => {
      if (error.response) {
        toast.error(error.response.data)
      }
    },
  })

  const { mutateAsync: promoteMemberFn } = useMutation({
    mutationKey: ['promote-member'],
    mutationFn: promoteMember,
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['get-izzy'] })
      toast.success(data)
    },
    onError: (error: AxiosError<string>) => {
      if (error.response) {
        toast.error(error.response.data)
      }
    },
  })

  function handlePromoteMember(email: string) {
    promoteMemberFn({
      izzyId: id || null,
      email,
      userId: user?.id || null,
    })
  }

  function handleGenerateInvite() {
    generateIzzyInviteFn({
      izzyId: id || null,
    })
  }

  function handleCopyInvite() {
    if (!result?.codigo_convite) return

    window.navigator.clipboard.writeText(result.codigo_convite)
    toast.info('Convite copiado para área de transferência!')
  }

  function handleToggleEditMode() {
    setEditMode((state) => !state)
  }

  function handleSaveEdit() {
    if (!id) return

    if (divRef.current?.innerText === result?.descricao) {
      handleToggleEditMode()
      return
    }

    const description = divRef.current?.innerText.trim()

    updateIzzyFn({
      id,
      name: result?.nome || null,
      description: description || null,
      responsableId: user?.id || null,
    })
  }

  const { data: result } = useQuery({
    queryKey: ['get-izzy'],
    queryFn: () => getIzzy({ izzyId: id || null, userId: user?.id || null }),
  })

  const isResponsable = result
    ? result.users.find((item) => item.user.email === user?.email)?.responsavel
    : null

  useEffect(() => {
    if (!divRef.current) return

    if (editMode) divRef.current.focus()
  }, [editMode])

  useEffect(() => {
    if (!result) return
    if (!divRef.current) return

    if (!result.descricao) return

    divRef.current.innerText = result.descricao
  }, [result])

  return (
    <main className="mt-4">
      <h2 className="mb-4 font-dm-sans text-3xl font-bold text-gray-800 dark:text-gray-100">
        Informações sobre o izzy:
      </h2>
      <div className="h-px w-full bg-black dark:bg-gray-100" />
      <div className="flex items-center p-4 text-lg font-light text-gray-600 dark:text-gray-100">
        <div
          className={clsx(
            'h-auto w-full max-w-full resize-none overflow-hidden bg-transparent outline-none',
            {
              'opacity-50': !result?.descricao && !editMode,
            },
          )}
          contentEditable={editMode}
          ref={divRef}
        >
          {result?.descricao
            ? result.descricao
            : editMode
              ? ''
              : 'Sem descrição'}
        </div>
        {isResponsable && (
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
      <div className="h-px w-full bg-black dark:bg-gray-100" />
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-dm-sans text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Membros:{' '}
              <span className="font-light">{result?.users.length}</span>
            </h2>
            {isResponsable && !result?.codigo_convite && (
              <Button
                onClick={handleGenerateInvite}
                className="rounded-full px-3 py-1"
              >
                <UserPlus className="h-5 w-5" />
              </Button>
            )}
          </div>
          {result?.codigo_convite && (
            <div className="flex items-center gap-9 font-dm-sans text-lg text-gray-800 dark:text-gray-100">
              <p className="font-semibold">
                Convite:{' '}
                <span className="font-light">{result?.codigo_convite}</span>
              </p>
              <p className="font-semibold">
                Senha: <span className="font-light">{result?.senha}</span>
              </p>
              <Button
                onClick={handleCopyInvite}
                className="rounded-full px-3 py-1"
              >
                <Link className="h-5 w-5" />
              </Button>
            </div>
          )}
          <div className="w-24" />
        </div>
        <main className="mt-6 divide-y divide-gray-600/30 border-y border-gray-600/30 dark:divide-gray-100/30 dark:border-gray-100/30">
          {result?.users.map((member) => {
            const isAuthenticatedUser = member.user.email === user?.email

            const isMemberResponable = member.responsavel

            if (member.saiu) return null

            return (
              <div
                key={member.user_id}
                className="flex justify-between px-5 py-4 font-dm-sans text-lg text-gray-600 dark:text-gray-100"
              >
                {member.user.nome}
                <div className="flex items-center gap-5">
                  {isMemberResponable && (
                    <span className="rounded-md border border-green-500 p-1 font-dm-sans text-sm text-green-500">
                      Administrador
                    </span>
                  )}
                  {isAuthenticatedUser && isResponsable ? (
                    <>
                      <button disabled>
                        <AnyOption className="h-6 w-6" />
                      </button>
                      <button disabled>
                        <AnyOption className="h-6 w-6" />
                      </button>
                    </>
                  ) : isResponsable && isMemberResponable ? (
                    <>
                      <button>
                        <UserDown className="h-6 w-6" />
                      </button>
                      <RemoveMemberModal
                        izzyId={id || null}
                        userId={user?.id || null}
                        email={member.user.email}
                      >
                        <button>
                          <RemoveCircle className="h-6 w-6" />
                        </button>
                      </RemoveMemberModal>
                    </>
                  ) : (
                    isResponsable &&
                    !isMemberResponable && (
                      <>
                        <button
                          onClick={() => handlePromoteMember(member.user.email)}
                        >
                          <UserUp className="h-6 w-6" />
                        </button>
                        <RemoveMemberModal
                          izzyId={id || null}
                          userId={user?.id || null}
                          email={member.user.email}
                        >
                          <button>
                            <RemoveCircle className="h-6 w-6" />
                          </button>
                        </RemoveMemberModal>
                      </>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </main>
        <div className="mt-12 w-full">
          <LeaveIzzyModal izzyId={id || null} userId={user?.id || null}>
            <Button
              variant="danger"
              className="mx-auto flex items-center justify-center gap-2 px-24"
            >
              <Leave className="h-5 w-5" />
              Sair do Izzy
            </Button>
          </LeaveIzzyModal>
        </div>
      </div>
    </main>
  )
}
