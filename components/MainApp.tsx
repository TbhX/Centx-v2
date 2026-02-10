'use client'
import { useState, useEffect } from 'react'
import { listenToPosts } from '@/lib/firebase/services'
import Header from './ui/Header'
import FeedView from './post/FeedView'
import CosmosView from './cosmos/CosmosView'
import UserProfile from './ui/UserProfile'

export default function MainApp() {
  const [view, setView] = useState<'cosmos' | 'feed' | 'profile'>('feed')
  const [posts, setPosts] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = listenToPosts((newPosts) => setPosts(newPosts))
    return () => unsubscribe()
  }, [])

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId)
    setView('profile')
  }

  return (
    <div className="min-h-screen bg-black">
      <Header onUserSelect={handleUserSelect} />

      {view === 'cosmos' && <CosmosView posts={posts} />}
      {view === 'feed' && <FeedView posts={posts} />}
      {view === 'profile' && selectedUserId && <UserProfile userId={selectedUserId} />}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-full p-1.5 flex gap-1.5 shadow-2xl">
          <button onClick={() => setView('cosmos')} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${view === 'cosmos' ? 'bg-green-400 text-black' : 'text-gray-400 hover:text-white'}`}>
            🌌 Cosmos
          </button>
          <button onClick={() => setView('feed')} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${view === 'feed' ? 'bg-green-400 text-black' : 'text-gray-400 hover:text-white'}`}>
            📋 Feed
          </button>
        </div>
      </div>
    </div>
  )
}
