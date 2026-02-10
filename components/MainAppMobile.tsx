'use client'
import { useState, useEffect } from 'react'
import { listenToPosts, getFollowing } from '@/lib/firebase/services'
import { useUserStore } from '@/store/userStore'
import HeaderMobile from './ui/HeaderMobile'
import BottomNav from './ui/BottomNav'
import FeedViewMobile from './feed/FeedViewMobile'
import CosmosViewMobile from './cosmos/CosmosViewMobile'
import UserProfile from './ui/UserProfile'
import CreatePostModal from './post/CreatePostModal'
import PostDetailModal from './cosmos/PostDetailModal'

export default function MainAppMobile() {
  const { user } = useUserStore()
  const [view, setView] = useState<'cosmos' | 'feed' | 'profile'>('feed')
  const [posts, setPosts] = useState<any[]>([])
  const [followingPosts, setFollowingPosts] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)

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

  const handlePostClick = (post: any) => {
    setSelectedPost(post)
  }

  console.log('🔍 MainAppMobile rendering, view:', view)
  console.log('👤 User:', user?.username)

  return (
    <div className="min-h-screen bg-black">
      {/* DEBUG: Header devrait être ici */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-2 text-xs">
        DEBUG: Header zone - User: {user?.username || 'None'} - View: {view}
      </div>

      <HeaderMobile onUserSelect={handleUserSelect} />

      {view === 'cosmos' && (
        <CosmosViewMobile posts={posts} onPostClick={handlePostClick} />
      )}
      
      {view === 'feed' && (
        <FeedViewMobile 
          posts={posts} 
          followingPosts={followingPosts} 
          onUserClick={handleUserSelect}
        />
      )}
      
      {view === 'profile' && selectedUserId && (
        <UserProfile userId={selectedUserId} />
      )}

      <BottomNav 
        activeView={view}
        onViewChange={setView}
        onCreateClick={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreatePostModal onClose={() => setShowCreateModal(false)} />
      )}

      {selectedPost && (
        <PostDetailModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)}
          onUserClick={handleUserSelect}
        />
      )}
    </div>
  )
}
