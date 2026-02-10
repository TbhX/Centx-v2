'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { createUser } from '@/lib/firebase/services'

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        if (!username || username.length < 3) {
          setError('Username must be at least 3 characters')
          return
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await createUser(userCredential.user.uid, username, email)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">CENTxt</h1>
        <p className="text-gray-400 text-center mb-8">Where Every Cent Counts</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-green-400" required />}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-green-400" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-green-400" required minLength={6} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-green-400 hover:bg-green-500 disabled:bg-gray-600 text-black font-bold py-3 rounded-xl transition-all">{loading ? 'Loading...' : (isSignup ? 'Sign Up & Get 100 Free Likes 🎉' : 'Login')}</button>
        </form>
        <button onClick={() => setIsSignup(!isSignup)} className="w-full mt-4 text-green-400 text-sm hover:underline">{isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}</button>
      </div>
    </div>
  )
}
