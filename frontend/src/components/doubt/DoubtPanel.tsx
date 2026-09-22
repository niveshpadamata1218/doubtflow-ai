import { useState, type FormEvent } from 'react'

import type { DoubtThread } from '../../types/doubt'

type DoubtPanelProps = {
  thread: DoubtThread
  error: string | null
  isSending: boolean
  onClose: () => void
  onSend: (content: string) => void
}

export function DoubtPanel({ thread, error, isSending, onClose, onSend }: DoubtPanelProps) {
  const [content, setContent] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!content.trim() || isSending) {
      return
    }
    onSend(content)
    setContent('')
  }

  return (
    <aside className="doubt-panel" aria-label="Doubt thread">
      <header className="doubt-panel-header">
        <div>
          <span className="eyebrow">Side conversation</span>
          <h2>Explore this thought</h2>
        </div>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close doubt panel">×</button>
      </header>
      <div className="selected-snippet">
        <span className="snippet-label">Selected text</span>
        <blockquote>{thread.selected_text}</blockquote>
      </div>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="doubt-messages" aria-live="polite">
        {thread.messages.length === 0 && <p className="panel-empty">Ask a follow-up about the highlighted passage.</p>}
        {thread.messages.map((message) => (
          <div className={`doubt-message ${message.role}`} key={message.id}>
            <span className="message-meta">{message.role === 'assistant' ? 'Assistant' : 'You'}</span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <form className="doubt-input" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="doubt-content">Doubt question</label>
        <textarea
          id="doubt-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Ask about this passage..."
          rows={2}
          disabled={isSending}
        />
        <button type="submit" disabled={isSending || !content.trim()} aria-label="Send doubt question">↑</button>
      </form>
    </aside>
  )
}
