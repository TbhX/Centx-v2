'use client'
import { useState, useEffect } from 'react'
import { getPlatformStats, getPendingCashOuts, completeCashOut } from '@/lib/firebase/services'
import { listenToPlatformStats } from '@/lib/firebase/services'

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<any>(null)
  const [cashOuts, setCashOuts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const platformStats = await getPlatformStats()
      const pending = await getPendingCashOuts()
      setStats(platformStats)
      setCashOuts(pending)
      setLoading(false)
    }
    loadData()

    const unsubscribe = listenToPlatformStats((newStats) => setStats(newStats))
    return () => unsubscribe()
  }, [])

  const handleCompleteCashOut = async (cashOutId: string) => {
    if (!confirm('Marquer ce cash out comme complété?')) return
    await completeCashOut(cashOutId)
    setCashOuts(cashOuts.filter(c => c.id !== cashOutId))
  }

  if (loading) return <div className="text-center p-20">Loading...</div>

  const totalRevenue = stats?.totalRevenue || 0
  const totalRevenueEur = (totalRevenue / 100).toFixed(2)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-4xl w-full mt-20 mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">👑 Admin Dashboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-400/20 to-cyan-400/20 border-2 border-green-400 rounded-2xl p-6">
            <div className="text-sm text-gray-300 mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-white mb-1">{totalRevenue.toFixed(1)} ❤️</div>
            <div className="text-2xl font-bold text-green-400">{totalRevenueEur}€</div>
          </div>

          <div className="bg-zinc-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 mb-2">Total Likes</div>
            <div className="text-3xl font-bold text-cyan-400">{stats?.totalLikes || 0}</div>
          </div>

          <div className="bg-zinc-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 mb-2">Total Reactions</div>
            <div className="text-3xl font-bold text-purple-400">{stats?.totalReactions || 0}</div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">💸 Pending Cash Outs</h3>
          {cashOuts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No pending cash outs</div>
          ) : (
            <div className="space-y-3">
              {cashOuts.map((cashOut) => (
                <div key={cashOut.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">@{cashOut.username}</div>
                    <div className="text-sm text-gray-400">{cashOut.amount} ❤️ = {cashOut.amountEur}€</div>
                  </div>
                  <button onClick={() => handleCompleteCashOut(cashOut.id)} className="bg-green-400 hover:bg-green-500 text-black font-bold px-4 py-2 rounded-xl">
                    Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
