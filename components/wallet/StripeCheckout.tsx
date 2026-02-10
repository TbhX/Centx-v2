'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/userStore'

const PACKS = [
  { id: 'starter', likes: 100, price: 1, popular: false },
  { id: 'basic', likes: 500, price: 5, popular: false },
  { id: 'popular', likes: 1000, price: 9, popular: true, save: '10%' },
  { id: 'premium', likes: 5000, price: 40, popular: false, save: '20%' },
]

export default function StripeCheckout({ onClose }: { onClose: () => void }) {
  const { user } = useUserStore()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (likes: number, price: number, packId: string) => {
    if (!user || loading) return
    setLoading(packId)
    try {
      alert(`🚧 Stripe integration coming soon!\n\nVous allez acheter:\n${likes} ❤️ pour ${price}€\n\nPour l'instant, profitez du mode BETA gratuit!`)
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">💳 Acheter des Likes</h2>
            <p className="text-gray-400 text-sm mt-1">1 like = 1 cent · 100 likes = 1€</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl transition-all hover:rotate-90 duration-300">×</button>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚧</div>
            <div className="flex-1">
              <div className="font-bold text-yellow-400 mb-1">Mode BETA</div>
              <div className="text-sm text-gray-300">Stripe integration en cours. Profitez des packs gratuits pendant la beta!</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PACKS.map((pack) => (
            <div key={pack.id} className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${pack.popular ? 'border-green-400 bg-green-400/10' : 'border-zinc-700 hover:border-green-400'}`}>
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-400 text-black text-xs font-bold px-4 py-1 rounded-full">
                  POPULAIRE
                </div>
              )}
              {pack.save && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  {pack.save} OFF
                </div>
              )}
              <div className="text-center mb-4">
                <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {pack.likes}
                </div>
                <div className="text-gray-400 text-sm">Likes</div>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white">{pack.price}€</div>
                <div className="text-xs text-gray-500">{(pack.price / pack.likes * 100).toFixed(2)}€ par 100 likes</div>
              </div>
              <button onClick={() => handlePurchase(pack.likes, pack.price, pack.id)} disabled={loading === pack.id} className="w-full bg-green-400 hover:bg-green-500 disabled:bg-gray-600 text-black font-bold py-3 rounded-xl transition-all">
                {loading === pack.id ? 'Traitement...' : 'Acheter'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
