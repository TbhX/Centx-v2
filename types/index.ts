import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  username: string
  email: string
  walletBalance: number
  totalEarned: number
  totalSpent: number
  createdAt: Timestamp
  bio?: string
  avatar?: string
  followersCount?: number
  followingCount?: number
}

export interface Post {
  id: string
  authorId: string
  username: string
  content: string
  likesCount: number
  commentsCount?: number
  createdAt: Timestamp
}

export interface Like {
  userId: string
  postId: string
  createdAt: Timestamp
}

export interface Follow {
  followerId: string
  followingId: string
  createdAt: Timestamp
}

export interface Notification {
  id: string
  userId: string
  type: 'like' | 'follow' | 'comment'
  fromUserId: string
  fromUsername: string
  postId?: string
  read: boolean
  createdAt: Timestamp
}
