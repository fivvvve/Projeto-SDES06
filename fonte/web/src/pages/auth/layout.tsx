import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { userStore } from '../../store/user'

export function AuthLayout() {
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
      if (user) {
        navigate('/activities')
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!user) {
      fetchUser()
    }
  }, [])

  return (
    <div className="grid min-h-screen w-full grid-cols-2">
      <aside className="flex items-center justify-center bg-gradient-to-br from-[#11457d] to-[#196479]">
        <img
          className="select-none"
          src="/izzy.png"
          alt="I com pingo em forma de gota"
        />
      </aside>
      <Outlet />
    </div>
  )
}
