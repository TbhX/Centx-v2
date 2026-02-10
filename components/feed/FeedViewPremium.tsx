'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/userStore'
import PostCardPremium from '../post/PostCardPremium'

type FeedType = 'foryou' | 'following'

export default function FeedViewPremium({ posts, followingPosts, onUserClick }: { posts: any[]; followingPosts: any[]; onUserClick: (userId: string) => void }) {
  const { user } = useUserStore()
  const [feedType, setFeedType] = useState<FeedType>('foryou')

  const displayPosts = feedType === 'following' ? followingPosts : posts
  const followingCount = user?.followingCount || 0

  return (
    <div className="min-h-screen pt-64 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="sticky top-60 z-30 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 blur-xl opacity-20" />
            <div className="relative bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 flex gap-1.5 shadow-2xl">
              <button onClick={() => setFeedType('foryou')}
                className={`flex-1 relative px-6 py-3 rounded-2xl font-bold transition-all ${feedType === 'foryou' ? '' : 'text-white/50 hover:text-white/70'}`}>
                {feedType === 'foryou' && (
                  <motion.div layoutId="feedSwitch" className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl"
                    transition={{ type: "spring", damping: 30, stiffness: 300 }} />
                )}
                <span className={`relative z-10 ${feedType === 'foryou' ? 'text-black' : ''}`}>✨ For You</span>
              </button>
              <button onClick={() => setFeedType('following')}
                className={`flex-1 relative px-6 py-3 rounded-2xl font-bold transition-all ${feedType === 'following' ? '' : 'text-white/50 hover:text-white/70'}`}>
                {feedType === 'following' && (
                  <motion.div layoutId="feedSwitch" className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl"
                    transition={{ type: "spring", damping: 30, stiffness: 300 }} />
                )}
                <span className={`relative z-10 ${feedType === 'following' ? 'text-black' : ''}`}>
                  👥 Following {followingCount > 0 && `(${followingCount})`}
                </span>
              </button>
            </div>
          </div>
        </div>
        {displayPosts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="text-8xl mb-6 opacity-20">{feedType === 'following' ? '👥' : '✨'}</div>
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              {feedType === 'following' ? followingCount === 0 ? 'Follow Creators' : 'Nothing Yet' : 'The Cosmos Awaits'}
            </h3>
            <p className="text-white/40">
              {feedType === 'following' ? followingCount === 0 ? 'Discover and follow creators!' : 'Your creators haven\'t posted yet.' : 'Be the first star! 🌟'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {displayPosts.map((post, index) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <PostCardPremium post={post} onUserClick={onUserClick} />
              </motion.div>
            ))}
            <div className="text-center py-8 text-white/30 text-sm">🎉 You're all caught up!</div>
          </div>
        )}
      </div>
    </div>
  )
}
