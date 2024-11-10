import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import z from 'zod'

import { signUp } from '../../api/sign-up'
import { Input } from '../../components/input'

const signUpSchema = z
  .object({
    name: z
      .string({ required_error: 'Nome é obrigatório' })
      .min(2, 'Nome deve conter no mínimo 2 caracteres'),
    email: z
      .string({ required_error: 'Email é obrigatório' })
      .email('Email inválido'),
    password: z
      .string({ required_error: 'Senha é obrigatório' })
      .min(8, 'Senha deve conter no mínimo 8 caracteres'),
    confirmPassword: z
      .string({ required_error: 'Confirmação da senha é obrigatório' })
      .min(8, 'Senha deve conter no mínimo 8 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas são diferentes',
  })

type SignUpSchema = z.infer<typeof signUpSchema>

export function SignUp() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  })

  const {
    data: result,
    error: err,
    isError,
    isSuccess,
    mutateAsync: signUpFn,
  } = useMutation({
    mutationKey: ['sign-up'],
    mutationFn: signUp,
  })

  async function handleSignUp(data: SignUpSchema) {
    const { name, email, password } = data

    signUpFn({ name, email, password })
  }

  const error = err as AxiosError<string>

  return (
    <div className="bg-gray-100 dark:bg-gray-800">
      <div className="flex h-full flex-col items-center justify-between py-8">
        <header className="flex flex-col items-center justify-center">
          {/* FIX! the code above makes client load two images unucessary */}
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
        <form
          onSubmit={handleSubmit(handleSignUp)}
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <h2 className="text-xl/10 text-gray-700 dark:text-gray-50">
            Crie uma nova conta no{' '}
            <span className="font-medium text-cyan-600 dark:text-cyan-300">
              izzy
            </span>
          </h2>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Nome" />}
          />
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
              <Input {...field} type="password" placeholder="Senha" minLength={8} />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input {...field} type="password" placeholder="Confirmar senha" minLength={8} />
            )}
          />
          {Object.entries(errors).map(([key, value]) => {
            return (
              <p key={key} className="text-red-500">
                {value.message}
              </p>
            )
          })}
          <p
            className={
              isError ? 'text-red-500' : isSuccess ? 'text-green-500' : ''
            }
          >
            {isSuccess && result}
            {isError && error.response?.data}
          </p>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-300 px-5 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-600/30 dark:focus:ring-cyan-300/30"
          >
            Cadastrar
          </button>
          <p className="text-center text-gray-700 dark:text-gray-50">
            Já possui uma conta? Faça{' '}
            <Link
              to="/sign-in"
              className="rounded-lg font-medium text-cyan-600 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-600/30 dark:text-cyan-300 dark:focus:ring-cyan-300/70"
            >
              Login
            </Link>
          </p>
        </form>
        <div />
      </div>
    </div>
  )
}
