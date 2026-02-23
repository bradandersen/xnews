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

  const images = article.mediaItems?.filter(m => m.type === 'image') ?? []
  const videos = article.mediaItems?.filter(m => m.type === 'video') ?? []

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

      {article.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide block mb-2">TL;DR</span>
          <p className="text-gray-700 text-sm leading-relaxed">{article.summary}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown>{article.body}</ReactMarkdown>
        </div>
      </div>

      {(images.length > 0 || videos.length > 0) && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Media from Posts</h2>

          {videos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Videos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((m, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <video
                      controls
                      poster={m.thumbnailUrl}
                      className="w-full max-h-64 object-contain"
                      preload="metadata"
                    >
                      <source src={m.url} type="video/mp4" />
                    </video>
                    <a
                      href={m.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-gray-400 hover:text-blue-500 px-3 py-2 truncate"
                    >
                      @{m.author}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((m, i) => (
                  <a
                    key={i}
                    href={m.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.url}
                      alt={`@${m.author}`}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                    <span className="block text-xs text-gray-400 px-2 py-1.5 truncate">@{m.author}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
