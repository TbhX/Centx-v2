'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { getUser, listenToPosts, isFollowing, followUser, unfollowUser } from '@/lib/firebase/services'
import PostCard from '../post/PostCard'

export default function UserProfile({ userId }: { userId: string }) {
  const { user: currentUser } = useUserStore()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser(userId)
      setUser(userData)
      setLoading(false)
    }
    loadUser()

    const unsubscribe = listenToPosts((newPosts) => setPosts(newPosts), userId)
    return () => unsubscribe()
  }, [userId])

  useEffect(() => {
    const checkFollowing = async () => {
      if (currentUser && userId !== currentUser.uid) {
        const isFollow = await isFollowing(currentUser.uid, userId)
        setFollowing(isFollow)
      }
    }
    checkFollowing()
  }, [currentUser, userId])

  const handleFollow = async () => {
    if (!currentUser || !user) return
    try {
      if (following) {
        await unfollowUser(currentUser.uid, userId)
        setFollowing(false)
      } else {
        await followUser(currentUser.uid, userId, currentUser.username)
        setFollowing(true)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div></div>
  if (!user) return <div className="text-center p-20 text-gray-400">User not found</div>

  return (
    <div className="min-h-screen pt-20 pb-32 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">@{user.username}</h1>
              {user.bio && <p className="text-gray-400 mb-4">{user.bio}</p>}
              <div className="flex gap-6 mb-4">
                <div><span className="font-bold text-green-400">{posts.length}</span> <span className="text-gray-400">posts</span></div>
                <div><span className="font-bold text-green-400">{user.followersCount || 0}</span> <span className="text-gray-400">followers</span></div>
                <div><span className="font-bold text-green-400">{user.followingCount || 0}</span> <span className="text-gray-400">following</span></div>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="bg-zinc-800 rounded-xl px-4 py-2">
                  <div className="text-xs text-gray-400">Total Earned</div>
                  <div className="font-bold text-green-400">{user.totalEarned || 0} ❤️</div>
                </div>
                <div className="bg-zinc-800 rounded-xl px-4 py-2">
                  <div className="text-xs text-gray-400">Total Spent</div>
                  <div className="font-bold text-cyan-400">{user.totalSpent || 0} ❤️</div>
                </div>
              </div>
              {currentUser && userId !== currentUser.uid && (
                <button onClick={handleFollow} className={`px-6 py-2 rounded-xl font-semibold transition-all ${following ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' : 'bg-green-400 hover:bg-green-500 text-black'}`}>
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold px-2">Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No posts yet</div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  )
}
