import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import { ReactNode, useEffect, useState } from 'react'
import { FaUserCircle as User } from 'react-icons/fa'
import { GoGear as Gear } from 'react-icons/go'
import { IoLogOutOutline as Logout } from 'react-icons/io5'
import { RiCalendarScheduleLine as Calendar } from 'react-icons/ri'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export interface UserProps {
  id: string
  name: string
}

export function Sidebar() {
  const [user, setUser] = useState<UserProps | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const auth = Cookies.get('auth')

    if (auth) {
      setUser(JSON.parse(auth))
    }
  }, [])

  function handleLogout() {
    Cookies.remove('auth')
    navigate('/sign-in')
  }

  return (
    <aside className="flex w-full max-w-xs flex-col divide-y divide-gray-800 p-5 font-actor dark:divide-gray-100">
      <div className="mx-auto">
        <img
          className="w-32 select-none dark:hidden"
          src="/logo.png"
          alt="Izzy"
        />
        <img
          className="hidden w-32 select-none dark:block"
          src="/dark-logo.png"
          alt="Izzy"
        />
      </div>
      <DropdownMenu>
        <div className="mt-6 flex gap-2 py-3 text-lg text-gray-800 dark:text-gray-100">
          <div className="flex items-center gap-2 rounded-full px-3">
            <DropdownMenuTrigger>
              <User className="h-10 w-10" />
            </DropdownMenuTrigger>
            {user && user.name}
          </div>
          <DropdownMenuPortal>
            <DropdownMenuContent
              align="start"
              sideOffset={5}
              className="divide-y divide-dotted divide-gray-100 rounded-[10px] bg-gray-550 p-1 text-gray-100 outline-none dark:divide-gray-800 dark:bg-gray-75 dark:text-gray-800"
            >
              <DropdownMenuItem className="flex cursor-pointer items-center gap-1.5 px-3 py-2 outline-none hover:rounded-t-lg hover:bg-gradient-to-l hover:from-cyan-500 hover:to-cyan-300 hover:text-gray-100">
                <Gear className="h-5 w-5" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-1.5 px-3 py-2 outline-none hover:rounded-b-lg hover:bg-gradient-to-l hover:from-cyan-500 hover:to-cyan-300 hover:text-gray-100"
              >
                <Logout className="h-5 w-5" /> Sair
              </DropdownMenuItem>
              <DropdownMenuArrow className="fill-gray-550 dark:fill-gray-75" />
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </div>
      </DropdownMenu>
      <nav className="flex flex-col gap-3 py-6">
        <NavItem path="/activities">
          <Calendar className="h-6 w-6" />
          Minhas atividades
        </NavItem>
        <NavItem path="/izzys">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="fill-current"
          >
            <path d="M13.8025 23.9991V14.3345C13.8025 13.3361 12.9941 12.5241 12 12.5241C11.0059 12.5241 10.1975 13.3361 10.1975 14.3345V23.9991L9.37469 23.8144C6.75479 23.227 4.37642 21.7443 2.67578 19.6388C0.949906 17.5026 0 14.8079 0 12.0525C0 5.40665 5.3831 0 12 0C18.6169 0 24 5.40665 24 12.0525C24 14.8088 23.0501 17.5026 21.3242 19.6388C19.6245 21.7443 17.2452 23.227 14.6253 23.8144L13.8025 23.9991ZM12 1.35777C6.12843 1.35777 1.35186 6.15524 1.35186 12.0525C1.35186 16.7323 4.45573 20.8989 8.84566 22.2693V14.3354C8.84566 12.5884 10.2606 11.1672 12 11.1672C13.7394 11.1672 15.1543 12.5884 15.1543 14.3354V22.2693C19.5434 20.8989 22.6481 16.7323 22.6481 12.0525C22.6472 6.15524 17.8707 1.35777 12 1.35777ZM12 10.3544C11.5791 10.3544 11.1826 10.1896 10.8852 9.89093L10.0903 9.09256C9.3098 8.30776 9.07277 7.17357 9.47112 6.13171C9.86046 5.11609 10.7671 4.45169 11.8378 4.39738C11.9459 4.39195 12.0541 4.39195 12.1604 4.39738C13.232 4.45169 14.1386 5.11609 14.528 6.13171C14.9272 7.17357 14.6902 8.30776 13.9088 9.09256L13.1139 9.89093C12.8174 10.1896 12.4209 10.3544 12 10.3544ZM12 5.75062C11.9685 5.75062 11.9369 5.75153 11.9063 5.75334C11.3691 5.7805 10.9302 6.10455 10.7329 6.6196C10.5724 7.03779 10.5706 7.65513 11.0456 8.13216L11.8405 8.93053C11.9279 9.01833 12.0712 9.01924 12.1595 8.93053L12.9544 8.13216C13.4294 7.65513 13.4276 7.03779 13.2671 6.6196C13.0698 6.10455 12.6309 5.7805 12.0937 5.75334C12.0622 5.75153 12.0315 5.75062 12 5.75062Z" />
          </svg>
          Meus izzys
        </NavItem>
      </nav>
    </aside>
  )
}

interface NavItemProps {
  path: string
  children: ReactNode
}

function NavItem({ path, children }: NavItemProps) {
  const { pathname } = useLocation()

  return (
    <Link to={path}>
      <div
        className={clsx(
          'flex items-center gap-2.5 rounded-full px-6 py-2 text-gray-800 dark:text-gray-100',
          {
            'border border-cyan-300 bg-gradient-to-r from-cyan-500 to-cyan-300 !text-gray-100':
              pathname.includes(path),
          },
        )}
      >
        {children}
      </div>
    </Link>
  )
}
