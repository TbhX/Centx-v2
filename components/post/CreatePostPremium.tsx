'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/userStore'
import { createPost } from '@/lib/firebase/services'

export default function CreatePostPremium({ onClose }: { onClose: () => void }) {
  const { user } = useUserStore()
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user || isPosting) return
    setIsPosting(true)
    try {
      await createPost(user.uid, user.username, content.trim())
      setContent('')
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end bg-black/80 backdrop-blur-xl" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[90vh] bg-gradient-to-b from-zinc-900 to-black rounded-t-3xl overflow-hidden">
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <button type="button" onClick={onClose} className="text-white/60 hover:text-white text-2xl transition-colors">✕</button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Create Post</h2>
            <div className="w-6" />
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 blur-md opacity-50" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center text-xl font-black">
                  <span className="text-black">{user?.username[0].toUpperCase()}</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-white">@{user?.username}</div>
                <div className="text-xs text-white/40">Posting to cosmos</div>
              </div>
            </div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in the cosmos? ✨" autoFocus
              className="w-full min-h-[200px] bg-transparent text-white text-lg resize-none outline-none placeholder-white/30"
              maxLength={5000} />
          </div>
          <div className="px-6 py-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/40">{content.length}/5000</div>
              <motion.button type="submit" disabled={!content.trim() || isPosting}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden px-8 py-3 rounded-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400" />
                {isPosting ? (
                  <span className="relative z-10 text-black flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : (
                  <span className="relative z-10 text-black">🚀 Post</span>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
