import Cookies from 'js-cookie'
import { create } from 'zustand'

import { GetUserResponse } from '../api/get-user'
import { api } from '../lib/axios'

export interface User {
  id: string
  name: string
  email: string
}

interface UserStoreProps {
  user: User | null
  isAuthenticated: boolean
  fetchUser: () => void
  setCookie: (data: User) => void
  removeCookie: () => void
}

export const userStore = create<UserStoreProps>((set) => {
  return {
    user: null,
    isAuthenticated: false,

    fetchUser: async () => {
      set({ isAuthenticated: false })
      const auth = Cookies.get('auth')

      const cookie = auth ? JSON.parse(auth) : { id: '' }

      await api
        .post<GetUserResponse>('/user/data', {
          id: cookie.id,
        })
        .then((response) => {
          set({
            user: {
              id: cookie.id,
              name: response.data.nome,
              email: response.data.email,
            },
            isAuthenticated: true,
          })
        })
        .catch(() => {
          set({
            user: null,
            isAuthenticated: true,
          })
        })
    },

    setCookie: (data: User) => {
      Cookies.set('auth', JSON.stringify(data), {
        expires: 30,
      })
    },

    removeCookie: () => {
      Cookies.remove('auth')
      set({ user: null, isAuthenticated: false })
    },
  }
})
