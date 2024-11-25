import { api } from '../lib/axios'

interface UpdateIzzyBody {
  id: string | null
  name: string | null
  description: string | null
  responsableId: string | null
}

export async function updateIzzy({
  id,
  name,
  description,
  responsableId,
}: UpdateIzzyBody) {
  const response = await api.patch('/izzy', {
    id,
    nome: name,
    descricao: description,
    responsavelId: responsableId,
  })

  return response.data
}
