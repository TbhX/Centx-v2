'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase/config'
import { useUserStore } from '@/store/userStore'

export default function FirebaseDebug() {
  const { user } = useUserStore()
  const [status, setStatus] = useState<string[]>([])
  const [posts, setPosts] = useState<any[]>([])

  const addLog = (msg: string) => {
    console.log(msg)
    setStatus(prev => [...prev, msg])
  }

  const testFirestore = async () => {
    addLog('🔍 Testing Firestore connection...')
    
    try {
      // Test 1: Lire les posts
      addLog('📖 Reading posts...')
      const postsSnapshot = await getDocs(collection(db, 'posts'))
      addLog(`✅ Found ${postsSnapshot.size} posts`)
      
      const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPosts(postsData)
      
      if (postsData.length > 0) {
        addLog(`📝 First post: ${JSON.stringify(postsData[0])}`)
      }
      
      // Test 2: Auth status
      addLog(`🔐 Auth user: ${auth.currentUser?.uid || 'NOT LOGGED IN'}`)
      addLog(`👤 Store user: ${user?.uid || 'NO USER IN STORE'}`)
      
      // Test 3: Créer un post de test
      if (user) {
        addLog('✍️ Creating test post...')
        const testPost = await addDoc(collection(db, 'posts'), {
          authorId: user.uid,
          username: user.username,
          content: '🧪 TEST POST - ' + new Date().toLocaleTimeString(),
          likesCount: 0,
          reactionsCount: 0,
          reactions: {},
          createdAt: serverTimestamp()
        })
        addLog(`✅ Test post created: ${testPost.id}`)
      } else {
        addLog('❌ Cannot create post - no user logged in')
      }
      
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`)
      console.error('Firestore error:', error)
    }
  }

  useEffect(() => {
    addLog('🚀 Firebase Debug Component Loaded')
  }, [])

  return (
    <div className="fixed top-20 right-4 z-[999] bg-zinc-900 border-2 border-green-400 rounded-2xl p-4 max-w-md max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-green-400">🔧 Firebase Debug</h3>
      </div>
      
      <button 
        onClick={testFirestore}
        className="w-full bg-green-400 text-black font-bold py-2 px-4 rounded-xl mb-4 hover:bg-green-500"
      >
        🧪 Run Tests
      </button>

      <div className="space-y-2 mb-4">
        <div className="text-xs text-gray-400">Status:</div>
        {status.map((log, i) => (
          <div key={i} className="text-xs font-mono text-white bg-black/50 p-2 rounded">
            {log}
          </div>
        ))}
      </div>

      {posts.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400">Posts in DB:</div>
          {posts.map((post) => (
            <div key={post.id} className="text-xs bg-black/50 p-2 rounded">
              <div className="text-green-400">@{post.username}</div>
              <div className="text-white">{post.content?.substring(0, 50)}...</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
