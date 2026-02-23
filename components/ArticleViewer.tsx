'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Article } from '@/lib/types'

interface Props {
  article: Article
}

export default function ArticleViewer({ article }: Props) {
  const [copied, setCopied] = useState(false)

  function copyMarkdown() {
    navigator.clipboard.writeText(article.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function exportMarkdown() {
    const blob = new Blob([article.body], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          <span suppressHydrationWarning>{article.wordCount.toLocaleString()} words</span> &middot; Generated{' '}
          <span suppressHydrationWarning>{new Date(article.generatedAt).toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyMarkdown}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy MD'}
          </button>
          <button
            onClick={exportMarkdown}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export .md
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown>{article.body}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
