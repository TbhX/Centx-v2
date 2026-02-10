import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  username: string
  email: string
  walletBalance: number
  earningsBalance: number
  totalEarned: number
  totalSpent: number
  totalCashedOut: number
  hasCashedOut: boolean
  createdAt: Timestamp
  bio?: string
  avatar?: string
  followersCount?: number
  followingCount?: number
  ownedEmojis?: string[]
}

export interface Transaction {
  id: string
  userId: string
  type: 'purchase' | 'cashout' | 'like_received' | 'like_sent' | 'reaction'
  amount: number
  balance: number
  stripePaymentId?: string
  createdAt: Timestamp
}

export interface CashOut {
  id: string
  userId: string
  username: string
  amount: number
  amountEur: number
  status: 'pending' | 'completed' | 'rejected'
  createdAt: Timestamp
  completedAt?: Timestamp
}

export interface Post {
  id: string
  authorId: string
  username: string
  content: string
  likesCount: number
  reactionsCount?: number
  commentsCount?: number
  createdAt: Timestamp
  reactions?: { [emoji: string]: number }
}

export interface Reaction {
  userId: string
  postId: string
  emoji: string
  createdAt: Timestamp
}

export interface Emoji {
  id: string
  emoji: string
  name: string
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const AVAILABLE_EMOJIS: Emoji[] = [
  { id: 'fire', emoji: '🔥', name: 'Fire', price: 5, rarity: 'common' },
  { id: 'gem', emoji: '💎', name: 'Gem', price: 10, rarity: 'rare' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', price: 8, rarity: 'common' },
  { id: 'star', emoji: '⭐', name: 'Star', price: 7, rarity: 'common' },
  { id: 'crown', emoji: '👑', name: 'Crown', price: 15, rarity: 'epic' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning', price: 12, rarity: 'rare' },
  { id: 'moon', emoji: '🌙', name: 'Moon', price: 9, rarity: 'rare' },
  { id: 'sparkles', emoji: '✨', name: 'Sparkles', price: 6, rarity: 'common' },
  { id: 'trophy', emoji: '🏆', name: 'Trophy', price: 20, rarity: 'legendary' },
  { id: 'brain', emoji: '🧠', name: 'Brain', price: 25, rarity: 'legendary' },
]

export const PLATFORM_OWNER_ID = 'PLATFORM'
export const LIKES_TO_EUR = 100
export const MIN_CASHOUT_LIKES = 100
