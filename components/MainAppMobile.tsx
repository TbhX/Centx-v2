'use client'
import { useState, useEffect } from 'react'
import { listenToPosts, getFollowing } from '@/lib/firebase/services'
import { useUserStore } from '@/store/userStore'
import HeaderPremium from './ui/HeaderPremium'
import BottomNavPremium from './ui/BottomNavPremium'
import FeedViewPremium from './feed/FeedViewPremium'
import CosmosViewMobile from './cosmos/CosmosViewMobile'
import UserProfile from './ui/UserProfile'
import CreatePostPremium from './post/CreatePostPremium'
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

  return (
    <div className="min-h-screen bg-black">
      <HeaderPremium onUserSelect={handleUserSelect} />

      {view === 'cosmos' && (
        <CosmosViewMobile posts={posts} onPostClick={handlePostClick} />
      )}
      
      {view === 'feed' && (
        <FeedViewPremium 
          posts={posts} 
          followingPosts={followingPosts} 
          onUserClick={handleUserSelect}
        />
      )}
      
      {view === 'profile' && selectedUserId && (
        <UserProfile userId={selectedUserId} />
      )}

      <BottomNavPremium 
        activeView={view}
        onViewChange={setView}
        onCreateClick={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreatePostPremium onClose={() => setShowCreateModal(false)} />
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
