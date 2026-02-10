import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, runTransaction, increment, setDoc, deleteDoc, arrayUnion } from 'firebase/firestore'
import { db } from './config'
import { PLATFORM_OWNER_ID, LIKES_TO_EUR, MIN_CASHOUT_LIKES } from '@/types'

const PLATFORM_FEE_BEFORE_CASHOUT = 0.10
const PLATFORM_FEE_AFTER_CASHOUT = 1.00

export const createPost = async (userId: string, username: string, content: string) => {
  return await addDoc(collection(db, 'posts'), { 
    authorId: userId, 
    username, 
    content, 
    likesCount: 0, 
    reactionsCount: 0,
    commentsCount: 0, 
    reactions: {},
    createdAt: serverTimestamp() 
  })
}

export const listenToPosts = (callback: (posts: any[]) => void, feedType?: 'foryou' | 'following', userId?: string, followingIds?: string[]) => {
  let q
  
  if (feedType === 'following' && followingIds && followingIds.length > 0) {
    q = query(
      collection(db, 'posts'),
      where('authorId', 'in', followingIds.slice(0, 10)),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
  } else if (feedType === 'foryou') {
    // FIX: Trier par createdAt au lieu de reactionsCount pour éviter les posts sans ce champ
    q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
  } else if (userId) {
    q = query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'))
  } else {
    q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
  }
  
  return onSnapshot(q, (snapshot) => { 
    callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))) 
  })
}

export const deletePost = async (postId: string) => {
  await deleteDoc(doc(db, 'posts', postId))
}

export const likePost = async (userId: string, postId: string, postAuthorId: string) => {
  const likeId = `${userId}_${postId}`
  const likeRef = doc(db, 'likes', likeId)
  const likeDoc = await getDoc(likeRef)
  if (likeDoc.exists()) throw new Error('Already liked')
  
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId)
    const authorRef = doc(db, 'users', postAuthorId)
    const platformRef = doc(db, 'platform', 'stats')
    
    const userDoc = await transaction.get(userRef)
    const authorDoc = await transaction.get(authorRef)
    
    if (!userDoc.exists()) throw new Error('User not found')
    if (!authorDoc.exists()) throw new Error('Author not found')
    if (userDoc.data().walletBalance < 1) throw new Error('Insufficient balance')
    
    const authorHasCashedOut = authorDoc.data().hasCashedOut || false
    const platformFee = authorHasCashedOut ? PLATFORM_FEE_AFTER_CASHOUT : PLATFORM_FEE_BEFORE_CASHOUT
    const creatorShare = 1 - platformFee
    
    transaction.update(userRef, { walletBalance: increment(-1), totalSpent: increment(1) })
    
    if (creatorShare > 0) {
      transaction.update(authorRef, { earningsBalance: increment(creatorShare), totalEarned: increment(creatorShare) })
    }
    
    transaction.set(platformRef, { totalRevenue: increment(platformFee), totalLikes: increment(1), lastUpdated: serverTimestamp() }, { merge: true })
    transaction.update(doc(db, 'posts', postId), { likesCount: increment(1) })
    transaction.set(likeRef, { userId, postId, createdAt: serverTimestamp() })
    
    const userTxRef = doc(collection(db, 'transactions'))
    transaction.set(userTxRef, { userId, type: 'like_sent', amount: -1, createdAt: serverTimestamp() })
    
    if (creatorShare > 0) {
      const authorTxRef = doc(collection(db, 'transactions'))
      transaction.set(authorTxRef, { userId: postAuthorId, type: 'like_received', amount: creatorShare, platformFee, createdAt: serverTimestamp() })
    }
    
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

export const reactToPost = async (userId: string, postId: string, postAuthorId: string, emoji: string, emojiPrice: number) => {
  const reactionId = `${userId}_${postId}_${emoji}`
  const reactionRef = doc(db, 'reactions', reactionId)
  const reactionDoc = await getDoc(reactionRef)
  if (reactionDoc.exists()) throw new Error('Already reacted with this emoji')

  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId)
    const authorRef = doc(db, 'users', postAuthorId)
    const platformRef = doc(db, 'platform', 'stats')
    
    const userDoc = await transaction.get(userRef)
    const authorDoc = await transaction.get(authorRef)
    
    if (!userDoc.exists()) throw new Error('User not found')
    if (!authorDoc.exists()) throw new Error('Author not found')
    if (userDoc.data().walletBalance < emojiPrice) throw new Error('Insufficient balance')

    const ownedEmojis = userDoc.data().ownedEmojis || []
    if (!ownedEmojis.includes(emoji)) throw new Error('You dont own this emoji')

    const authorHasCashedOut = authorDoc.data().hasCashedOut || false
    const platformFee = authorHasCashedOut ? PLATFORM_FEE_AFTER_CASHOUT : PLATFORM_FEE_BEFORE_CASHOUT
    const creatorShare = 1 - platformFee
    const creatorAmount = emojiPrice * creatorShare
    const platformAmount = emojiPrice * platformFee

    transaction.update(userRef, { walletBalance: increment(-emojiPrice), totalSpent: increment(emojiPrice) })

    if (creatorAmount > 0) {
      transaction.update(authorRef, { earningsBalance: increment(creatorAmount), totalEarned: increment(creatorAmount) })
    }

    transaction.set(platformRef, { totalRevenue: increment(platformAmount), totalReactions: increment(1), lastUpdated: serverTimestamp() }, { merge: true })
    
    const postRef = doc(db, 'posts', postId)
    const postDoc = await transaction.get(postRef)
    const reactions = postDoc.data()?.reactions || {}
    reactions[emoji] = (reactions[emoji] || 0) + 1
    
    transaction.update(postRef, { reactions, reactionsCount: increment(1) })
    transaction.set(reactionRef, { userId, postId, emoji, createdAt: serverTimestamp() })

    if (userId !== postAuthorId) {
      const notifRef = doc(collection(db, 'notifications'))
      transaction.set(notifRef, { userId: postAuthorId, type: 'reaction', fromUserId: userId, fromUsername: userDoc.data().username, postId, emoji, read: false, createdAt: serverTimestamp() })
    }
  })
}

export const getUserReactions = async (userId: string, postId: string): Promise<string[]> => {
  const q = query(collection(db, 'reactions'), where('userId', '==', userId), where('postId', '==', postId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data().emoji)
}

export const buyEmoji = async (userId: string, emoji: string, price: number) => {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId)
    const platformRef = doc(db, 'platform', 'stats')
    
    const userDoc = await transaction.get(userRef)
    if (!userDoc.exists()) throw new Error('User not found')
    if (userDoc.data().walletBalance < price) throw new Error('Insufficient balance')

    const ownedEmojis = userDoc.data().ownedEmojis || []
    if (ownedEmojis.includes(emoji)) throw new Error('Already owned')

    const platformFee = price * 0.10

    transaction.update(userRef, { walletBalance: increment(-price), totalSpent: increment(price), ownedEmojis: arrayUnion(emoji) })
    transaction.set(platformRef, { totalRevenue: increment(platformFee), totalEmojiSales: increment(1), lastUpdated: serverTimestamp() }, { merge: true })
  })
}

export const requestCashOut = async (userId: string, username: string) => {
  const cashOutRef = doc(collection(db, 'cashouts'))
  
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId)
    const userDoc = await transaction.get(userRef)
    
    if (!userDoc.exists()) throw new Error('User not found')
    
    const earningsBalance = userDoc.data().earningsBalance || 0
    
    if (earningsBalance < MIN_CASHOUT_LIKES) {
      throw new Error(`Minimum ${MIN_CASHOUT_LIKES} likes required (${MIN_CASHOUT_LIKES / LIKES_TO_EUR}€)`)
    }
    
    const amountEur = earningsBalance / LIKES_TO_EUR
    
    transaction.set(cashOutRef, { userId, username, amount: earningsBalance, amountEur, status: 'pending', createdAt: serverTimestamp() })
    transaction.update(userRef, { earningsBalance: 0, hasCashedOut: true, totalCashedOut: increment(amountEur) })
    
    const txRef = doc(collection(db, 'transactions'))
    transaction.set(txRef, { userId, type: 'cashout', amount: -earningsBalance, amountEur, createdAt: serverTimestamp() })
  })
}

export const getPendingCashOuts = async () => {
  const q = query(collection(db, 'cashouts'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const completeCashOut = async (cashOutId: string) => {
  await updateDoc(doc(db, 'cashouts', cashOutId), { status: 'completed', completedAt: serverTimestamp() })
}

export const purchaseLikes = async (userId: string, amount: number, stripePaymentId: string) => {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId)
    const userDoc = await transaction.get(userRef)
    if (!userDoc.exists()) throw new Error('User not found')
    transaction.update(userRef, { walletBalance: increment(amount) })
    const txRef = doc(collection(db, 'transactions'))
    transaction.set(txRef, { userId, type: 'purchase', amount, stripePaymentId, createdAt: serverTimestamp() })
  })
}

export const createUser = async (uid: string, username: string, email: string) => {
  await setDoc(doc(db, 'users', uid), { username, email, walletBalance: 100, earningsBalance: 0, totalEarned: 0, totalSpent: 0, totalCashedOut: 0, hasCashedOut: false, followersCount: 0, followingCount: 0, ownedEmojis: ['❤️'], createdAt: serverTimestamp() })
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
  const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any))
  return users.filter((user: any) => user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
}

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

export const getFollowing = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, 'follows'), where('followerId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data().followingId)
}

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

export const getPlatformStats = async () => {
  const statsDoc = await getDoc(doc(db, 'platform', 'stats'))
  return statsDoc.exists() ? statsDoc.data() : null
}

export const listenToPlatformStats = (callback: (stats: any) => void) => {
  return onSnapshot(doc(db, 'platform', 'stats'), (doc) => {
    if (doc.exists()) callback(doc.data())
    else callback(null)
  })
}
