'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { createPost } from '@/lib/firebase/services'

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
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
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl animate-fadeIn">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl transition-all active:scale-95">
            ×
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Nouveau Post
          </h2>
          <div className="w-8" />
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-xl font-bold">
              {user?.username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white">@{user?.username}</div>
              <div className="text-xs text-gray-500">Posting to the cosmos</div>
            </div>
          </div>

          {/* Textarea */}
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            placeholder="Partage quelque chose qui vaut un cent... 💰"
            autoFocus
            className="flex-1 bg-transparent text-white text-lg resize-none outline-none placeholder-gray-600 mb-4"
            maxLength={5000}
          />

          {/* Stats */}
          <div className="flex items-center justify-between mb-4 pb-4 border-t border-zinc-800">
            <div className="flex items-center gap-4">
              <div className={`text-sm font-semibold ${content.length > 4500 ? 'text-red-400' : 'text-gray-500'}`}>
                {content.length}/5000
              </div>
              {content.length > 0 && (
                <div className="text-xs text-gray-500">
                  ~{Math.ceil(content.length / 280)} tweets
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={!content.trim() || isPosting}
              className="bg-gradient-to-r from-green-400 to-cyan-400 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 font-bold px-8 py-3 rounded-2xl transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              {isPosting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Posting...
                </span>
              ) : (
                '🚀 Poster'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
