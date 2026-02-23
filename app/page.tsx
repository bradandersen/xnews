import DashboardClient from '@/components/DashboardClient'
import SessionCard from '@/components/SessionCard'
import ArticleCard from '@/components/ArticleCard'
import { listSessions, listArticles, getTopTopics } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const sessions = listSessions()
  const articles = listArticles()
  const topics = getTopTopics()

  const sessionMap = new Map(sessions.map(s => [s.id, s]))

  // Sessions that have no article yet (in-progress or errored)
  const pendingSessions = sessions.filter(s => s.status !== 'done' || !s.reportId)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">XNews</h1>
          <p className="text-gray-500">Turn X posts into news articles powered by Claude AI</p>
        </div>

        <DashboardClient topics={topics} />

        {articles.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Generated Articles</h2>
            <div className="space-y-3">
              {articles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  session={sessionMap.get(article.sessionId)}
                />
              ))}
            </div>
          </div>
        )}

        {pendingSessions.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">In Progress</h2>
            <div className="space-y-3">
              {pendingSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {articles.length === 0 && pendingSessions.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <p>No articles yet. Enter a search term above to get started.</p>
          </div>
        )}
      </div>
    </main>
  )
}
