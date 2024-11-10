import { api } from '../lib/axios'

interface GetUserBody {
  userId: string | null
}

export interface GetUserResponse {
  nome: string
  email: string
}

export async function getUser({ userId }: GetUserBody) {
  const response = await api.post<GetUserResponse>('/user/data', {
    id: userId,
  })

  return response.data
}
