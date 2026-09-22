import { useEffect, useState } from 'react'

import { getDoubtThreads } from '../../api/doubtApi'
import type { DoubtThreadSummary } from '../../types/doubt'

type DoubtBadgeProps = {
  messageId: number
  refreshKey: number
  onOpen: (threadId: number) => void
}

export function DoubtBadge({ messageId, refreshKey, onOpen }: DoubtBadgeProps) {
  const [threads, setThreads] = useState<DoubtThreadSummary[]>([])

  useEffect(() => {
    let active = true
    getDoubtThreads(messageId)
      .then((result) => {
        if (active) {
          setThreads(result)
        }
      })
      .catch(() => {
        if (active) {
          setThreads([])
        }
      })

    return () => {
      active = false
    }
  }, [messageId, refreshKey])

  if (threads.length === 0) {
    return null
  }

  return (
    <div className="doubt-badge-list" aria-label={`${threads.length} saved doubt threads`}>
      <span className="doubt-count">💬 {threads.length} {threads.length === 1 ? 'Doubt' : 'Doubts'}</span>
      {threads.map((thread) => (
        <button key={thread.id} type="button" onClick={() => onOpen(thread.id)}>
          {thread.selected_text}
        </button>
      ))}
    </div>
  )
}
