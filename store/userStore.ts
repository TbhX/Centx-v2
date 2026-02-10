import { create } from 'zustand'

interface UserStore {
  user: any | null
  isLoading: boolean
  setUser: (user: any | null) => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
