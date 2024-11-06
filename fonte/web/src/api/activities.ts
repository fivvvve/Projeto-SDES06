import { api } from '../lib/axios'

interface GetActivitiesBody {
  userId: string
}

export async function getActivities({ userId }: GetActivitiesBody) {
  const response = await api.get('/atividades', {
    params: {
      userId,
    },
  })

  return response.data
}
