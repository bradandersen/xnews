'use client'

import { useState } from 'react'
import { DEFAULT_TOPICS } from '@/lib/defaultTopics'

interface Props {
  onSelect: (topic: string) => void
}

export default function TopicBrowser({ onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState(DEFAULT_TOPICS[0].category)

  const current = DEFAULT_TOPICS.find(g => g.category === activeCategory)!

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Browse Topics</h2>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {DEFAULT_TOPICS.map(({ category }) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeCategory === category
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {current.topics.map(topic => (
          <button
            key={topic}
            onClick={() => onSelect(topic)}
            className="text-sm px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}
