'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Session, Article } from '@/lib/types'
import ArticleViewer from '@/components/ArticleViewer'
import PostList from '@/components/PostList'

export default function ClusterPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const clusterId = params.clusterId as string

  const [session, setSession] = useState<Session | null>(null)
  const [article, setArticle] = useState<Article | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const sessionRes = await fetch(`/api/sessions/${sessionId}`)
        if (sessionRes.ok) {
          const s: Session = await sessionRes.json()
          setSession(s)

          // Check if article already exists for this cluster
          const cluster = s.clusters.find(c => c.id === clusterId)
          if (cluster?.articleStatus === 'done') {
            // Fetch via generate endpoint (returns cached)
            const artRes = await fetch('/api/generate-article', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clusterId, sessionId }),
            })
            if (artRes.ok) {
              const a = await artRes.json()
              if (a?.body) setArticle(a)
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId, clusterId])

  const cluster = session?.clusters.find(c => c.id === clusterId)
  const clusterPosts = session?.posts.filter(p => cluster?.postIds.includes(p.id)) ?? []

  async function generateArticle() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId, sessionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setArticle(data)

      // Refresh session to update article status dot
      const sessionRes = await fetch(`/api/sessions/${sessionId}`)
      if (sessionRes.ok) setSession(await sessionRes.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  if (!session || !cluster) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Cluster not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href={`/sessions/${sessionId}`}
            className="text-sm text-blue-500 hover:underline mb-4 inline-block"
          >
            &larr; Back to Session
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{cluster.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{cluster.postCount} posts</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <p className="text-gray-700">{cluster.summary}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {cluster.keyAccounts.map(a => (
              <span key={a} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {a.startsWith('@') ? a : `@${a}`}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Article</h2>
            {!article && !generating && (
              <button
                onClick={generateArticle}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Article
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
              {error}
              <button
                onClick={generateArticle}
                className="ml-3 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {generating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
              Claude is writing your article... this may take 30-60 seconds.
            </div>
          )}

          {article && <ArticleViewer article={article} />}

          {!article && !generating && !error && (
            <div className="text-center text-gray-400 py-12 border border-dashed border-gray-200 rounded-xl">
              Click "Generate Article" to create a long-form blog post from this cluster.
            </div>
          )}
        </div>

        <PostList posts={clusterPosts} title="Source Posts" />
      </div>
    </main>
  )
}
