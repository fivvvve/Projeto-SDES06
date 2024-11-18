import { zodResolver } from '@hookform/resolvers/zod'
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
import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import clsx from 'clsx'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CiCircleMinus as UserMinus } from 'react-icons/ci'
import { FaUserCircle as User } from 'react-icons/fa'
import {
  IoIosArrowDropdown as Dropdown,
  IoIosCalendar as Calendar,
} from 'react-icons/io'
import { IoAdd as Add, IoClose as X } from 'react-icons/io5'
import { LiaClipboardListSolid as Clipboard } from 'react-icons/lia'
import {
  VscDebugContinueSmall as Continue,
  VscDebugReverseContinue as Reverse,
} from 'react-icons/vsc'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { createActivity } from '../../api/create-activity'
import {
  getIzzyMembers,
  GetIzzyMembersResponse,
} from '../../api/get-izzy-members'
import { Button } from '../../components/button'
import { Input } from '../../components/input'
import { Textarea } from '../../components/textarea'
import { userStore } from '../../store/user'

const weekDays = [
  { label: 'D', value: 'Domingo' },
  { label: 'S', value: 'Segunda' },
  { label: 'T', value: 'Terça' },
  { label: 'Q', value: 'Quarta' },
  { label: 'Q', value: 'Quinta' },
  { label: 'S', value: 'Sexta' },
  { label: 'S', value: 'Sábado' },
]

const newActivitySchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(0),
    initialDate: z.string(),
    type: z.enum(['unique', 'iterative']),
    limitDate: z.string().optional(),
    finalDate: z.string().optional(),
  })
  .refine((data) => (data.type === 'unique' ? !!data.limitDate : true), {
    message: '',
    path: ['limitDate'],
  })

type NewActivitySchema = z.infer<typeof newActivitySchema>

export function NewActivity() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const { id } = useParams()
  const navigate = useNavigate()

  const {
    control,
    watch,
    reset,
    handleSubmit,
    formState: { isValid },
  } = useForm<NewActivitySchema>({
    resolver: zodResolver(newActivitySchema),
    defaultValues: {
      type: 'unique',
    },
  })

  const { mutateAsync: createActivityFn } = useMutation({
    mutationKey: ['create-activity'],
    mutationFn: createActivity,
    onSuccess: (data) => {
      toast.success(data)
      navigate(`/izzys/${id}/activities`)
    },
    onError: (error: AxiosError<string>) => {
      toast.error(error.response?.data)
    },
  })

  function handleCreateActivity(data: NewActivitySchema) {
    const { title, description, initialDate, type, finalDate, limitDate } = data

    const responsables = selectedMembers?.map((item) => item.email)

    createActivityFn({
      izzyId: id || null,
      userId: user?.id || null,
      title,
      description,
      initialDate,
      type,
      limitDate: limitDate || null,
      finalDate,
      weekDays: selectedWeekDays,
      responsables: responsables || null,
    })
  }

  const [isFirstStep, setIsFirstStep] = useState(true)
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[] | null>(
    null,
  )

  const [type, initialDate] = watch(['type', 'initialDate'])

  function handleNextStep() {
    setIsFirstStep(false)
  }

  function handlePreviousStep() {
    setIsFirstStep(true)
  }

  function handleCancel() {
    reset({
      title: '',
      description: '',
      initialDate: '',
      limitDate: '',
      finalDate: '',
      type: 'unique',
    })
    setSelectedWeekDays([])
  }

  const { data: result } = useQuery({
    queryKey: ['get-izzy-members'],
    queryFn: () => getIzzyMembers({ izzyId: id || null }),
  })

  const [selectedMembers, setSelectedMembers] = useState<
    GetIzzyMembersResponse[] | null
  >(null)

  useEffect(() => {
    setSelectedWeekDays([])
  }, [type])

  return (
    <form
      onSubmit={handleSubmit(handleCreateActivity)}
      className="mx-auto mt-20 flex w-full max-w-[720px] flex-col gap-5"
    >
      {isFirstStep ? (
        <>
          <p className="font-anek-bangla text-xl text-gray-800 dark:text-gray-100">
            Insira os dados abaixo para criar a atividade:
          </p>
          <Controller
            name="title"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Nome" />}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Descrição" />
            )}
          />
          <Controller
            name="initialDate"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                onFocus={(e) => {
                  e.currentTarget.type = 'date'
                  e.currentTarget.showPicker()
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.value) {
                    e.currentTarget.type = 'text'
                  }
                }}
                className="flex items-center"
                placeholder="Data Inicial"
                min={format(new Date(), 'yyyy-MM-dd')}
              >
                <Calendar className="h-5 w-5 text-gray-800 dark:text-gray-100" />
              </Input>
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger className="flex items-center justify-between rounded-lg border border-gray-600 px-4 py-3 font-antic text-gray-800 data-[placeholder]:text-gray-400 dark:border-gray-50 dark:text-gray-100">
                  <SelectValue placeholder="Tipo" />
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
            )}
          />
          {type === 'unique' && (
            <Controller
              name="limitDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  onFocus={(e) => {
                    e.currentTarget.type = 'date'
                    e.currentTarget.showPicker()
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.value) {
                      e.currentTarget.type = 'text'
                    }
                  }}
                  className="flex items-center"
                  placeholder="Data Limite"
                  min={initialDate}
                >
                  <Calendar className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                </Input>
              )}
            />
          )}
          {type === 'iterative' && (
            <>
              <Controller
                name="finalDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onFocus={(e) => {
                      e.currentTarget.type = 'date'
                      e.currentTarget.showPicker()
                    }}
                    onBlur={(e) => {
                      if (!e.currentTarget.value) {
                        e.currentTarget.type = 'text'
                      }
                    }}
                    className="flex items-center"
                    placeholder="Data Final"
                    min={initialDate}
                  >
                    <Calendar className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                  </Input>
                )}
              />
              <div>
                <p className="font-antic text-lg text-gray-800 dark:text-gray-100">
                  Dias da Semana:
                </p>
                <div className="mt-5 flex flex-1 justify-around gap-10">
                  {weekDays.map((day) => (
                    <button
                      type="button"
                      onClick={(e) => {
                        if (
                          e.currentTarget.getAttribute('data-state') ===
                          'checked'
                        ) {
                          setSelectedWeekDays(
                            (state) =>
                              state?.filter((item) => item !== day.value) ||
                              null,
                          )
                          e.currentTarget.removeAttribute('data-state')
                        } else {
                          setSelectedWeekDays((state) => {
                            if (state) {
                              return [...state, day.value]
                            }
                            return [day.value]
                          })
                          e.currentTarget.setAttribute('data-state', 'checked')
                        }
                      }}
                      key={day.value}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-800 text-lg text-gray-800 data-[state=checked]:bg-gray-100 data-[state=checked]:bg-gray-800 data-[state=checked]:text-gray-100 data-[state=checked]:text-gray-800 dark:border-gray-100 dark:text-gray-100 dark:data-[state=checked]:bg-gray-100 dark:data-[state=checked]:text-gray-800"
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={
              !isValid || (type === 'iterative' && !selectedWeekDays?.length)
            }
            className="mt-3 flex items-center justify-center gap-2"
          >
            <Continue className="h-5 w-5" />
            Continuar
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center gap-1.5"
            variant="danger"
          >
            <X className="h-5 w-5" />
            Cancelar
          </Button>
        </>
      ) : (
        <div>
          <div className="grid grid-cols-[1fr,30px,1fr]">
            <p className="font-anek-bangla text-xl text-gray-800 dark:text-gray-100">
              Membros do Izzy:
            </p>
            <div />
            <p className="font-anek-bangla text-xl text-gray-800 dark:text-gray-100">
              Membros adicionados:
            </p>
          </div>
          <div className="mt-5 grid grid-cols-[1fr,30px,1fr] gap-10">
            <div
              className={clsx(
                'flex flex-col divide-y divide-black/50 border-black/50 dark:divide-white/50 dark:border-white/50',
                {
                  'border-t': result?.length,
                },
              )}
            >
              {result &&
                result.map((member) => {
                  function handleSelectMember() {
                    setSelectedMembers((state) => {
                      if (state) {
                        if (
                          !state.some((item) => item.email === member.email)
                        ) {
                          return [...state, member]
                        }
                      }
                      return [member]
                    })
                  }

                  return (
                    <div
                      key={member.email}
                      className="flex items-center py-4 font-anek-bangla text-lg text-gray-800 dark:text-gray-100"
                    >
                      <User className="mr-4 h-10 w-10" />
                      {member.nome}
                      <button
                        type="button"
                        onClick={handleSelectMember}
                        className="ml-auto"
                      >
                        <Add className="h-5 w-5 rounded-full border" />
                      </button>
                    </div>
                  )
                })}
            </div>
            <div className="h-full w-px bg-gray-800 dark:bg-gray-100" />
            <div
              className={clsx(
                'flex flex-col divide-y divide-black/50 border-black/50 dark:divide-white/50 dark:border-white/50',
                {
                  'border-t': selectedMembers?.length,
                },
              )}
            >
              {selectedMembers?.map((member) => {
                function handleSelectMember() {
                  setSelectedMembers((state) => {
                    if (state) {
                      return state.filter((item) => item.email !== member.email)
                    }
                    return state
                  })
                }

                return (
                  <div
                    key={member.email}
                    className="flex items-center py-4 font-anek-bangla text-lg text-gray-800 dark:text-gray-100"
                  >
                    <User className="mr-4 h-10 w-10" />
                    {member.nome}
                    <button
                      type="button"
                      onClick={handleSelectMember}
                      className="ml-auto"
                    >
                      <UserMinus className="h-5 w-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-20 flex justify-center text-gray-800 dark:text-gray-100">
            Obs.: Caso nenhum membro seja selecionado, a atividade será
            atribuída a todos os usuários
          </div>
          <div className="mt-5 flex justify-center gap-8">
            <Button
              type="button"
              onClick={handlePreviousStep}
              className="flex items-center justify-center gap-1.5 px-20"
              variant="danger"
            >
              <Reverse className="h-5 w-5" />
              Voltar
            </Button>
            <Button
              type="submit"
              className="flex items-center justify-center gap-2 px-20"
            >
              <Clipboard className="h-5 w-5" />
              Criar Atividade
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
