'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { listenToNotifications } from '@/lib/firebase/services'

export default function HeaderMobile({ onUserSelect }: { onUserSelect?: (userId: string) => void }) {
  const { user } = useUserStore()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToNotifications(user.uid, (notifs) => {
      setUnreadCount(notifs.filter(n => !n.read).length)
    })
    return () => unsubscribe()
  }, [user])

  const earningsBalance = user?.earningsBalance || 0

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-zinc-900 border-b border-zinc-800">
      {/* Main Header Bar */}
      <div className="px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          CENTxt
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search Icon */}
          <button className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
            🔍
          </button>

          {/* Notifications */}
          <button className="relative w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Wallet Bar */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {/* Balance */}
        <div className="flex-1 bg-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
            ❤️
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400">Balance</div>
            <div className="font-bold text-green-400">{user?.walletBalance || 0}</div>
          </div>
          <button className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-black font-bold">
            +
          </button>
        </div>

        {/* Earnings */}
        {earningsBalance > 0 && (
          <div className="bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl px-4 py-3">
            <div className="text-xs text-black/70 font-semibold">Earnings</div>
            <div className="font-bold text-black">{earningsBalance.toFixed(0)} ❤️</div>
          </div>
        )}

        {/* Emoji Shop */}
        <button className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
          ✨
        </button>
      </div>

      {/* Stories placeholder */}
      <div className="px-4 pb-3">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-lg font-bold">
                {i === 1 ? 'T' : 'U'}
              </div>
              <span className="text-xs text-gray-400">{i === 1 ? 'Toi' : `User${i}`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
