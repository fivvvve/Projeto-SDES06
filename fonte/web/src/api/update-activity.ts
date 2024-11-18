/* eslint-disable camelcase */
import { api } from '../lib/axios'

interface UpdateActivityBody {
  activityId: string
  userId: string | null
  title: string
  description: string
  data_limite?: string | null
  data_final?: string | null
}

export async function updateActivity({
  activityId,
  userId,
  title,
  description,
  data_limite,
  data_final,
}: UpdateActivityBody) {
  const response = await api.patch('/atividade', {
    atividadeId: activityId,
    userId,
    titulo: title,
    descricao: description,
    data_limite,
    data_final,
  })

  return response.data
}
