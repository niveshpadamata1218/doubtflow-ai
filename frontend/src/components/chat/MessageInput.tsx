import { useState } from 'react'

type MessageInputProps = {
  disabled: boolean
  onSend: (content: string) => void
}

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [content, setContent] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!content.trim() || disabled) {
      return
    }
    onSend(content)
    setContent('')
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="message-content">Message</label>
      <textarea
        id="message-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Ask anything..."
        rows={1}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }
        }}
      />
      <button type="submit" disabled={disabled || !content.trim()} aria-label="Send message">
        <span aria-hidden="true">↑</span>
      </button>
    </form>
  )
}
