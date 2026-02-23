import { ApifyClient } from 'apify-client'
import type { XPost } from './types'

export async function fetchTweets(searchTerms: string[], maxItems = 100): Promise<XPost[]> {
  const token = process.env.APIFY_TOKEN
  if (!token) throw new Error('APIFY_TOKEN is not set')

  const client = new ApifyClient({ token })

  const query = searchTerms.join(' OR ')

  const run = await client.actor('apidojo/tweet-scraper').call({
    searchTerms: [query],
    maxItems,
    sort: 'Latest',
    tweetLanguage: 'en',
  })

  console.log('Apify run status:', run.status)
  console.log('Apify dataset ID:', run.defaultDatasetId)

  const { items } = await client.dataset(run.defaultDatasetId).listItems()
  console.log('Apify items count:', items.length)
  if (items.length > 0) console.log('First item keys:', Object.keys(items[0]))

  const posts: XPost[] = []
  const seen = new Set<string>()

  for (const item of items as Record<string, unknown>[]) {
    const id = String(item.id || item.tweet_id || item.tweetId || '')
    if (!id || seen.has(id)) continue
    seen.add(id)

    const authorObj = item.author as Record<string, unknown> | undefined
    const userObj = item.user as Record<string, unknown> | undefined

    const author =
      authorObj?.userName ||
      authorObj?.username ||
      userObj?.screen_name ||
      item.username ||
      item.user_name ||
      'unknown'

    const authorName =
      authorObj?.name ||
      userObj?.name ||
      item.fullName ||
      item.full_name ||
      author

    // Extract photo/video thumbnail URLs from media field
    const mediaUrls: string[] = []
    const mediaItems = (item.media as Record<string, unknown>[] | undefined) || []
    for (const m of mediaItems) {
      if (m.type === 'photo') {
        const url = String(m.url || m.fullUrl || m.media_url_https || '')
        if (url) mediaUrls.push(url)
      } else if (m.type === 'video' || m.type === 'animated_gif') {
        const thumb = String(m.thumbnailUrl || m.preview_image_url || m.media_url_https || '')
        if (thumb) mediaUrls.push(thumb)
      }
    }

    posts.push({
      id,
      text: String(item.text || item.full_text || item.tweet_text || ''),
      author: String(author),
      authorName: String(authorName),
      likes: Number(item.likeCount || item.like_count || item.favorites || item.favorite_count || 0),
      retweets: Number(item.retweetCount || item.retweet_count || 0),
      replies: Number(item.replyCount || item.reply_count || 0),
      date: String(item.createdAt || item.created_at || new Date().toISOString()),
      url: String(item.url || item.tweet_url || `https://x.com/i/web/status/${id}`),
      isRetweet: Boolean(item.isRetweet || item.is_retweet || item.retweeted_status),
      mediaUrls,
    })
  }

  return posts
}
