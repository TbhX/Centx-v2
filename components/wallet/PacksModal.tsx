'use client'
import { useUserStore } from '@/store/userStore'
import { updateUserBalance } from '@/lib/firebase/services'

const PACKS = [
  { id: '10', name: 'Starter', likes: 10, price: 0 },
  { id: '100', name: 'Basic', likes: 100, price: 0 },
  { id: '500', name: 'Popular', likes: 500, price: 0, popular: true },
  { id: '1000', name: 'Premium', likes: 1000, price: 0 },
]

export default function PacksModal({ onClose }: { onClose: () => void }) {
  const { user } = useUserStore()

  const handleBuyPack = async (likes: number) => {
    if (!user) return
    try {
      await updateUserBalance(user.uid, likes)
      onClose()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Buy Likes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <p className="text-gray-400 text-sm mb-6">💳 Stripe integration coming soon! For now, enjoy free packs while we're in beta.</p>
        <div className="grid grid-cols-2 gap-4">
          {PACKS.map((pack) => (
            <button key={pack.id} onClick={() => handleBuyPack(pack.likes)} className={`relative p-6 rounded-2xl border-2 transition-all hover:scale-105 ${pack.popular ? 'border-green-400 bg-green-400/10' : 'border-zinc-700 hover:border-green-400'}`}>
              {pack.popular && <div className="absolute top-2 right-2 bg-green-400 text-black text-xs font-bold px-2 py-1 rounded-lg">POPULAR</div>}
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{pack.name}</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-1">{pack.likes}</div>
              <div className="text-sm font-semibold text-green-400">Free Beta</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
