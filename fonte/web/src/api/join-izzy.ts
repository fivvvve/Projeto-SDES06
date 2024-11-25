import { api } from '../lib/axios'

interface JoinIzzyBody {
  code: string | null
  password: string | null
  userId: string | null
}

export async function joinIzzy({ code, password, userId }: JoinIzzyBody) {
  const response = await api.post<string>('/izzy/entrar', {
    codigo: code,
    senha: password,
    userId,
  })

  return response.data
}
