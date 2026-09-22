import { useEffect, useRef } from 'react'

import type { Message } from '../../types/chat'
import { MessageBubble } from './MessageBubble'

type ChatWindowProps = {
  messages: Message[]
  isLoading: boolean
  onRaiseDoubt: (parentMessageId: number, selectedText: string) => void
  doubtRefreshKey: number
  onOpenDoubt: (threadId: number) => void
}

export function ChatWindow({ messages, isLoading, onRaiseDoubt, doubtRefreshKey, onOpenDoubt }: ChatWindowProps) {
  const endOfMessages = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <main className="chat-window" aria-live="polite">
      {messages.length === 0 && !isLoading && (
        <div className="empty-chat">
          <span className="eyebrow">A quiet place to think</span>
          <h2>What are you curious about?</h2>
          <p>Ask a question and build the conversation one thoughtful turn at a time.</p>
        </div>
      )}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onRaiseDoubt={onRaiseDoubt}
          doubtRefreshKey={doubtRefreshKey}
          onOpenDoubt={onOpenDoubt}
        />
      ))}
      {isLoading && (
        <div className="message-row assistant">
          <div className="message-meta">Assistant</div>
          <div className="message-bubble typing">Thinking<span aria-hidden="true">...</span></div>
        </div>
      )}
      <div ref={endOfMessages} />
    </main>
  )
}
