import { api } from '../lib/axios'

interface GetMinistiredActivitiesBody {
  izzyId: string | null
  title?: string | null
  type?: string | null
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

export interface GetMinistiredActivitiesResponse {
  id: string
  titulo: string
  descricao: string
  tipo: string
  data_inicio: string
  data_final: string | null
  data_limite: string
  criador: {
    nome: string
  }
  users: {
    user: {
      nome: string
    }
  }[]
  dias_semana: {
    id: number
    dia: string
    atividade_id: string
  }[]
}

export async function getMinistiredActivities({
  izzyId,
  title,
  type,
}: GetMinistiredActivitiesBody) {
  const response = await api.get<GetMinistiredActivitiesResponse[]>(
    '/atividades',
    {
      params: {
        izzyId,
        titulo: title,
        tipo:
          type === 'unique'
            ? 'Única'
            : type === 'iterative'
              ? 'Iterativa'
              : null,
      },
    },
  )

  return response.data
}
