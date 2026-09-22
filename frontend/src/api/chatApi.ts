import { request } from './client'
import type { Conversation, ConversationSummary, SendMessageResponse } from '../types/chat'

export function listConversations() {
  return request<ConversationSummary[]>('/conversations')
}

export function createConversation(title = 'New conversation') {
  return request<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function sendMessage(conversationId: number, content: string) {
  return request<SendMessageResponse>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function getConversation(conversationId: number) {
  return request<Conversation>(`/conversations/${conversationId}`)
}
