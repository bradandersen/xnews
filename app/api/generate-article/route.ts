import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { generateArticle } from '@/lib/claude'
import { getSession, saveSession, saveArticle, getArticle } from '@/lib/storage'
import type { Article } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { clusterId, sessionId } = await req.json()

  if (!clusterId || !sessionId) {
    return NextResponse.json({ error: 'clusterId and sessionId are required' }, { status: 400 })
  }

  // Return cached article if already generated
  const existing = getArticle(clusterId)
  if (existing) return NextResponse.json(existing)

  const session = getSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const cluster = session.clusters.find(c => c.id === clusterId)
  if (!cluster) {
    return NextResponse.json({ error: 'Cluster not found' }, { status: 404 })
  }

  // Mark cluster as generating
  cluster.articleStatus = 'generating'
  saveSession(session)

  try {
    const { title, body, wordCount } = await generateArticle(cluster, session.posts)

    const article: Article = {
      id: uuidv4(),
      clusterId,
      sessionId,
      title,
      body,
      wordCount,
      generatedAt: new Date().toISOString(),
    }

    saveArticle(article)

    cluster.articleStatus = 'done'
    saveSession(session)

    return NextResponse.json(article)
  } catch (error) {
    cluster.articleStatus = 'none'
    saveSession(session)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
