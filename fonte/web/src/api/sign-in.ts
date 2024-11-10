import { sha256 } from 'js-sha256'

import { env } from '../env'
import { api } from '../lib/axios'
import { User } from '../store/user'

interface SignInBody {
  email: string
  password: string
}

export async function signIn({ email, password }: SignInBody) {
  const hash = sha256.hmac(env.VITE_SECRET_KEY, password)

  const response = await api.post<User>('/user/login', {
    email,
    senha: hash,
  })

  return response.data
}
