import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { getUser, listenToUser } from '@/lib/firebase/services'
import { useUserStore } from '@/store/userStore'

export const useAuth = () => {
  const { setUser, setLoading } = useUserStore()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUser(firebaseUser.uid)
        if (userData) {
          setUser(userData)
          const unsubscribeUser = listenToUser(firebaseUser.uid, (updatedUser) => {
            if (updatedUser) setUser(updatedUser)
          })
          return () => unsubscribeUser()
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribeAuth()
  }, [setUser, setLoading])
}
