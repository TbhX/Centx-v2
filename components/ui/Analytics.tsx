'use client'
import { useUserStore } from '@/store/userStore'

export default function Analytics({ posts }: { posts: any[] }) {
  const { user } = useUserStore()
  if (!user) return null

  const totalLikes = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0)
  const avgLikesPerPost = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">📊 Your Analytics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Total Posts</div>
          <div className="text-2xl font-bold text-green-400">{posts.length}</div>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Total Likes</div>
          <div className="text-2xl font-bold text-cyan-400">{totalLikes}</div>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Avg Likes/Post</div>
          <div className="text-2xl font-bold text-purple-400">{avgLikesPerPost}</div>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Total Earned</div>
          <div className="text-2xl font-bold text-yellow-400">{user.totalEarned || 0} ❤️</div>
        </div>
      </div>
    </div>
  )
}
