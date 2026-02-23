import DashboardClient from '@/components/DashboardClient'
import SessionCard from '@/components/SessionCard'
import { listSessions, getTopTopics } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const sessions = listSessions()
  const topics = getTopTopics()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">XNews</h1>
          <p className="text-gray-500">Turn X posts into news articles powered by Claude AI</p>
        </div>

        <DashboardClient topics={topics} />

        {sessions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Sessions</h2>
            <div className="space-y-3">
              {sessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <p>No sessions yet. Enter a search term above to get started.</p>
          </div>
        )}
      </div>
    </main>
  )
}
