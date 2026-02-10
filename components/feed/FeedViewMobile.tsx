'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import PostCardMobile from '../post/PostCardMobile'

type FeedType = 'foryou' | 'following'

export default function FeedViewMobile({ posts, followingPosts, onUserClick }: { posts: any[]; followingPosts: any[]; onUserClick: (userId: string) => void }) {
  const { user } = useUserStore()
  const [feedType, setFeedType] = useState<FeedType>('foryou')

  const displayPosts = feedType === 'following' ? followingPosts : posts
  const followingCount = user?.followingCount || 0

  return (
    <div className="min-h-screen pt-48 pb-24 px-4">
      <div className="max-w-lg mx-auto">
        {/* Feed Switcher */}
        <div className="sticky top-44 z-30 bg-black/90 backdrop-blur-2xl border-2 border-zinc-800 rounded-3xl p-1.5 flex gap-1.5 mb-6 shadow-2xl">
          <button
            onClick={() => setFeedType('foryou')}
            className={`flex-1 px-4 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
              feedType === 'foryou'
                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✨ Pour toi
          </button>
          <button
            onClick={() => setFeedType('following')}
            className={`flex-1 px-4 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
              feedType === 'following'
                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👥 Abonnements {followingCount > 0 && `(${followingCount})`}
          </button>
        </div>

        {/* Posts */}
        {displayPosts.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="text-7xl mb-6 opacity-50 animate-bounce-slow">
              {feedType === 'following' ? '👥' : '✨'}
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              {feedType === 'following' 
                ? followingCount === 0 
                  ? 'Suis des créateurs' 
                  : 'Rien pour l\'instant'
                : 'Le cosmos t\'attend'
              }
            </h3>
            <p className="text-gray-400 text-sm">
              {feedType === 'following'
                ? followingCount === 0
                  ? 'Découvre et suis des créateurs pour voir leurs posts ici!'
                  : 'Tes créateurs favoris n\'ont pas encore posté.'
                : 'Crée le premier post et deviens une étoile! 🌟'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {displayPosts.map((post, index) => (
              <div key={post.id} style={{ animationDelay: `${index * 50}ms` }}>
                <PostCardMobile post={post} onUserClick={onUserClick} />
              </div>
            ))}
            
            {/* End message */}
            <div className="text-center py-8 text-gray-500 text-sm animate-fadeIn">
              🎉 Tu as tout vu! Reviens plus tard.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
