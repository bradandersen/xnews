'use client'

import type { XPost } from '@/lib/types'

interface Props {
  post: XPost
}

export default function PostItem({ post }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="font-semibold text-gray-900">{post.authorName}</span>
          <span className="text-gray-500 text-sm ml-2">@{post.author}</span>
        </div>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline shrink-0"
        >
          View
        </a>
      </div>
      <p className="text-gray-800 text-sm leading-relaxed">{post.text}</p>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span suppressHydrationWarning>{post.likes.toLocaleString()} likes</span>
        <span suppressHydrationWarning>{post.retweets.toLocaleString()} RTs</span>
        <span suppressHydrationWarning>{post.replies.toLocaleString()} replies</span>
        <span className="ml-auto" suppressHydrationWarning>{new Date(post.date).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
