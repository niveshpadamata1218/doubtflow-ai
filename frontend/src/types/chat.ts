export type MessageRole = 'user' | 'assistant'

export type Message = {
  id: number
  conversation_id: number
  role: MessageRole
  content: string
  created_at: string
}

export type Conversation = {
  id: number
  title: string
  created_at: string
  messages: Message[]
}

export type ConversationSummary = Omit<Conversation, 'messages'>

export type SendMessageResponse = {
  user_message: Message
  assistant_message: Message
}
