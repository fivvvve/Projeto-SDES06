import { createBrowserRouter } from 'react-router-dom'

import { SignIn } from './pages/auth/sign-in'
import { SignUp } from './pages/auth/sign-up'
import { Activities } from './pages/activities/page'
import { EmailVerify } from './pages/auth/email-verify'
import { AuthLayout } from './pages/auth/layout'
import { HomeLayout } from './pages/home/layout'
import { Izzys } from './pages/izzys/page'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/sign-in',
        element: <SignIn />,
      },
      {
        path: '/sign-up',
        element: <SignUp />,
      },
    ],
  },
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      {
        path: '/activities',
        element: <Activities />,
      },

      {
        path: '/izzys',
        element: <Izzys />,
      }
    ],
  },
  {
    path: '/email-verify',
    element: <EmailVerify />,
  },
])
