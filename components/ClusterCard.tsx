'use client'

import Link from 'next/link'
import type { Cluster } from '@/lib/types'

interface Props {
  cluster: Cluster
  sessionId: string
}

const statusColors = {
  none: 'bg-gray-300',
  generating: 'bg-yellow-400 animate-pulse',
  done: 'bg-green-400',
}

export default function ClusterCard({ cluster, sessionId }: Props) {
  return (
    <Link href={`/sessions/${sessionId}/clusters/${cluster.id}`}>
      <div className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-snug">{cluster.name}</h3>
          <span
            className={`w-3 h-3 rounded-full shrink-0 mt-1 ${statusColors[cluster.articleStatus]}`}
            title={`Article: ${cluster.articleStatus}`}
          />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed flex-1">{cluster.summary}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {cluster.keyAccounts.slice(0, 4).map(a => (
            <span key={a} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {a.startsWith('@') ? a : `@${a}`}
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-400">{cluster.postCount} posts</div>
      </div>
    </Link>
  )
}
