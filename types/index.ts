export interface User {
  uid: string
  username: string
  email: string
  walletBalance: number
}

export interface Post {
  id: string
  authorId: string
  username: string
  content: string
  likesCount: number
  createdAt: any
}
