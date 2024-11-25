import { api } from '../lib/axios'

interface GetActivitiesReportBody {
  userId: string | null
  initialDate: string | null
  finalDate: string | null
  izzys?: string[] | null
}

export interface GetActivitiesReportResponse {
  izzy: {
    id: string
    name: string
  }
  data: {
    countAtivNoPrazo: number
    countAtivComAtraso: number
    countQuantAtras: number
  }
}

export async function getActivitiesReport({
  userId,
  initialDate,
  finalDate,
  izzys,
}: GetActivitiesReportBody) {
  const response = await api.post<GetActivitiesReportResponse[]>(
    '/relatorio/atividades',
    {
      id: userId,
      dataInicialParam: initialDate,
      dataFinalParam: finalDate,
      izzysId: izzys,
    },
  )

  return response.data
}
