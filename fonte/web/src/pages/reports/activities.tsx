import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

import { getActivitiesReport } from '../../api/get-activities-report'
import { userStore } from '../../store/user'

export function ActivitiesReport() {
  const { user } = userStore((store) => {
    return {
      user: store.user,
    }
  })

  const [searchParams] = useSearchParams()

  const initialDate = searchParams.get('initialDate')
  const finalDate = searchParams.get('finalDate')

  const { data: result, isLoading } = useQuery({
    queryKey: ['get-activities-report', initialDate, finalDate],
    queryFn: () =>
      getActivitiesReport({
        userId: user?.id || null,
        initialDate,
        finalDate,
        izzys: [],
      }),
  })

  return (
    <div className="mx-auto flex w-full max-w-[1170px] flex-col p-12">
      <header className="flex items-center justify-center">
        <h1 className="text-center font-anton text-4xl text-gray-600 dark:text-gray-100">
          Relatório de Atividades
        </h1>
      </header>
      {isLoading || !result?.length ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="relative">
            <img
              className="relative z-10 mx-auto"
              src="/logo-vertical.png"
              alt="Izzy"
            />
            <p className="relative mt-6 text-center text-2xl text-gray-800/75 dark:text-gray-100/75">
              Insira os dados para gerar o relatório
            </p>
            <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 shadow-[0px_0px_250px_300px_rgba(0,0,0,0.25)]" />
          </div>
        </div>
      ) : (
        <table className="mt-16 font-actor">
          <thead className="border-b border-white">
            <td className="py-5 text-center text-lg text-gray-100">Izzy</td>
            <td className="py-5 text-center text-lg text-gray-100">
              Concluídas dentro do prazo
            </td>
            <td className="py-5 text-center text-lg text-gray-100">
              Concluídas com atraso
            </td>
            <td className="py-5 text-center text-lg text-gray-100">
              Atividades atrasadas
            </td>
          </thead>
          {result?.map((item) => (
            <tr
              key={item.izzy.id}
              className="border-b border-dotted border-white/50 text-center text-lg text-gray-100"
            >
              <td className="py-4">{item.izzy.name}</td>
              <td className="py-4">{item.data.countAtivNoPrazo}</td>
              <td className="py-4">{item.data.countAtivComAtraso}</td>
              <td className="py-4">{item.data.countQuantAtras}</td>
            </tr>
          ))}
        </table>
      )}
    </div>
  )
}
