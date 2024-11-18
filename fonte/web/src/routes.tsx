import { createBrowserRouter } from 'react-router-dom'

import { Activities } from './pages/activities/page'
import { EmailVerify } from './pages/auth/email-verify'
import { AuthLayout } from './pages/auth/layout'
import { SignIn } from './pages/auth/sign-in'
import { SignUp } from './pages/auth/sign-up'
import { HomeLayout } from './pages/home/layout'
import { Izzy } from './pages/izzys/[slug]/activities'
import { IzzyDetails } from './pages/izzys/[slug]/details'
import { IzzyLayout } from './pages/izzys/[slug]/layout'
import { IzzyMinistered } from './pages/izzys/[slug]/ministered'
import { IzzyCreate } from './pages/izzys/create'
import { NewActivity } from './pages/izzys/new-activity'
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
            path: '/izzys/:id/new-activity',
            element: <NewActivity />,
          },
          {
            path: '/izzys/:id/activities',
            element: <Izzy />,
          },
          {
            path: '/izzys/:id/ministered',
            element: <IzzyMinistered />,
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
