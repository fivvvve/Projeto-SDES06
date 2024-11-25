import { api } from '../lib/axios'

interface GenerateIzzyInviteBody {
  izzyId: string | null
}

export async function generateIzzyInvite({ izzyId }: GenerateIzzyInviteBody) {
  const response = await api.post<string>('/gerarcodigo', {
    id: izzyId,
  })

  return response.data
}
