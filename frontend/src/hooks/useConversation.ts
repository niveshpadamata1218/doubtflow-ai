import { useEffect, useRef, useState } from 'react'

import { createConversation, getConversation, listConversations, sendMessage } from '../api/chatApi'
import type { ConversationSummary, Message } from '../types/chat'

export function useConversation() {
  const conversationId = useRef<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (conversationId.current !== null) {
      return
    }

    let active = true
    listConversations()
      .then(async (recentConversations) => {
        if (!active) return
        if (recentConversations.length > 0) {
          setConversations(recentConversations)
          const conversation = await getConversation(recentConversations[0].id)
          if (!active) return
          conversationId.current = conversation.id
          setActiveConversationId(conversation.id)
          setMessages(conversation.messages)
          return
        }
        return createConversation()
      })
      .then((conversation) => {
        if (!conversation || !active) return
        setConversations([conversation])
        conversationId.current = conversation.id
        setActiveConversationId(conversation.id)
      })
      .catch(() => {
        if (active) {
          setError('Could not load your conversations.')
        }
      })
      .finally(() => {
        if (active) {
          setIsInitializing(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function send(content: string) {
    const trimmedContent = content.trim()
    if (!trimmedContent || conversationId.current === null || isSending) {
      return
    }

    setError(null)
    setIsSending(true)
    try {
      const result = await sendMessage(conversationId.current, trimmedContent)
      setMessages((currentMessages) => [
        ...currentMessages,
        result.user_message,
        result.assistant_message,
      ])
      setConversations((current) => current.map((conversation) => (
        conversation.id === conversationId.current && conversation.title === 'New conversation'
          ? { ...conversation, title: trimmedContent.slice(0, 42) }
          : conversation
      )))
    } catch {
      setError('Could not send your message.')
    } finally {
      setIsSending(false)
    }
  }

  async function selectConversation(id: number) {
    if (id === activeConversationId || isSending) return
    setError(null)
    setIsInitializing(true)
    try {
      const conversation = await getConversation(id)
      conversationId.current = conversation.id
      setActiveConversationId(conversation.id)
      setMessages(conversation.messages)
    } catch {
      setError('Could not open that conversation.')
    } finally {
      setIsInitializing(false)
    }
  }

  async function newConversation() {
    if (isSending) return
    setError(null)
    try {
      const conversation = await createConversation()
      conversationId.current = conversation.id
      setActiveConversationId(conversation.id)
      setMessages([])
      setConversations((current) => [conversation, ...current])
    } catch {
      setError('Could not start a conversation.')
    }
  }

  return {
    messages,
    error,
    isInitializing,
    isSending,
    conversations,
    activeConversationId,
    selectConversation,
    newConversation,
    send,
  }
}
