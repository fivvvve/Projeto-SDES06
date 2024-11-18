import { api } from '../lib/axios'

interface CreateActivityBody {
  izzyId: string | null
  userId: string | null
  title: string | null
  description: string | null
  initialDate: string | null
  type: 'unique' | 'iterative' | null
  limitDate: string | null
  finalDate?: string | null
  weekDays?: string[] | null
  responsables: string[] | null
}

export async function createActivity({
  izzyId,
  userId,
  title,
  description,
  initialDate,
  type,
  limitDate,
  finalDate,
  weekDays,
  responsables,
}: CreateActivityBody) {
  const response = await api.post<string>('/atividade', {
    izzyId,
    userId,
    titulo: title,
    descricao: description,
    data_inicio: initialDate,
    tipo: type === 'unique' ? 'Única' : 'Iterativa',
    data_limite: limitDate,
    data_final: finalDate,
    dias_semana: weekDays,
    responsaveis: responsables,
  })

  return response.data
}
