'use client'
import CreatePost from './CreatePost'
import PostCard from './PostCard'

export default function FeedView({ posts }: { posts: any[] }) {
  return (
    <div className="min-h-screen pt-20 pb-32 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <CreatePost />
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-50">🌌</div>
            <h3 className="text-xl font-bold mb-2">The cosmos awaits</h3>
            <p className="text-gray-400">Be the first to create a post!</p>
          </div>
        ) : (
          <div className="space-y-4">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
        )}
      </div>
    </div>
  )
}
