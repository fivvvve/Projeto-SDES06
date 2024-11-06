import { api } from '../lib/axios'

interface GetUserActivitiesBody {
  userId: string
}

export interface Task {
  titulo: string
  tipo: string
  izzy: string
  criador: string
  data_inicial: string
  descricao: string | null
  status: string
  id: number
  data_limite: string
  editable: boolean
}

export interface GetUserAcitivitiesResponse {
  pendentes: boolean
  atividades: Task[]
}

export async function getUserActivities({ userId }: GetUserActivitiesBody) {
  const response = await api.get<GetUserAcitivitiesResponse>(
    '/atividades/user',
    {
      params: {
        userId,
      },
    },
  )

  return response.data
}
