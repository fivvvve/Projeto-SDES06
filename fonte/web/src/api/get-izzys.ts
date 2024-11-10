import { api } from '../lib/axios'

interface GetIzzysBody {
  name: string | null
  onlyResponsable: string | undefined | null
  userId: string | null
}

export interface GetIzzysResponse {
  id: string
  nome: string
  descricao: string
}

export async function getIzzys({
  name,
  onlyResponsable,
  userId,
}: GetIzzysBody) {
  const response = await api.get<GetIzzysResponse[]>('/izzys', {
    params: {
      nome: name,
      responsavel: onlyResponsable,
      userId,
    },
  })

  return response.data
}
