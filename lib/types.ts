export interface MediaItem {
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  postUrl: string
  author: string
}

export interface XPost {
  id: string
  text: string
  author: string
  authorName: string
  likes: number
  retweets: number
  replies: number
  date: string
  url: string
  isRetweet: boolean
  mediaUrls: string[]
  videoUrls: string[]
}

export interface Cluster {
  id: string
  name: string
  summary: string
  postIds: string[]
  keyAccounts: string[]
  postCount: number
  articleStatus: 'none' | 'generating' | 'done'
}

export type SessionStatus = 'pending' | 'fetching' | 'writing' | 'done' | 'error'

export interface Session {
  id: string
  createdAt: string
  searchTerms: string[]
  status: SessionStatus
  posts: XPost[]
  clusters: Cluster[]
  totalPosts: number
  reportId?: string
  error?: string
}

export interface Article {
  id: string
  clusterId: string
  sessionId: string
  title: string
  summary?: string
  body: string
  wordCount: number
  generatedAt: string
  mediaItems?: MediaItem[]
}
