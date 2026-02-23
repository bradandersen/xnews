import fs from 'fs'
import path from 'path'
import type { Session, Article } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions')
const ARTICLES_DIR = path.join(DATA_DIR, 'articles')

function ensureDirs() {
  for (const dir of [DATA_DIR, SESSIONS_DIR, ARTICLES_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  }
}

export function saveSession(session: Session): void {
  ensureDirs()
  const filePath = path.join(SESSIONS_DIR, `${session.id}.json`)
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2))
}

export function getSession(sessionId: string): Session | null {
  const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function listSessions(): Session[] {
  ensureDirs()
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'))
  return files
    .map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, f), 'utf-8')) as Session
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()) as Session[]
}

export function deleteSession(sessionId: string): void {
  const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

export function saveArticle(article: Article): void {
  ensureDirs()
  const filePath = path.join(ARTICLES_DIR, `${article.clusterId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(article, null, 2))
}

export function getTopTopics(limit = 50): string[] {
  const sessions = listSessions()
  const scores = new Map<string, number>()

  for (const session of sessions) {
    for (const post of session.posts) {
      const matches = post.text.match(/(?:#|\$)([A-Za-z][A-Za-z0-9_]{1,})/g) || []
      if (matches.length === 0) continue
      // Weight by engagement so high-signal posts push topics up
      const engagement = post.likes + post.retweets * 2 + post.replies + 1
      for (const match of matches) {
        const topic = match.toUpperCase()
        scores.set(topic, (scores.get(topic) ?? 0) + engagement)
      }
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic]) => topic)
}

export function getArticle(clusterId: string): Article | null {
  const filePath = path.join(ARTICLES_DIR, `${clusterId}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function listArticles(): Article[] {
  ensureDirs()
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'))
  return files
    .map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8')) as Article
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b!.generatedAt).getTime() - new Date(a!.generatedAt).getTime()) as Article[]
}
