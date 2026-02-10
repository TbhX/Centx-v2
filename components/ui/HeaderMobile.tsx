'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { listenToNotifications } from '@/lib/firebase/services'
import Stories from '../stories/Stories'
import PacksModal from '../wallet/PacksModal'
import StripeCheckout from '../wallet/StripeCheckout'
import EarningsDashboard from '../wallet/EarningsDashboard'
import EmojiShop from '../wallet/EmojiShop'
import Notifications from './Notifications'
import Search from './Search'

export default function HeaderMobile({ onUserSelect }: { onUserSelect?: (userId: string) => void }) {
  const { user } = useUserStore()
  const [showStripe, setShowStripe] = useState(false)
  const [showEarnings, setShowEarnings] = useState(false)
  const [showEmojiShop, setShowEmojiShop] = useState(false)
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

  const earningsBalance = user?.earningsBalance || 0
  const hasEarnings = earningsBalance > 0

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-2xl border-b border-zinc-800">
        {/* Main Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Logo */}
          <h1 className="text-2xl font-black bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            CENTxt
          </h1>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button onClick={() => setShowSearch(true)} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-95">
              <span className="text-lg">🔍</span>
            </button>

            {/* Notifications */}
            <button onClick={() => setShowNotifs(true)} className="relative w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-95">
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stories Row */}
        <Stories />

        {/* Wallet Bar */}
        <div className="px-4 pb-3 flex items-center gap-2">
          {/* Wallet Balance */}
          <div className="flex-1 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-lg">❤️</span>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400">Balance</div>
              <div className="font-bold text-green-400">{user?.walletBalance || 0}</div>
            </div>
            <button onClick={() => setShowStripe(true)} className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center font-bold text-black hover:bg-green-500 transition-all active:scale-95">
              +
            </button>
          </div>

          {/* Earnings (if any) */}
          {hasEarnings && (
            <button onClick={() => setShowEarnings(true)} className="bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl px-4 py-2.5 active:scale-95 transition-all">
              <div className="text-xs text-black/70 font-semibold">Earnings</div>
              <div className="font-bold text-black">{earningsBalance.toFixed(0)} ❤️</div>
            </button>
          )}

          {/* Emoji Shop */}
          <button onClick={() => setShowEmojiShop(true)} className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center hover:scale-105 transition-all active:scale-95">
            <span className="text-2xl">✨</span>
          </button>
        </div>
      </div>

      {showStripe && <StripeCheckout onClose={() => setShowStripe(false)} />}
      {showEarnings && <EarningsDashboard onClose={() => setShowEarnings(false)} />}
      {showEmojiShop && <EmojiShop onClose={() => setShowEmojiShop(false)} />}
      {showNotifs && <Notifications onClose={() => setShowNotifs(false)} />}
      {showSearch && <Search onClose={() => setShowSearch(false)} onUserSelect={(userId) => onUserSelect?.(userId)} />}
    </>
  )
}
