'use client'

import type { XPost } from '@/lib/types'
import PostItem from './PostItem'

interface Props {
  posts: XPost[]
  title?: string
}

export default function PostList({ posts, title = 'Source Posts' }: Props) {
  if (posts.length === 0) return null

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {title} ({posts.length})
      </h2>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
