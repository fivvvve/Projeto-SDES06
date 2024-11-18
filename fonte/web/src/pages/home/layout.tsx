import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { userStore } from '../../store/user'
import { Sidebar } from './sidebar'

export function HomeLayout() {
  const navigate = useNavigate()

  const { user, fetchUser, isAuthenticated } = userStore((store) => {
    return {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      fetchUser: store.fetchUser,
    }
  })

  useEffect(() => {
    if (isAuthenticated) {
      if (!user) {
        navigate('/sign-in')
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!user) {
      fetchUser()
    }
  }, [])

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-800">
      <Sidebar />
      <Outlet />
    </div>
  )
}
