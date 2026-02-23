import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession, getArticle } from '@/lib/storage'
import ArticleViewer from '@/components/ArticleViewer'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function SessionPage({ params }: Props) {
  const { sessionId } = await params
  const session = getSession(sessionId)

  if (!session) notFound()

  const report = session.reportId ? getArticle(session.reportId) : null

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm text-blue-500 hover:underline mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.searchTerms.join(', ')}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {session.totalPosts} posts &middot;{' '}
                <span suppressHydrationWarning>{new Date(session.createdAt).toLocaleString()}</span>
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                session.status === 'done'
                  ? 'bg-green-100 text-green-700'
                  : session.status === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {session.status}
            </span>
          </div>
        </div>

        {session.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
            {session.error}
          </div>
        )}

        {report ? (
          <ArticleViewer article={report} />
        ) : (
          <div className="text-center text-gray-400 py-16">
            {session.status === 'done'
              ? 'No report was generated for this session.'
              : 'Processing...'}
          </div>
        )}
      </div>
    </main>
  )
}
