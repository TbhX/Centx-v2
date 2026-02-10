'use client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useUserStore } from '@/store/userStore'
import AuthScreen from '@/components/auth/AuthScreen'
import MainApp from '@/components/MainApp'

export default function Home() {
  useAuth()
  const { user, isLoading } = useUserStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-400 mx-auto mb-4"></div>
          <div className="text-green-400 font-semibold animate-pulse">Loading CENTxt...</div>
        </div>
      </div>
    )
  }

  return user ? <MainApp /> : <AuthScreen />
}
