import { api } from '../lib/axios'

interface GetIzzyActivitiesBody {
  izzyId: string | null
  title?: string | null
  type?: string | null
}

export interface GetIzzyActivitiesResponse {
  id: string
  titulo: string
  descricao: string
  tipo: string
  data_inicio: string
  data_final: string | null
  data_limite?: string
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

export async function getIzzyActivities({
  izzyId,
  title,
  type,
}: GetIzzyActivitiesBody) {
  const response = await api.get<GetIzzyActivitiesResponse[]>('/atividades', {
    params: {
      izzyId,
      titulo: title,
      tipo: type,
    },
  })

  return response.data
}
