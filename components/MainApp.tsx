'use client'
import { useState, useEffect } from 'react'
import { listenToPosts, getFollowing } from '@/lib/firebase/services'
import { useUserStore } from '@/store/userStore'
import Header from './ui/Header'
import FeedView from './post/FeedView'
import CosmosView from './cosmos/CosmosView'
import UserProfile from './ui/UserProfile'

export default function MainApp() {
  const { user } = useUserStore()
  const [view, setView] = useState<'cosmos' | 'feed' | 'profile'>('feed')
  const [posts, setPosts] = useState<any[]>([])
  const [followingPosts, setFollowingPosts] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = listenToPosts((newPosts) => setPosts(newPosts), 'foryou')
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    const loadFollowing = async () => {
      const ids = await getFollowing(user.uid)
      setFollowingIds(ids)
    }
    loadFollowing()
  }, [user])

  useEffect(() => {
    if (followingIds.length === 0) {
      setFollowingPosts([])
      return
    }
    const unsubscribe = listenToPosts((newPosts) => setFollowingPosts(newPosts), 'following', undefined, followingIds)
    return () => unsubscribe()
  }, [followingIds])

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId)
    setView('profile')
  }

  return (
    <div className="min-h-screen bg-black">
      <Header onUserSelect={handleUserSelect} />

      {view === 'cosmos' && <CosmosView posts={posts} />}
      {view === 'feed' && <FeedView posts={posts} followingPosts={followingPosts} />}
      {view === 'profile' && selectedUserId && <UserProfile userId={selectedUserId} />}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-zinc-900/95 backdrop-blur-xl border-2 border-zinc-800 rounded-full p-1.5 flex gap-1.5 shadow-2xl">
          <button onClick={() => setView('cosmos')} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 ${view === 'cosmos' ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black' : 'text-gray-400 hover:text-white'}`}>
            🌌 Cosmos
          </button>
          <button onClick={() => setView('feed')} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 ${view === 'feed' ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black' : 'text-gray-400 hover:text-white'}`}>
            📋 Feed
          </button>
        </div>
      </div>
    </div>
  )
}
