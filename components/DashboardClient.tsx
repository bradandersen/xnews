'use client'

import { useRef } from 'react'
import SearchForm, { SearchFormHandle } from '@/components/SearchForm'
import TopicBrowser from '@/components/TopicBrowser'

interface Props {
  topics: string[]
}

export default function DashboardClient({ topics }: Props) {
  const formRef = useRef<SearchFormHandle>(null)

  return (
    <>
      <div className="mb-6">
        <SearchForm ref={formRef} topics={topics} />
      </div>
      <div className="mb-10">
        <TopicBrowser onSelect={topic => formRef.current?.addTopic(topic)} />
      </div>
    </>
  )
}
