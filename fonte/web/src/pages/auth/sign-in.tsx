import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { IoCheckmarkDoneCircleOutline } from 'react-icons/io5'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import z from 'zod'

import { signIn } from '../../api/sign-in'
import { Button } from '../../components/button'
import { Input } from '../../components/input'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type SignInSchema = z.infer<typeof signInSchema>

export function SignIn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const emailVerified = searchParams.get('email-verified') === 'true'

  const { control, handleSubmit } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  })

  const {
    mutateAsync: signInFn,
    error: err,
    isError,
  } = useMutation({
    mutationKey: ['sign-in'],
    mutationFn: signIn,
    onSuccess: (data) => {
      Cookies.set('auth', JSON.stringify(data), {
        expires: 30,
      })
      navigate('/activities')
    },
  })

  const error = err as AxiosError<string>

  async function handleSignIn(data: SignInSchema) {
    const { email, password } = data

    signInFn({
      email,
      password,
    })
  }

  useEffect(() => {
    const auth = Cookies.get('auth')

    if (auth) {
      navigate('/')
    }
  }, [])

  return (
    <div className="bg-gray-100 dark:bg-gray-800">
      <div
        className={clsx('flex h-full flex-col items-center py-8', {
          'justify-between': !emailVerified,
        })}
      >
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
        {emailVerified && (
          <div className="my-24 flex items-center gap-5">
            <IoCheckmarkDoneCircleOutline className="h-12 w-12 text-cyan-500 dark:text-cyan-300" />
            <div className="flex flex-col text-gray-700 dark:text-gray-100">
              <h2 className="-ml-1 text-4xl font-semibold">Tudo certo!</h2>
              <p>Sua conta foi confirmada</p>
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit(handleSignIn)}
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <h2 className="text-xl/10 text-gray-700 dark:text-gray-50">
            {emailVerified ? (
              <>Faça login abaixo para continuar</>
            ) : (
              <>
                Seja bem vindo ao{' '}
                <span className="font-medium text-cyan-600 dark:text-cyan-300">
                  izzy
                </span>
              </>
            )}
          </h2>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} type="email" placeholder="Email" />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input {...field} type="password" placeholder="Senha" />
            )}
          />
          {isError && <p className="text-red-500">{error.response?.data}</p>}
          <Button>Entrar</Button>
          <p className="text-center text-gray-700 dark:text-gray-50">
            Não tem uma conta?{' '}
            <Link
              to="/sign-up"
              className="rounded-lg font-medium text-cyan-600 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-600/30 dark:text-cyan-300 dark:focus:ring-cyan-300/70"
            >
              Cadastre-se
            </Link>
          </p>
        </form>
        <div />
      </div>
    </div>
  )
}
