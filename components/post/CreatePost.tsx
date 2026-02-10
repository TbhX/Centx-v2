'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { createPost } from '@/lib/firebase/services'

export default function CreatePost() {
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
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <form onSubmit={handleSubmit}>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind? Share something worth a cent..." className="w-full bg-transparent text-white resize-none outline-none placeholder-gray-500 min-h-[100px]" maxLength={5000} />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
          <div className="text-sm text-gray-500">{content.length}/5000</div>
          <button type="submit" disabled={!content.trim() || isPosting} className="bg-green-400 hover:bg-green-500 disabled:opacity-30 text-black font-bold px-6 py-2.5 rounded-xl transition-all">
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
