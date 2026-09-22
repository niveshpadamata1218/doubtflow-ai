import { useState } from 'react'

import { createDoubtThread, getConversationDoubtThreads, getDoubtThread, sendDoubtMessage } from '../api/doubtApi'
import type { DoubtThread, DoubtThreadSummary } from '../types/doubt'

export function useDoubtThread() {
  const [thread, setThread] = useState<DoubtThread | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [history, setHistory] = useState<DoubtThreadSummary[]>([])

  async function loadHistory(conversationId: number) {
    try {
      setHistory(await getConversationDoubtThreads(conversationId))
    } catch {
      setHistory([])
    }
  }

  async function openForSelection(parentMessageId: number, selectedText: string) {
    setError(null)
    setIsOpening(true)
    try {
      const createdThread = await createDoubtThread(parentMessageId, selectedText)
      setThread(createdThread)
      setHistory((current) => [createdThread, ...current])
      setRefreshKey((current) => current + 1)
    } catch {
      setError('Could not open a doubt thread.')
    } finally {
      setIsOpening(false)
    }
  }

  async function openExisting(threadId: number) {
    setError(null)
    setIsOpening(true)
    try {
      setThread(await getDoubtThread(threadId))
    } catch {
      setError('Could not reopen that doubt thread.')
    } finally {
      setIsOpening(false)
    }
  }

  async function send(content: string) {
    const trimmedContent = content.trim()
    if (!thread || !trimmedContent || isSending) {
      return
    }

    setError(null)
    setIsSending(true)
    try {
      const result = await sendDoubtMessage(thread.id, trimmedContent)
      setThread((currentThread) => currentThread && {
        ...currentThread,
        messages: [...currentThread.messages, result.user_message, result.assistant_message],
      })
    } catch {
      setError('Could not send the doubt question.')
    } finally {
      setIsSending(false)
    }
  }

  function close() {
    setThread(null)
    setError(null)
  }

  return {
    thread,
    error,
    isOpening,
    isSending,
    refreshKey,
    history,
    loadHistory,
    openForSelection,
    openExisting,
    send,
    close,
  }
}
