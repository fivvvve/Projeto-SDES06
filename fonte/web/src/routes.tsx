import { createBrowserRouter } from 'react-router-dom'

import { Activities } from './pages/activities/page'
import { EmailVerify } from './pages/auth/email-verify'
import { AuthLayout } from './pages/auth/layout'
import { SignIn } from './pages/auth/sign-in'
import { SignUp } from './pages/auth/sign-up'
import { HomeLayout } from './pages/home/layout'
import { IzzyDetails } from './pages/izzys/[slug]/details'
import { IzzyLayout } from './pages/izzys/[slug]/layout'
import { Izzy } from './pages/izzys/[slug]/page'
import { IzzyCreate } from './pages/izzys/create'
import { Izzys } from './pages/izzys/page'
import { ChangePassword } from './pages/settings/change-password'
import { ExcludeAccount } from './pages/settings/exclude-account'
import { SettingsLayout } from './pages/settings/layout'
import { Settings } from './pages/settings/page'

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
      },
      {
        path: '/izzys/create',
        element: <IzzyCreate />,
      },
      {
        path: '/izzys/:id',
        element: <IzzyLayout />,
        children: [
          {
            path: '/izzys/:id',
            element: <Izzy />,
          },
          {
            path: '/izzys/:id/details',
            element: <IzzyDetails />,
          },
        ],
      },
      {
        path: '/settings',
        element: <SettingsLayout />,
        children: [
          {
            path: '/settings',
            element: <Settings />,
          },
          {
            path: '/settings/exclude-account',
            element: <ExcludeAccount />,
          },
          {
            path: '/settings/change-password',
            element: <ChangePassword />,
          },
        ],
      },
    ],
  },
  {
    path: '/email-verify',
    element: <EmailVerify />,
  },
])
