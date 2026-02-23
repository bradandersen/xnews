'use client'

import Link from 'next/link'
import type { Article, Session } from '@/lib/types'

interface Props {
  article: Article
  session?: Session
}

export default function ArticleCard({ article, session }: Props) {
  return (
    <Link href={`/sessions/${article.sessionId}`}>
      <div className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 leading-snug">
          {article.title}
        </h3>
        {session && session.searchTerms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {session.searchTerms.map(t => (
              <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-4 text-sm text-gray-400">
          <span>{article.wordCount.toLocaleString()} words</span>
          {session && <span>{session.totalPosts} posts</span>}
          <span className="ml-auto" suppressHydrationWarning>
            {new Date(article.generatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
