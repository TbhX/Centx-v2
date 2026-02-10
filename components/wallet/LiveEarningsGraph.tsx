'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'

export default function LiveEarningsGraph() {
  const { user } = useUserStore()
  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

  const earningsBalance = user?.earningsBalance || 0
  const totalEarned = user?.totalEarned || 0

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(prev => [...prev.slice(1), Math.random() * 10 + earningsBalance])
    }, 3000)
    return () => clearInterval(interval)
  }, [earningsBalance])

  const max = Math.max(...data, 1)

  return (
    <div className="bg-gradient-to-br from-green-400/10 to-cyan-400/10 border-2 border-green-400/30 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">💰 En attente</div>
          <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            {earningsBalance.toFixed(1)} ❤️
          </div>
          <div className="text-lg text-green-400">{(earningsBalance / 100).toFixed(2)}€</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Total gagné</div>
          <div className="text-xl font-bold text-white">{totalEarned.toFixed(0)} ❤️</div>
        </div>
      </div>

      {/* Mini Graph */}
      <div className="flex items-end gap-1 h-20">
        {data.map((value, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-green-400 to-cyan-400 rounded-t-lg transition-all duration-500 animate-pulse"
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>

      <div className="mt-4 text-xs text-center text-gray-400 flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Live updates
      </div>
    </div>
  )
}
