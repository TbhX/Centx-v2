import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, runTransaction, increment, setDoc } from 'firebase/firestore'
import { db } from './config'

export const createPost = async (userId: string, username: string, content: string) => {
  return await addDoc(collection(db, 'posts'), { authorId: userId, username, content, likesCount: 0, createdAt: serverTimestamp() })
}

export const listenToPosts = (callback: (posts: any[]) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(q, (snapshot) => { callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))) })
}

export const likePost = async (userId: string, postId: string, postAuthorId: string) => {
  const likeId = `${userId}_${postId}`
  const likeRef = doc(db, 'likes', likeId)
  const likeDoc = await getDoc(likeRef)
  if (likeDoc.exists()) throw new Error('Already liked')
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId)
    const userDoc = await transaction.get(userRef)
    if (!userDoc.exists()) throw new Error('User not found')
    if (userDoc.data().walletBalance < 1) throw new Error('Insufficient balance')
    transaction.update(userRef, { walletBalance: increment(-1), totalSpent: increment(1) })
    transaction.update(doc(db, 'users', postAuthorId), { walletBalance: increment(1), totalEarned: increment(1) })
    transaction.update(doc(db, 'posts', postId), { likesCount: increment(1) })
    transaction.set(likeRef, { userId, postId, createdAt: serverTimestamp() })
  })
}

export const getUserLikes = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, 'likes'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data().postId)
}

export const createUser = async (uid: string, username: string, email: string) => {
  await setDoc(doc(db, 'users', uid), { username, email, walletBalance: 100, totalEarned: 0, totalSpent: 0, createdAt: serverTimestamp() })
}

export const getUser = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid))
  return userDoc.exists() ? { uid, ...userDoc.data() } : null
}

export const updateUserBalance = async (uid: string, amount: number) => {
  await updateDoc(doc(db, 'users', uid), { walletBalance: increment(amount) })
}

export const listenToUser = (uid: string, callback: (user: any) => void) => {
  return onSnapshot(doc(db, 'users', uid), (doc) => {
    if (doc.exists()) callback({ uid, ...doc.data() })
    else callback(null)
  })
}
