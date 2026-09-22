import { request } from './client'
import type { DoubtMessageResponse, DoubtThread, DoubtThreadSummary } from '../types/doubt'

export function createDoubtThread(parentMessageId: number, selectedText: string) {
  return request<DoubtThread>(`/messages/${parentMessageId}/doubts`, {
    method: 'POST',
    body: JSON.stringify({ selected_text: selectedText }),
  })
}

export function sendDoubtMessage(threadId: number, content: string) {
  return request<DoubtMessageResponse>(`/doubts/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function getDoubtThread(threadId: number) {
  return request<DoubtThread>(`/doubts/${threadId}`)
}

export function getDoubtThreads(parentMessageId: number) {
  return request<DoubtThreadSummary[]>(`/messages/${parentMessageId}/doubts`)
}

export function getConversationDoubtThreads(conversationId: number) {
  return request<DoubtThreadSummary[]>(`/conversations/${conversationId}/doubts`)
}
