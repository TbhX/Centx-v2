'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { likePost, reactToPost, getUserLikes, getUserReactions } from '@/lib/firebase/services'
import { AVAILABLE_EMOJIS } from '@/types'

export default function PostCardMobile({ post, onUserClick }: { post: any; onUserClick?: (userId: string) => void }) {
  const { user } = useUserStore()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likesCount || 0)
  const [showReactions, setShowReactions] = useState(false)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [floating, setFloating] = useState<{emoji: string, id: number}[]>([])

  const ownedEmojis = user?.ownedEmojis || ['❤️']
  const postReactions = post.reactions || {}

  useEffect(() => {
    if (!user) return
    const checkLiked = async () => {
      const likedPosts = await getUserLikes(user.uid)
      setIsLiked(likedPosts.includes(post.id))
      const reactions = await getUserReactions(user.uid, post.id)
      setUserReactions(reactions)
    }
    checkLiked()
  }, [user, post.id])

  const handleLike = async () => {
    if (!user || isLiked) return
    
    setIsLiked(true)
    setLikesCount(prev => prev + 1)
    
    // Floating animation
    setFloating(prev => [...prev, { emoji: '💚', id: Date.now() }])
    setTimeout(() => setFloating(prev => prev.slice(1)), 1500)
    
    try {
      await likePost(user.uid, post.id, post.authorId)
    } catch (error: any) {
      setIsLiked(false)
      setLikesCount(prev => prev - 1)
    }
  }

  const handleReact = async (emoji: string) => {
    if (!user || userReactions.includes(emoji)) return
    const emojiData = AVAILABLE_EMOJIS.find(e => e.emoji === emoji)
    if (!emojiData) return

    setFloating(prev => [...prev, { emoji, id: Date.now() }])
    setTimeout(() => setFloating(prev => prev.slice(1)), 1500)
    setShowReactions(false)

    try {
      await reactToPost(user.uid, post.id, post.authorId, emoji, emojiData.price)
      setUserReactions([...userReactions, emoji])
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 mb-4 hover:border-zinc-700 transition-all animate-slideUp overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-400/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4">
        <button 
          onClick={() => onUserClick?.(post.authorId)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-lg font-bold animate-glow active:scale-95 transition-all"
        >
          {post.username[0].toUpperCase()}
        </button>
        <div className="flex-1">
          <button 
            onClick={() => onUserClick?.(post.authorId)}
            className="font-bold text-white hover:text-green-400 transition-colors"
          >
            @{post.username}
          </button>
          <div className="text-xs text-gray-500">just now</div>
        </div>
      </div>

      {/* Content */}
      <p className="text-white text-base leading-relaxed mb-4 relative z-10">
        {post.content}
      </p>

      {/* Reactions Display */}
      {Object.keys(postReactions).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(postReactions).map(([emoji, count]: [string, any]) => (
            count > 0 && (
              <div key={emoji} className="bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-full px-3 py-1.5 flex items-center gap-2 hover:border-green-400 transition-all animate-bounce-in">
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-bold text-green-400">{count}</span>
              </div>
            )
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={isLiked}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
            isLiked 
              ? 'bg-green-400/20 border-2 border-green-400 text-green-400' 
              : 'bg-zinc-800/50 backdrop-blur-xl border-2 border-zinc-700 text-gray-400 hover:border-green-400'
          }`}
        >
          <span className="text-xl">{isLiked ? '💚' : '❤️'}</span>
          <span>{likesCount}</span>
        </button>

        {/* React */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold bg-zinc-800/50 backdrop-blur-xl border-2 border-zinc-700 text-gray-400 hover:border-cyan-400 transition-all active:scale-95"
        >
          <span className="text-xl">✨</span>
          <span>{post.reactionsCount || 0}</span>
        </button>
      </div>

      {/* Reactions Popup */}
      {showReactions && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-2xl border-2 border-green-400 rounded-3xl p-4 shadow-2xl animate-slideUp z-20">
          <div className="flex gap-3 mb-2">
            {ownedEmojis.map(emoji => {
              const emojiData = AVAILABLE_EMOJIS.find(e => e.emoji === emoji)
              const alreadyUsed = userReactions.includes(emoji)
              return (
                <button
                  key={emoji}
                  onClick={() => !alreadyUsed && handleReact(emoji)}
                  disabled={alreadyUsed}
                  className={`text-4xl transition-all ${alreadyUsed ? 'opacity-30 grayscale' : 'hover:scale-125 active:scale-110'}`}
                  title={emojiData ? `${emojiData.name} (${emojiData.price} ❤️)` : emoji}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
          <div className="text-xs text-center text-gray-400">Tap to react</div>
        </div>
      )}

      {/* Floating Emojis */}
      {floating.map(item => (
        <div
          key={item.id}
          className="absolute text-5xl animate-float-up pointer-events-none z-30"
          style={{
            left: `${Math.random() * 60 + 20}%`,
            bottom: '30%'
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  )
}
