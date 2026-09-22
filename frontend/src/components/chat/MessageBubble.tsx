import { useRef } from 'react'

import { DoubtTooltip } from '../doubt/DoubtTooltip'
import { DoubtBadge } from '../doubt/DoubtBadge'
import { useSelection } from '../../hooks/useSelection'
import type { Message } from '../../types/chat'

type MessageBubbleProps = {
  message: Message
  onRaiseDoubt: (parentMessageId: number, selectedText: string) => void
  doubtRefreshKey: number
  onOpenDoubt: (threadId: number) => void
}

export function MessageBubble({ message, onRaiseDoubt, doubtRefreshKey, onOpenDoubt }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'
  const bubbleRef = useRef<HTMLDivElement>(null)
  const { selection, clearSelection } = useSelection(bubbleRef, isAssistant)

  function handleRaiseDoubt() {
    if (!selection) {
      return
    }
    onRaiseDoubt(message.id, selection.text)
    clearSelection()
  }

  return (
    <article className={`message-row ${message.role}`}>
      <div className="message-meta">{isAssistant ? 'Assistant' : 'You'}</div>
      <div className="message-bubble" ref={bubbleRef}>{message.content}</div>
      {isAssistant && (
        <DoubtBadge messageId={message.id} refreshKey={doubtRefreshKey} onOpen={onOpenDoubt} />
      )}
      {selection && (
        <DoubtTooltip
          left={Math.max(12, Math.min(selection.rect.left, window.innerWidth - 150))}
          top={selection.rect.bottom + 8}
          onRaise={handleRaiseDoubt}
        />
      )}
    </article>
  )
}
