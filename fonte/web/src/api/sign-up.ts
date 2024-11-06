import { sha256 } from 'js-sha256'

import { env } from '../env'
import { api } from '../lib/axios'

interface SignUpBody {
  name: string
  email: string
  password: string
}

export async function signUp({ name, email, password }: SignUpBody) {
  const hash = sha256.hmac(env.VITE_SECRET_KEY, password)

  const response = await api.post<string>('/user/create', {
    nome: name,
    email,
    senha: hash,
  })

  return response.data
}
