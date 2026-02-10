'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/userStore'
import { likePost, reactToPost, getUserLikes, getUserReactions } from '@/lib/firebase/services'
import { AVAILABLE_EMOJIS } from '@/types'

export default function PostCardPremium({ post, onUserClick }: { post: any; onUserClick?: (userId: string) => void }) {
  const { user } = useUserStore()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0)
  const [showReactions, setShowReactions] = useState(false)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [floatingHearts, setFloatingHearts] = useState<{id: number, x: number, y: number, emoji: string}[]>([])
  const cardRef = useRef<HTMLDivElement>(null)

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

  const handleDoubleTap = (e: React.MouseEvent) => {
    if (isLiked) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    handleLike(x, y)
  }

  const handleLike = async (x?: number, y?: number) => {
    if (!user || isLiked) return
    setIsLiked(true)
    setLikesCount((prev: number) => prev + 1)
    const heartX = x ?? Math.random() * 300 + 50
    const heartY = y ?? Math.random() * 200 + 100
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        setFloatingHearts(prev => [...prev, {
          id: Date.now() + i,
          x: heartX + (Math.random() - 0.5) * 100,
          y: heartY + (Math.random() - 0.5) * 50,
          emoji: '💚'
        }])
      }, i * 100)
    }
    setTimeout(() => setFloatingHearts([]), 2000)
    try {
      await likePost(user.uid, post.id, post.authorId)
    } catch (error: any) {
      setIsLiked(false)
      setLikesCount((prev: number) => prev - 1)
    }
  }

  const handleReact = async (emoji: string, event: React.MouseEvent) => {
    if (!user || userReactions.includes(emoji)) return
    const emojiData = AVAILABLE_EMOJIS.find(e => e.emoji === emoji)
    if (!emojiData) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      setFloatingHearts(prev => [...prev, { id: Date.now(), x, y, emoji }])
      setTimeout(() => setFloatingHearts(prev => prev.slice(1)), 1500)
    }
    setShowReactions(false)
    try {
      await reactToPost(user.uid, post.id, post.authorId, emoji, emojiData.price)
      setUserReactions([...userReactions, emoji])
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-4 group"
      onDoubleClick={handleDoubleTap}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-4 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUserClick?.(post.authorId)}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 blur-md opacity-50" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center text-xl font-black shadow-lg shadow-green-400/30">
              <span className="text-black">{post.username[0].toUpperCase()}</span>
            </div>
          </motion.button>
          <div className="flex-1">
            <button onClick={() => onUserClick?.(post.authorId)} className="font-bold text-white/90 hover:text-green-400 transition-colors">
              @{post.username}
            </button>
            <div className="text-xs text-white/40">just now</div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <span className="text-white/50">•••</span>
          </motion.button>
        </div>
        <div className="relative px-4 pb-3">
          <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
        {Object.keys(postReactions).length > 0 && (
          <div className="px-4 pb-3">
            <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {Object.entries(postReactions).map(([emoji, count]: [string, any]) => (
                count > 0 && (
                  <motion.div key={emoji} whileHover={{ scale: 1.1 }} className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">{count}</span>
                  </motion.div>
                )
              ))}
            </motion.div>
          </div>
        )}
        <div className="relative px-4 pb-4 flex items-center gap-2">
          <motion.button onClick={() => handleLike()} disabled={isLiked} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className={`flex-1 relative overflow-hidden rounded-2xl h-12 transition-all ${isLiked ? 'bg-gradient-to-r from-green-400 to-cyan-400 shadow-lg shadow-green-400/30' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}>
            <div className="relative z-10 flex items-center justify-center gap-2">
              <motion.span className="text-xl" animate={isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                {isLiked ? '💚' : '🤍'}
              </motion.span>
              <span className={`font-bold ${isLiked ? 'text-black' : 'text-white/70'}`}>{likesCount}</span>
            </div>
          </motion.button>
          <motion.button onClick={() => setShowReactions(!showReactions)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex-1 relative overflow-hidden rounded-2xl h-12 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            <div className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">✨</span>
              <span className="font-bold text-white/70">{post.reactionsCount || 0}</span>
            </div>
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </motion.button>
        </div>
        <AnimatePresence>
          {showReactions && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 blur-2xl opacity-30" />
                <div className="relative bg-black/95 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-4 shadow-2xl">
                  <div className="flex gap-3 mb-2">
                    {ownedEmojis.map((emoji: string) => {
                      const emojiData = AVAILABLE_EMOJIS.find(e => e.emoji === emoji)
                      const alreadyUsed = userReactions.includes(emoji)
                      return (
                        <motion.button key={emoji} onClick={(e) => !alreadyUsed && handleReact(emoji, e)} disabled={alreadyUsed}
                          whileHover={{ scale: alreadyUsed ? 1 : 1.3, rotate: alreadyUsed ? 0 : 15 }} whileTap={{ scale: alreadyUsed ? 1 : 1.1 }}
                          className={`text-4xl transition-all ${alreadyUsed ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                          title={emojiData ? `${emojiData.name} (${emojiData.price} ❤️)` : emoji}>
                          {emoji}
                        </motion.button>
                      )
                    })}
                  </div>
                  <div className="text-xs text-center text-white/40 font-medium">Tap to react</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.div key={heart.id} initial={{ opacity: 1, y: 0, x: heart.x, scale: 0 }}
              animate={{ opacity: 0, y: -150, x: heart.x + (Math.random() - 0.5) * 100, scale: [0, 1.5, 1], rotate: (Math.random() - 0.5) * 60 }}
              exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute pointer-events-none text-5xl z-30" style={{ top: heart.y, left: 0 }}>
              {heart.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
