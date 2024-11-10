import { api } from '../lib/axios'

interface GetUserActivitiesBody {
  userId: string | null
  izzyId?: string | null
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

export async function getUserActivities({
  userId,
  izzyId,
}: GetUserActivitiesBody) {
  const response = await api.get<GetUserAcitivitiesResponse>(
    '/atividades/user',
    {
      params: {
        userId,
        izzyId,
      },
    },
  )

  return response.data
}
