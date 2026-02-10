'use client'
import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useUserStore } from '@/store/userStore'
import { listenToNotifications } from '@/lib/firebase/services'
import PacksModal from '../wallet/PacksModal'
import Notifications from './Notifications'
import Search from './Search'

export default function Header({ onUserSelect }: { onUserSelect?: (userId: string) => void }) {
  const { user } = useUserStore()
  const [showPacks, setShowPacks] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToNotifications(user.uid, (notifs) => {
      setUnreadCount(notifs.filter(n => !n.read).length)
    })
    return () => unsubscribe()
  }, [user])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer" onClick={() => window.location.reload()}>
            CENTxt
          </h1>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowSearch(true)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white px-3 py-2 rounded-full text-sm transition-all" title="Search">
              🔍
            </button>

            <button onClick={() => setShowNotifs(true)} className="relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white px-3 py-2 rounded-full text-sm transition-all" title="Notifications">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-xs">❤️</div>
              <span className="font-semibold text-green-400">{user?.walletBalance || 0}</span>
            </div>

            <button onClick={() => setShowPacks(true)} className="bg-green-400 hover:bg-green-500 text-black font-bold px-4 py-2 rounded-full text-sm transition-all">
              +
            </button>

            <button onClick={() => signOut(auth)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white px-4 py-2 rounded-full text-sm transition-all">
              ↗
            </button>
          </div>
        </div>
      </header>

      {showPacks && <PacksModal onClose={() => setShowPacks(false)} />}
      {showNotifs && <Notifications onClose={() => setShowNotifs(false)} />}
      {showSearch && <Search onClose={() => setShowSearch(false)} onUserSelect={(userId) => onUserSelect?.(userId)} />}
    </>
  )
}
