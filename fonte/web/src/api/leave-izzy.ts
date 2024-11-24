import { api } from '../lib/axios'

interface LeaveIzzyBody {
  izzyId: string | null
  userId: string | null
}

export async function leaveIzzy({ izzyId, userId }: LeaveIzzyBody) {
  const response = await api.post<string>('/izzy/sair', {
    id: izzyId,
    userId,
  })

  return response.data
}
