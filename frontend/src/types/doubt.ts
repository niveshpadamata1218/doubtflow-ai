export type DoubtMessage = {
  id: number
  doubt_thread_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type DoubtThread = {
  id: number
  parent_message_id: number
  selected_text: string
  created_at: string
  messages: DoubtMessage[]
}

export type DoubtThreadSummary = Omit<DoubtThread, 'messages'>

export type DoubtMessageResponse = {
  user_message: DoubtMessage
  assistant_message: DoubtMessage
}
