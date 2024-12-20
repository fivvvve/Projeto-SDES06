import { TbLogin2 as Enter } from 'react-icons/tb'
import { Link } from 'react-router-dom'

import { Button } from '../../components/button'

export function Izzys() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="relative">
        <img
          className="relative z-10 mx-auto"
          src="/logo-vertical.png"
          alt="Izzy"
        />
        <p className="relative mt-6 text-center text-2xl text-gray-800/75 dark:text-gray-100/75">
          Abra um izzy para ver suas atividades
        </p>
        <Link to="/izzys/join">
          <Button className="mt-6 flex w-full items-center justify-center gap-2">
            <Enter className="h-6 w-6" />
            Entrar em um Izzy
          </Button>
        </Link>
        <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 shadow-[0px_0px_250px_300px_rgba(0,0,0,0.25)]" />
      </div>
    </div>
  )
}
