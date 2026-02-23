'use client'

import Link from 'next/link'
import type { Session } from '@/lib/types'

interface Props {
  session: Session
}

const statusLabel: Record<Session['status'], string> = {
  pending: 'Pending',
  fetching: 'Fetching...',
  writing: 'Writing...',
  done: 'Done',
  error: 'Error',
}

const statusClasses: Record<Session['status'], string> = {
  pending: 'bg-gray-100 text-gray-600',
  fetching: 'bg-blue-100 text-blue-700',
  writing: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
}

export default function SessionCard({ session }: Props) {
  return (
    <Link href={`/sessions/${session.id}`}>
      <div className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-1">
            {session.searchTerms.map(t => (
              <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusClasses[session.status]}`}>
            {statusLabel[session.status]}
          </span>
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{session.totalPosts} posts</span>
          <span>{session.clusters.length} clusters</span>
          <span className="ml-auto" suppressHydrationWarning>{new Date(session.createdAt).toLocaleDateString()}</span>
        </div>
        {session.error && (
          <p className="text-xs text-red-600 mt-2 truncate">{session.error}</p>
        )}
      </div>
    </Link>
  )
}
