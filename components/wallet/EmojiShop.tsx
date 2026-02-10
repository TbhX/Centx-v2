'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { buyEmoji } from '@/lib/firebase/services'
import { AVAILABLE_EMOJIS } from '@/types'

export default function EmojiShop({ onClose }: { onClose: () => void }) {
  const { user } = useUserStore()
  const [buying, setBuying] = useState<string | null>(null)

  const handleBuy = async (emoji: string, price: number) => {
    if (!user || buying) return
    setBuying(emoji)
    try {
      await buyEmoji(user.uid, emoji, price)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setBuying(null)
    }
  }

  const ownedEmojis = user?.ownedEmojis || []

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Emoji Shop</h2>
            <p className="text-gray-400 text-sm mt-1">React to posts with style!</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl transition-all hover:rotate-90 duration-300">×</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AVAILABLE_EMOJIS.map((item) => {
            const owned = ownedEmojis.includes(item.emoji)
            return (
              <div key={item.id} className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${owned ? 'border-green-400 bg-green-400/10' : 'border-zinc-700 hover:border-green-400'}`}>
                {owned && <div className="absolute top-2 right-2 bg-green-400 text-black text-xs font-bold px-2 py-1 rounded-lg">OWNED</div>}
                
                <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg bg-gradient-to-r ${rarityColors[item.rarity]} text-white uppercase`}>
                  {item.rarity}
                </div>

                <div className="text-6xl mb-3 text-center animate-bounce-slow">{item.emoji}</div>
                <div className="text-center mb-3">
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-sm font-semibold text-green-400">{item.price} ❤️</div>
                </div>

                {!owned && (
                  <button
                    onClick={() => handleBuy(item.emoji, item.price)}
                    disabled={buying === item.emoji || (user && user.walletBalance < item.price)}
                    className="w-full bg-green-400 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-2 rounded-xl transition-all"
                  >
                    {buying === item.emoji ? 'Buying...' : user && user.walletBalance < item.price ? 'Not enough ❤️' : 'Buy'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
