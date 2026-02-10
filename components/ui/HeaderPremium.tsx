'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { listenToNotifications } from '@/lib/firebase/services'
import { motion, AnimatePresence } from 'framer-motion'

export default function HeaderPremium({ onUserSelect }: { onUserSelect?: (userId: string) => void }) {
  const { user } = useUserStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showWallet, setShowWallet] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToNotifications(user.uid, (notifs) => {
      setUnreadCount(notifs.filter(n => !n.read).length)
    })
    return () => unsubscribe()
  }, [user])

  const balance = user?.walletBalance || 0
  const earnings = user?.earningsBalance || 0

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl border-b border-white/10" />
      
      {/* Gradient Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cosmic-primary to-transparent opacity-50" />

      <div className="relative max-w-screen-xl mx-auto">
        {/* Main Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo avec animation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-cosmic blur-lg opacity-50 animate-pulse" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-cosmic flex items-center justify-center">
                <span className="text-black font-black text-xl">¢</span>
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="bg-gradient-cosmic bg-clip-text text-transparent">
                CENT
              </span>
              <span className="text-white">xt</span>
            </h1>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>

        {/* Wallet Display */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3">
            {/* Balance Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex-1 relative overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-cosmic opacity-10" />
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-cosmic flex items-center justify-center shadow-cosmic">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-white/50 font-medium">Balance</div>
                      <div className="text-2xl font-bold text-white">{balance}</div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-xl bg-gradient-cosmic flex items-center justify-center shadow-cosmic font-bold text-black text-xl"
                  >
                    +
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Earnings Card (if any) */}
            {earnings > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-money opacity-20" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-yellow-500/30 p-4">
                  <div className="text-xs text-yellow-500/70 font-medium mb-1">Earnings</div>
                  <div className="text-xl font-bold text-yellow-500">{earnings.toFixed(0)}</div>
                  <div className="text-xs text-white/30 mt-1">{(earnings / 100).toFixed(2)}€</div>
                </div>
              </motion.div>
            )}

            {/* Emoji Shop */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <span className="text-2xl">✨</span>
            </motion.button>
          </div>
        </div>

        {/* Stories */}
        <div className="px-6 pb-4">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {['Toi', 'User1', 'User2', 'User3', 'User4'].map((name, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div className={`relative ${i > 0 ? 'p-[2px] rounded-full' : ''}`} style={i > 0 ? { background: 'linear-gradient(135deg, #00FF88, #00D4FF, #B84FFF)' } : {}}>
                  <div className="w-16 h-16 rounded-full bg-gradient-cosmic flex items-center justify-center text-xl font-bold relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="relative z-10 text-black">{name[0]}</span>
                  </div>
                  {i === 0 && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-cosmic rounded-full border-2 border-black flex items-center justify-center">
                      <span className="text-black text-xs font-black">+</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-white/50 font-medium">{name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
