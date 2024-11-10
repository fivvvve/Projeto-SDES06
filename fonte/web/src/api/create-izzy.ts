import { api } from '../lib/axios'

interface CreateIzzyBody {
  name: string
  description?: string
  responsableId: string
}

export async function createIzzy({
  name,
  description,
  responsableId,
}: CreateIzzyBody) {
  const response = await api.post<string>('/izzy/create', {
    nome: name,
    descricao: description,
    responsavelId: responsableId,
  })

  return response.data
}
