'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  topics?: string[]
}

export default function SearchForm({ topics = [] }: Props) {
  const router = useRouter()
  const [terms, setTerms] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addTopic(topic: string) {
    const clean = topic.replace(/^[#$]/, '')
    if (clean && !terms.includes(clean)) {
      setTerms(prev => [...prev, clean])
    }
  }

  function addTerm() {
    const trimmed = input.trim()
    if (trimmed && !terms.includes(trimmed)) {
      setTerms(prev => [...prev, trimmed])
    }
    setInput('')
  }

  function removeTerm(term: string) {
    setTerms(prev => prev.filter(t => t !== term))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTerm()
    } else if (e.key === 'Backspace' && input === '' && terms.length > 0) {
      setTerms(prev => prev.slice(0, -1))
    }
  }

  async function handleSubmit() {
    if (terms.length === 0) {
      setError('Add at least one search term')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/fetch-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerms: terms }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch posts')
      router.push(`/sessions/${data.sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Search X Posts</h2>

      <div className="flex flex-wrap gap-2 items-center border border-gray-300 rounded-lg px-3 py-2 min-h-[46px] focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-300 mb-3">
        {terms.map(term => (
          <span
            key={term}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded-full"
          >
            {term}
            <button
              type="button"
              onClick={() => removeTerm(term)}
              className="text-blue-500 hover:text-blue-700 font-bold leading-none"
            >
              x
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTerm}
          placeholder={terms.length === 0 ? 'Type a topic and press Enter...' : 'Add another...'}
          className="flex-1 min-w-[150px] outline-none text-sm bg-transparent"
          disabled={loading}
        />
      </div>

      <p className="text-xs text-gray-400 mb-4">Press Enter or comma to add a term. Multiple terms are OR-joined.</p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || terms.length === 0}
        className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Fetching & writing (this may take 2-3 minutes)...' : 'Fetch & Write Report'}
      </button>

      {topics.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-gray-400 mb-2">Trending topics from your sessions</p>
          <div className="flex flex-wrap gap-1.5">
            {topics.map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => addTopic(topic)}
                disabled={loading}
                className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
