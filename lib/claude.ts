import Anthropic from '@anthropic-ai/sdk'
import type { XPost, Cluster, MediaItem } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface RawCluster {
  name: string
  summary: string
  postIds: string[]
  keyAccounts: string[]
}

export async function clusterPosts(posts: XPost[], sessionId: string): Promise<Cluster[]> {
  const slim = posts.map(p => ({ id: p.id, text: p.text, author: p.author }))

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a collection of X (Twitter) posts to group them into thematic clusters for blog article generation.

Posts JSON:
${JSON.stringify(slim, null, 2)}

Group these posts into 3-7 distinct topic clusters. Each cluster should represent a coherent theme or conversation thread.

Return ONLY valid JSON in this exact format, no other text:
{
  "clusters": [
    {
      "name": "Short descriptive cluster name",
      "summary": "2-3 sentence summary of what this cluster is about and why it matters",
      "postIds": ["id1", "id2", ...],
      "keyAccounts": ["@handle1", "@handle2", ...]
    }
  ]
}

Rules:
- Every post must be assigned to exactly one cluster
- Include the @ prefix for keyAccounts
- keyAccounts should be the 3-5 most influential voices in each cluster
- Cluster names should be specific and descriptive, not generic`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  let parsed: { clusters: RawCluster[] }
  try {
    // Strip any markdown code fences if present
    const clean = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    parsed = JSON.parse(clean)
  } catch {
    throw new Error(`Failed to parse Claude clustering response: ${text.slice(0, 200)}`)
  }

  return parsed.clusters.map((c: RawCluster, i: number) => ({
    id: `cluster_${sessionId}_${i}`,
    name: c.name,
    summary: c.summary,
    postIds: c.postIds,
    keyAccounts: c.keyAccounts || [],
    postCount: c.postIds.length,
    articleStatus: 'none' as const,
  }))
}

export async function generateReport(
  posts: XPost[],
  searchTerms: string[]
): Promise<{ title: string; summary: string; body: string; wordCount: number; mediaItems: MediaItem[] }> {
  const postsFormatted = posts
    .filter(p => !p.isRetweet)
    .slice(0, 80)
    .map(p => `@${p.author} (${p.likes} likes, ${p.retweets} RTs):\n"${p.text}"`)
    .join('\n\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `You are an investigative journalist writing a comprehensive news article based on social media intelligence gathered from X (Twitter).

Search Topics: ${searchTerms.join(', ')}

Source Posts (${posts.length} total):
${postsFormatted}

Write a 1000-2000 word investigative news article that synthesizes all of this social media intelligence into one coherent story.

Requirements:
- FIRST write a single paragraph executive summary (2-4 sentences, no header). This is a TL;DR for readers in a hurry.
- Then write exactly "---" on its own line as a separator.
- Then write the full article starting with an H1 title (# Title)
- Open the article with a compelling lede that hooks the reader immediately
- Identify the major themes, debates, and narratives emerging from these posts
- Quote specific accounts by @handle to support key points
- Write like a real newspaper article — narrative prose, not bullet lists or summaries
- Use H2 headers (## Section) for major narrative sections
- End with a "## What to Watch" section on key developments to monitor
- Weave the tweets into the narrative; do not simply list them

Return only the summary, separator, and Markdown article — no other text.`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  // Split summary from article body on the --- separator
  const sepIndex = raw.indexOf('\n---\n')
  let summary = ''
  let body = raw
  if (sepIndex !== -1) {
    summary = raw.slice(0, sepIndex).trim()
    body = raw.slice(sepIndex + 5).trim()
  }

  const titleMatch = body.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : searchTerms.join(', ')

  // Build structured media items from all posts
  const seenUrls = new Set<string>()
  const mediaItems: MediaItem[] = []
  for (const p of posts) {
    // Video items (actual mp4 URLs take priority)
    for (let i = 0; i < p.videoUrls.length; i++) {
      const videoUrl = p.videoUrls[i]
      if (videoUrl && !seenUrls.has(videoUrl)) {
        seenUrls.add(videoUrl)
        mediaItems.push({
          type: 'video',
          url: videoUrl,
          thumbnailUrl: p.mediaUrls[i], // corresponding thumbnail at same index
          postUrl: p.url,
          author: p.author,
        })
      }
    }
    // Image items (photos only — skip video thumbnails that are already covered)
    const imageUrls = p.videoUrls.length > 0
      ? p.mediaUrls.slice(p.videoUrls.length) // skip thumbnail entries for videos
      : p.mediaUrls
    for (const imgUrl of imageUrls) {
      if (imgUrl && !seenUrls.has(imgUrl)) {
        seenUrls.add(imgUrl)
        mediaItems.push({ type: 'image', url: imgUrl, postUrl: p.url, author: p.author })
      }
    }
  }

  const wordCount = body.split(/\s+/).filter(Boolean).length

  return { title, summary, body, wordCount, mediaItems: mediaItems.slice(0, 20) }
}

export async function generateArticle(
  cluster: Cluster,
  posts: XPost[]
): Promise<{ title: string; body: string; wordCount: number }> {
  const clusterPosts = posts.filter(p => cluster.postIds.includes(p.id))

  const postsFormatted = clusterPosts
    .map(
      p =>
        `@${p.author} (${p.likes} likes, ${p.retweets} RTs):\n"${p.text}"`
    )
    .join('\n\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `You are a skilled journalist writing a long-form blog article based on a collection of X (Twitter) posts.

Cluster Topic: ${cluster.name}
Cluster Summary: ${cluster.summary}

Source Posts:
${postsFormatted}

Write an 800-2000 word blog article that synthesizes these posts into coherent, engaging long-form content.

Requirements:
- Start with an H1 title (# Title)
- Use H2 headers (## Section Name) for major sections
- End with a "## Key Takeaways" section with 4-6 bullet points
- Write in a journalistic but accessible style
- Cite specific accounts by @handle when referencing their ideas
- Do not simply list tweets — synthesize them into narrative prose
- The article should stand alone as a readable piece without requiring Twitter context
- Return only the Markdown article, no preamble or explanation`,
      },
    ],
  })

  const body = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract title from first H1
  const titleMatch = body.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : cluster.name

  const wordCount = body.split(/\s+/).filter(Boolean).length

  return { title, body, wordCount }
}
