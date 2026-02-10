'use client'
import { useState, useEffect } from 'react'
import { searchUsers } from '@/lib/firebase/services'

export default function Search({ onClose, onUserSelect }: { onClose: () => void; onUserSelect: (userId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      const users = await searchUsers(searchTerm)
      setResults(users)
      setLoading(false)
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/95 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full mt-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Search Users</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-green-400 mb-4"
          autoFocus
        />

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Searching...</div>
          ) : results.length === 0 && searchTerm.length >= 2 ? (
            <div className="text-center py-10 text-gray-400">No users found</div>
          ) : (
            results.map((user) => (
              <div key={user.uid} onClick={() => { onUserSelect(user.uid); onClose(); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 cursor-pointer transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-lg font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">@{user.username}</div>
                  <div className="text-sm text-gray-400">{user.followersCount || 0} followers</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
