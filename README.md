# XNews

Turn X (Twitter) posts into reporter-style news articles using Claude AI.

Enter one or more search terms, XNews scrapes recent X posts via Apify, then Claude synthesizes them into a clean, readable article.

## Features

- Search X posts by topic or keyword
- AI-generated news articles from scraped posts
- Session history with past searches and articles
- File-based storage (no database required)

## Tech Stack

- **Next.js 16** with App Router
- **Claude AI** (`claude-sonnet-4-6`) for article generation
- **Apify** (`apidojo/tweet-scraper`) for X post scraping
- **Tailwind CSS** with Typography plugin

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```
APIFY_TOKEN=apify_api_...
ANTHROPIC_API_KEY=sk-ant-...
```

**Apify:** Sign up at [apify.com](https://apify.com) and get an API token from Settings → Integrations → API tokens. A paid plan is required.

**Anthropic:** Get an API key from [console.anthropic.com](https://console.anthropic.com).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Enter one or more search terms (e.g. `AI`, `climate change`)
2. Click **Generate** — XNews fetches recent posts and writes an article
3. View the article and browse the source posts
4. Past sessions are saved and accessible from the dashboard

## Project Structure

```
app/
  api/
    fetch-posts/      # Fetches posts and triggers article generation
    generate-article/ # Generates article for a cluster
    sessions/         # Session data API
  sessions/[sessionId]/
    page.tsx          # Session detail + article view
    clusters/[clusterId]/
      page.tsx        # Individual cluster article view
  page.tsx            # Dashboard
components/
  SearchForm.tsx      # Search input with topic suggestions
  SessionCard.tsx     # Past session summary card
  ArticleViewer.tsx   # Rendered article with source posts
  ClusterCard.tsx     # Cluster summary card
  PostList.tsx        # List of X posts
  PostItem.tsx        # Individual post
lib/
  apify.ts            # Apify tweet scraper integration
  claude.ts           # Claude article generation
  storage.ts          # File-based session/article storage
  types.ts            # TypeScript interfaces
data/                 # Session and article JSON files (gitignored)
```
