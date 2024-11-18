import { api } from '../lib/axios'

interface DeleteActivityBody {
  activityId: string | null
}

export async function deleteActivity({ activityId }: DeleteActivityBody) {
  const response = await api.delete('/atividade', {
    params: {
      id: activityId,
    },
  })

  return response.data
}
