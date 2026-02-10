'use client'
import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useUserStore } from '@/store/userStore'
import { listenToNotifications } from '@/lib/firebase/services'
import PacksModal from '../wallet/PacksModal'
import StripeCheckout from '../wallet/StripeCheckout'
import EarningsDashboard from '../wallet/EarningsDashboard'
import EmojiShop from '../wallet/EmojiShop'
import Notifications from './Notifications'
import Search from './Search'

export default function Header({ onUserSelect }: { onUserSelect?: (userId: string) => void }) {
  const { user } = useUserStore()
  const [showPacks, setShowPacks] = useState(false)
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
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-all" onClick={() => window.location.reload()}>
            CENTxt
          </h1>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowSearch(true)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white px-3 py-2 rounded-full text-sm transition-all hover:scale-105">
              🔍
            </button>

            <button onClick={() => setShowNotifs(true)} className="relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white px-3 py-2 rounded-full text-sm transition-all hover:scale-105">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {hasEarnings && (
              <button onClick={() => setShowEarnings(true)} className="bg-gradient-to-r from-green-400 to-cyan-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all animate-glow">
                💰 {earningsBalance.toFixed(1)}
              </button>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 flex items-center gap-2 hover:border-green-400 transition-all">
              <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-xs">❤️</div>
              <span className="font-semibold text-green-400">{user?.walletBalance || 0}</span>
            </div>

            <button onClick={() => setShowStripe(true)} className="bg-green-400 hover:bg-green-500 text-black font-bold px-4 py-2 rounded-full text-sm transition-all hover:scale-105">
              +
            </button>

            <button onClick={() => setShowEmojiShop(true)} className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold px-3 py-2 rounded-full text-sm transition-all hover:scale-105">
              ✨
            </button>

            <button onClick={() => signOut(auth)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white px-4 py-2 rounded-full text-sm transition-all hover:scale-105">
              ↗
            </button>
          </div>
        </div>
      </header>

      {showPacks && <PacksModal onClose={() => setShowPacks(false)} />}
      {showStripe && <StripeCheckout onClose={() => setShowStripe(false)} />}
      {showEarnings && <EarningsDashboard onClose={() => setShowEarnings(false)} />}
      {showEmojiShop && <EmojiShop onClose={() => setShowEmojiShop(false)} />}
      {showNotifs && <Notifications onClose={() => setShowNotifs(false)} />}
      {showSearch && <Search onClose={() => setShowSearch(false)} onUserSelect={(userId) => onUserSelect?.(userId)} />}
    </>
  )
}
