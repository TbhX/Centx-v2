'use client'
import { useState, useEffect } from 'react'
import { listenToPosts } from '@/lib/firebase/services'
import Header from './ui/Header'
import FeedView from './post/FeedView'

export default function MainApp() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = listenToPosts((newPosts) => setPosts(newPosts))
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <FeedView posts={posts} />
    </div>
  )
}
