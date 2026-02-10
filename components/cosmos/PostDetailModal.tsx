'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { likePost, reactToPost, getUserLikes, getUserReactions } from '@/lib/firebase/services'
import { AVAILABLE_EMOJIS } from '@/types'

export default function PostDetailModal({ post, onClose, onUserClick }: { post: any; onClose: () => void; onUserClick: (userId: string) => void }) {
  const { user } = useUserStore()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0)
  const [showReactions, setShowReactions] = useState(false)
  const [userReactions, setUserReactions] = useState<string[]>([])

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
    setLikesCount((prev: number) => prev + 1)
    try {
      await likePost(user.uid, post.id, post.authorId)
    } catch (error: any) {
      setIsLiked(false)
      setLikesCount((prev: number) => prev - 1)
    }
  }

  const handleReact = async (emoji: string) => {
    if (!user || userReactions.includes(emoji)) return
    const emojiData = AVAILABLE_EMOJIS.find(e => e.emoji === emoji)
    if (!emojiData) return

    try {
      await reactToPost(user.uid, post.id, post.authorId, emoji, emojiData.price)
      setUserReactions([...userReactions, emoji])
      setShowReactions(false)
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl animate-fadeIn flex items-end">
      <div className="w-full bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slideUp">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                onClose()
                onUserClick(post.authorId)
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-2xl font-bold animate-glow active:scale-95 transition-all"
            >
              {post.username[0].toUpperCase()}
            </button>
            <div className="flex-1">
              <button 
                onClick={() => {
                  onClose()
                  onUserClick(post.authorId)
                }}
                className="font-bold text-xl text-white hover:text-green-400 transition-colors"
              >
                @{post.username}
              </button>
              <div className="text-sm text-gray-500">just now</div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl transition-all active:scale-95">
              ×
            </button>
          </div>

          {/* Post Content */}
          <p className="text-white text-xl leading-relaxed mb-6">
            {post.content}
          </p>

          {/* Reactions Display */}
          {Object.keys(postReactions).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(postReactions).map(([emoji, count]: [string, any]) => (
                count > 0 && (
                  <div key={emoji} className="bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm font-bold text-green-400">{count}</span>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleLike}
              disabled={isLiked}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 ${
                isLiked 
                  ? 'bg-green-400/20 border-2 border-green-400 text-green-400' 
                  : 'bg-zinc-800 border-2 border-zinc-700 text-gray-400 hover:border-green-400'
              }`}
            >
              <span className="text-2xl">{isLiked ? '💚' : '❤️'}</span>
              <span className="text-lg">{likesCount}</span>
            </button>

            <button
              onClick={() => setShowReactions(!showReactions)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold bg-zinc-800 border-2 border-zinc-700 text-gray-400 hover:border-cyan-400 transition-all active:scale-95"
            >
              <span className="text-2xl">✨</span>
              <span className="text-lg">{post.reactionsCount || 0}</span>
            </button>
          </div>

          {/* Reactions Grid */}
          {showReactions && (
            <div className="bg-zinc-800/50 backdrop-blur-xl border-2 border-green-400 rounded-3xl p-6 mb-6 animate-slideUp">
              <div className="text-sm text-gray-400 mb-4 text-center">Choisis une réaction</div>
              <div className="grid grid-cols-5 gap-4">
                {ownedEmojis.map(emoji => {
                  const emojiData = AVAILABLE_EMOJIS.find(e => e.emoji === emoji)
                  const alreadyUsed = userReactions.includes(emoji)
                  return (
                    <button
                      key={emoji}
                      onClick={() => !alreadyUsed && handleReact(emoji)}
                      disabled={alreadyUsed}
                      className={`text-5xl transition-all ${alreadyUsed ? 'opacity-30 grayscale' : 'hover:scale-125 active:scale-110'}`}
                      title={emojiData ? `${emojiData.name} (${emojiData.price} ❤️)` : emoji}
                    >
                      {emoji}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
