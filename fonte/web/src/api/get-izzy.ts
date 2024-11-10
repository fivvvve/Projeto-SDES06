import { api } from '../lib/axios'

interface GetIzzyBody {
  izzyId: string | null
  userId: string | null
}

export interface GetIzzyResponse {
  id: string
  nome: string
  descricao: string
  codigo_convite: string
  senha: string
  users: {
    user_id: string
    izzy_id: string
    saiu: boolean
    responsavel: boolean
    user: {
      nome: string
      email: string
    }
  }[]
}

export async function getIzzy({ izzyId, userId }: GetIzzyBody) {
  const response = await api.post<GetIzzyResponse>('/izzyinfo', {
    id: izzyId,
    userId,
  })

  return response.data
}
