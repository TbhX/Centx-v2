'use client'
import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useUserStore } from '@/store/userStore'
import PacksModal from '../wallet/PacksModal'

export default function Header() {
  const { user } = useUserStore()
  const [showPacks, setShowPacks] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">CENTxt</h1>
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-xs">❤️</div>
              <span className="font-semibold text-green-400">{user?.walletBalance || 0}</span>
            </div>
            <button onClick={() => setShowPacks(true)} className="bg-green-400 hover:bg-green-500 text-black font-bold px-4 py-2 rounded-full text-sm">+</button>
            <button onClick={() => signOut(auth)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white px-4 py-2 rounded-full text-sm">↗</button>
          </div>
        </div>
      </header>
      {showPacks && <PacksModal onClose={() => setShowPacks(false)} />}
    </>
  )
}
