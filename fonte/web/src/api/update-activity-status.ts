import { api } from '../lib/axios'

interface UpdateActivityStatusBody {
  taskId: number
  status: 'Pendente' | 'Concluída'
}

export async function updateActivityStatus({
  taskId,
  status,
}: UpdateActivityStatusBody) {
  const response = await api.post<string>('/atividade/status', {
    id: taskId,
    status,
  })

  return response.data
}
