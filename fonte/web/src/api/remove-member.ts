import { api } from '../lib/axios'

interface RemoveMemberBody {
  izzyId: string | null
  email: string | null
  userId: string | null
}

export async function removeMember({
  izzyId,
  email,
  userId,
}: RemoveMemberBody) {
  const response = await api.post<string>('/izzy/remover-membro', {
    izzyId,
    userEmailtoRemove: email,
    userId,
  })

  return response.data
}
