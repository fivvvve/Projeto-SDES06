import { sha256 } from 'js-sha256'

import { env } from '../env'
import { api } from '../lib/axios'

interface DeleteUserBody {
  userId: string | null
  password: string | null
}

export async function deleteUser({ userId, password }: DeleteUserBody) {
  const hash = sha256.hmac(env.VITE_SECRET_KEY, password || '')

  const response = await api.delete('/user', {
    params: {
      id: userId,
      senha: hash,
    },
  })

  return response.data
}
