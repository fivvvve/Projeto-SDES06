import { sha256 } from 'js-sha256'

import { env } from '../env'
import { api } from '../lib/axios'

interface UpdateUserBody {
  id: string
  nome: string
  senha?: string
  novasenha?: string
}

export async function updateUser({
  id,
  nome,
  senha,
  novasenha,
}: UpdateUserBody) {
  if (senha && novasenha) {
    const hashPassword = sha256.hmac(env.VITE_SECRET_KEY, senha)
    const hashNewPassword = sha256.hmac(env.VITE_SECRET_KEY, novasenha)

    const response = await api.patch('/user', {
      id,
      nome,
      senha: hashPassword,
      novasenha: hashNewPassword,
    })

    return response.data
  }

  const response = await api.patch('/user', {
    id,
    nome,
  })

  return response.data
}
