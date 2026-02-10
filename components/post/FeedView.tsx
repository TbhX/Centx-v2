'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import CreatePost from './CreatePost'
import PostCard from './PostCard'

type FeedType = 'foryou' | 'following'

export default function FeedView({ posts, followingPosts }: { posts: any[]; followingPosts: any[] }) {
  const { user } = useUserStore()
  const [feedType, setFeedType] = useState<FeedType>('foryou')

  const displayPosts = feedType === 'following' ? followingPosts : posts
  const followingCount = user?.followingCount || 0

  return (
    <div className="min-h-screen pt-20 pb-32 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="sticky top-20 z-30 bg-black/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-1.5 flex gap-1.5">
          <button
            onClick={() => setFeedType('foryou')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
              feedType === 'foryou'
                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black scale-105'
                : 'text-gray-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            ✨ Pour toi
          </button>
          <button
            onClick={() => setFeedType('following')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
              feedType === 'following'
                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-black scale-105'
                : 'text-gray-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            👥 Abonnements {followingCount > 0 && `(${followingCount})`}
          </button>
        </div>

        <CreatePost />

        {displayPosts.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="text-6xl mb-4 opacity-50 animate-bounce-slow">
              {feedType === 'following' ? '👥' : '🌌'}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {feedType === 'following' 
                ? followingCount === 0 
                  ? 'Suis des utilisateurs' 
                  : 'Aucun post pour le moment'
                : 'Le cosmos attend'
              }
            </h3>
            <p className="text-gray-400">
              {feedType === 'following'
                ? followingCount === 0
                  ? 'Recherche et suis des créateurs pour voir leurs posts ici!'
                  : 'Les personnes que tu suis n\'ont pas encore posté.'
                : 'Sois le premier à créer un post!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayPosts.map((post, index) => (
              <div key={post.id} style={{ animationDelay: `${index * 50}ms` }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
