import { useEffect } from 'react'
import { ChatWindow } from './components/chat/ChatWindow'
import { DoubtPanel } from './components/doubt/DoubtPanel'
import { MessageInput } from './components/chat/MessageInput'
import { useConversation } from './hooks/useConversation'
import { useDoubtThread } from './hooks/useDoubtThread'
import './App.css'

function App() {
  const {
    error,
    isInitializing,
    isSending,
    messages,
    send,
    conversations,
    activeConversationId,
    selectConversation,
    newConversation,
  } = useConversation()
  const doubt = useDoubtThread()

  useEffect(() => {
    if (activeConversationId !== null) {
      void doubt.loadHistory(activeConversationId)
    }
  }, [activeConversationId])

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><div className="brand-mark">D</div><strong>DeepThink</strong></div>
        <button className="new-chat-button" type="button" onClick={() => void newConversation()}><span>+</span> New chat</button>
        <div className="history-section">
          <span className="history-label">Recent chats</span>
          <div className="history-list">
            {conversations.map((conversation) => (
              <button className={`history-item ${conversation.id === activeConversationId ? 'active' : ''}`} key={conversation.id} type="button" onClick={() => void selectConversation(conversation.id)}>
                <span className="history-icon">◌</span><span>{conversation.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="history-section doubt-history">
          <span className="history-label">Doubt chats</span>
          <div className="history-list">
            {doubt.history.length === 0 && <span className="history-empty">Highlight a reply to start one.</span>}
            {doubt.history.map((thread) => (
              <button className={`history-item ${thread.id === doubt.thread?.id ? 'active' : ''}`} key={thread.id} type="button" onClick={() => void doubt.openExisting(thread.id)}>
                <span className="history-icon">?</span><span>{thread.selected_text}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-footer"><span className="avatar">D</span><span>Local session</span><span className="status-dot" /></div>
      </aside>

      <main className="main-area">
        <header className="chat-header">
          <div><span className="header-kicker">DeepThink / Chat</span><h1>{activeConversation?.title || 'New conversation'}</h1></div>
          <span className="message-count">{messages.length} messages</span>
        </header>
        <section className="chat-card">
          {error && <div className="error-banner" role="alert">{error}</div>}
          <ChatWindow messages={messages} isLoading={isInitializing || isSending} onRaiseDoubt={doubt.openForSelection} doubtRefreshKey={doubt.refreshKey} onOpenDoubt={doubt.openExisting} />
          <MessageInput disabled={isInitializing || isSending} onSend={send} />
        </section>
        {doubt.isOpening && <div className="doubt-loading">Opening doubt thread...</div>}
        {doubt.error && !doubt.thread && <div className="error-banner" role="alert">{doubt.error}</div>}
        {doubt.thread && (
          <DoubtPanel
            thread={doubt.thread}
            error={doubt.error}
            isSending={doubt.isSending}
            onClose={doubt.close}
            onSend={doubt.send}
          />
        )}
      </main>
    </div>
  )
}

export default App
