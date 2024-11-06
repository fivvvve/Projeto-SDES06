import { Outlet } from 'react-router-dom'

import { Sidebar } from './sidebar'

export function HomeLayout() {
  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-800">
      <Sidebar />
      <Outlet />
    </div>
  )
}
