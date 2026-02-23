import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { fetchTweets } from '@/lib/apify'
import { generateReport } from '@/lib/claude'
import { saveSession, saveArticle } from '@/lib/storage'
import type { Session } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { searchTerms } = await req.json()

  if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) {
    return NextResponse.json({ error: 'searchTerms array is required' }, { status: 400 })
  }

  const sessionId = uuidv4()

  const session: Session = {
    id: sessionId,
    createdAt: new Date().toISOString(),
    searchTerms,
    status: 'fetching',
    posts: [],
    clusters: [],
    totalPosts: 0,
  }

  saveSession(session)

  try {
    // Fetch posts from Apify
    const posts = await fetchTweets(searchTerms)

    session.posts = posts
    session.totalPosts = posts.length
    session.status = 'writing'
    saveSession(session)

    if (posts.length === 0) {
      session.status = 'done'
      saveSession(session)
      return NextResponse.json({ sessionId })
    }

    // Generate single reporter-style article from all posts
    const report = await generateReport(posts, searchTerms)
    const reportId = `report_${sessionId}`

    saveArticle({
      id: reportId,
      clusterId: reportId,
      sessionId,
      title: report.title,
      summary: report.summary,
      body: report.body,
      wordCount: report.wordCount,
      generatedAt: new Date().toISOString(),
      mediaItems: report.mediaItems,
    })

    session.reportId = reportId
    session.status = 'done'
    saveSession(session)

    return NextResponse.json({ sessionId })
  } catch (error) {
    session.status = 'error'
    session.error = error instanceof Error ? error.message : String(error)
    saveSession(session)

    return NextResponse.json(
      { error: session.error },
      { status: 500 }
    )
  }
}
