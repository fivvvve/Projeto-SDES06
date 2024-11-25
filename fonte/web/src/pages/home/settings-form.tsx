import { TbReportAnalytics as Report } from 'react-icons/tb'
import { Link } from 'react-router-dom'

import { Button } from '../../components/button'

export function SettingsForm() {
  return (
    <div className="flex flex-col gap-5 pt-5">
      <h2 className="flex items-center text-xl text-gray-800 dark:text-gray-100">
        Gerar relatórios:
      </h2>
      <Link to="/settings/reports/activities" className="w-full">
        <Button className="flex w-full items-center justify-center gap-2">
          <Report className="h-5 w-5" />
          Relatório de Atividades
        </Button>
      </Link>
      <Button className="flex items-center justify-center gap-2">
        <Report className="h-5 w-5" />
        Atividade Atrasadas
      </Button>
    </div>
  )
}
