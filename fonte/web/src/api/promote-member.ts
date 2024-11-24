import { api } from '../lib/axios'

interface PromoteMemberBody {
  izzyId: string | null
  email: string | null
  userId: string | null
}

export async function promoteMember({
  izzyId,
  email,
  userId,
}: PromoteMemberBody) {
  const response = await api.post<string>('/izzy/adicionar-responsavel', {
    izzyId,
    emailToPromote: email,
    userId,
  })

  return response.data
}
