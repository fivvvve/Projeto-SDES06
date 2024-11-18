import { api } from '../lib/axios'

interface GetIzzyMembersBody {
  izzyId: string | null
  name?: string | null
}

export interface GetIzzyMembersResponse {
  responsavel: boolean
  saiu: boolean
  nome: string
  email: string
}

export async function getIzzyMembers({ izzyId, name }: GetIzzyMembersBody) {
  const response = await api.get<GetIzzyMembersResponse[]>('/izzy/membros', {
    params: {
      id: izzyId,
      nome: name,
    },
  })

  return response.data
}
