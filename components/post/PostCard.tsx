'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { likePost, getUserLikes } from '@/lib/firebase/services'

export default function PostCard({ post }: { post: any }) {
  const { user } = useUserStore()
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    const checkLiked = async () => {
      if (!user) return
      const likedPosts = await getUserLikes(user.uid)
      setIsLiked(likedPosts.includes(post.id))
    }
    checkLiked()
  }, [user, post.id])

  const handleLike = async () => {
    if (!user || isLiking || isLiked) return
    setIsLiking(true)
    try {
      await likePost(user.uid, post.id, post.authorId)
      setIsLiked(true)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-lg font-bold">{post.username[0].toUpperCase()}</div>
        <div>
          <div className="font-semibold">@{post.username}</div>
          <div className="text-xs text-gray-500">just now</div>
        </div>
      </div>
      <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>
      <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
        <button onClick={handleLike} disabled={isLiked || isLiking} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isLiked ? 'bg-green-400/20 border border-green-400 text-green-400' : 'bg-transparent border border-zinc-700 text-gray-400 hover:border-green-400 hover:text-green-400'}`}>❤️ <span>{post.likesCount || 0}</span></button>
      </div>
    </div>
  )
}
