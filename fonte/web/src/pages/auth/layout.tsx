import { Outlet } from 'react-router-dom'

export function AuthLayout() {
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
