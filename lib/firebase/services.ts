import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, runTransaction, increment, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './config'

// ===== POSTS =====
export const createPost = async (userId: string, username: string, content: string) => {
  return await addDoc(collection(db, 'posts'), { authorId: userId, username, content, likesCount: 0, commentsCount: 0, createdAt: serverTimestamp() })
}

export const listenToPosts = (callback: (posts: any[]) => void, userId?: string) => {
  let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
  if (userId) q = query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => { callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))) })
}

export const deletePost = async (postId: string) => {
  await deleteDoc(doc(db, 'posts', postId))
}

// ===== LIKES =====
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
    if (userId !== postAuthorId) {
      const notifRef = doc(collection(db, 'notifications'))
      transaction.set(notifRef, { userId: postAuthorId, type: 'like', fromUserId: userId, fromUsername: userDoc.data().username, postId, read: false, createdAt: serverTimestamp() })
    }
  })
}

export const getUserLikes = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, 'likes'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data().postId)
}

// ===== USERS =====
export const createUser = async (uid: string, username: string, email: string) => {
  await setDoc(doc(db, 'users', uid), { username, email, walletBalance: 100, totalEarned: 0, totalSpent: 0, followersCount: 0, followingCount: 0, createdAt: serverTimestamp() })
}

export const getUser = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid))
  return userDoc.exists() ? { uid, ...userDoc.data() } : null
}

export const getUserByUsername = async (username: string) => {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1))
  const snapshot = await getDocs(q)
  return snapshot.empty ? null : { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

export const updateUserProfile = async (uid: string, data: { bio?: string; avatar?: string }) => {
  await updateDoc(doc(db, 'users', uid), data)
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

export const searchUsers = async (searchTerm: string) => {
  const q = query(collection(db, 'users'), orderBy('username'), limit(20))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
}

// ===== FOLLOWS =====
export const followUser = async (followerId: string, followingId: string, followerUsername: string) => {
  const followId = `${followerId}_${followingId}`
  await setDoc(doc(db, 'follows', followId), { followerId, followingId, createdAt: serverTimestamp() })
  await updateDoc(doc(db, 'users', followerId), { followingCount: increment(1) })
  await updateDoc(doc(db, 'users', followingId), { followersCount: increment(1) })
  const notifRef = doc(collection(db, 'notifications'))
  await setDoc(notifRef, { userId: followingId, type: 'follow', fromUserId: followerId, fromUsername: followerUsername, read: false, createdAt: serverTimestamp() })
}

export const unfollowUser = async (followerId: string, followingId: string) => {
  const followId = `${followerId}_${followingId}`
  await deleteDoc(doc(db, 'follows', followId))
  await updateDoc(doc(db, 'users', followerId), { followingCount: increment(-1) })
  await updateDoc(doc(db, 'users', followingId), { followersCount: increment(-1) })
}

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const followId = `${followerId}_${followingId}`
  const followDoc = await getDoc(doc(db, 'follows', followId))
  return followDoc.exists()
}

export const getFollowing = async (userId: string) => {
  const q = query(collection(db, 'follows'), where('followerId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data().followingId)
}

// ===== NOTIFICATIONS =====
export const listenToNotifications = (userId: string, callback: (notifs: any[]) => void) => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20))
  return onSnapshot(q, (snapshot) => { callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))) })
}

export const markNotificationRead = async (notifId: string) => {
  await updateDoc(doc(db, 'notifications', notifId), { read: true })
}

export const markAllNotificationsRead = async (userId: string) => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false))
  const snapshot = await getDocs(q)
  const batch = snapshot.docs.map(doc => updateDoc(doc.ref, { read: true }))
  await Promise.all(batch)
}
