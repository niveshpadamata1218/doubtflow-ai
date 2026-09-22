# Doubt-Threaded Chat App Project Specification

## 1. Project Summary

This project is a ChatGPT-style chat application. A specific highlighted portion of an assistant message can spawn an independent "doubt thread": a scoped side-conversation about only that selected snippet. Doubt threads are saved and can be reopened later. Doubt-thread messages must never be added to the main chat's message history or sent as part of the main conversation context.

This specification is the source of truth for the project. Development is performed phase by phase, in order, and only the currently requested phase may be implemented.

## 2. Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Python + FastAPI
- Database: MySQL, database name `aiboot`
- ORM and data models: SQLModel
- Database migrations: Alembic
- Local LLM inference: Ollama
- Configuration: environment variables loaded with `pydantic-settings` or `python-dotenv`
- Database URL format: `mysql+pymysql://<user>:<password>@<host>:<port>/aiboot`
- LLM integration: one centralized backend service function in `llm_service.py`

### Explicit Database Deviation

The original reference architecture named PostgreSQL. This project uses MySQL instead, as requested. SQLModel and Alembic remain unchanged at the application architecture level. MySQL-specific connection configuration and the appropriate MySQL driver will be introduced only in the database phase.

## 3. Full Project File Structure

### Backend (`backend/`)

```
backend/
├── app/
│   ├── main.py                  # FastAPI app instance; mounts all routers; startup/shutdown
│   ├── config.py                # Loads env vars: MySQL DB URL, Ollama host, model name
│   ├── db/
│   │   ├── session.py           # MySQL engine + get_session() dependency for routes
│   │   └── base.py              # SQLModel metadata import point (used by Alembic)
│   ├── models/                  # Database table definitions (SQLModel)
│   │   ├── conversation.py      # Conversation table
│   │   ├── message.py           # Message table (main chat)
│   │   ├── doubt_thread.py      # DoubtThread table
│   │   └── doubt_message.py     # DoubtMessage table
│   ├── schemas/                 # Request/response shapes (Pydantic), separate from DB models
│   │   ├── chat.py
│   │   └── doubt.py
│   ├── routers/                 # HTTP endpoints only - no business logic here
│   │   ├── health.py            # /health
│   │   ├── chat.py              # /conversations, /conversations/{id}/messages
│   │   └── doubts.py            # /messages/{id}/doubts, /doubts/{id}/messages
│   └── services/                # All business logic lives here, not in routers
│       ├── llm_service.py       # The ONLY place that talks to Ollama
│       ├── chat_service.py      # Assembles main-chat history, saves messages
│       └── doubt_service.py     # Assembles isolated doubt context, saves doubt messages
├── alembic/
│   ├── versions/                # One file per migration
│   └── env.py
├── alembic.ini
├── requirements.txt             # Python dependencies, including MySQL support
├── .env.example                 # MySQL DB URL, Ollama host, and model name placeholders
└── README.md
```

### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── main.tsx                 # React app entry point
│   ├── App.tsx                  # Top-level layout: chat window + doubt panel slot
│   ├── api/
│   │   ├── client.ts            # Base fetch wrapper (backend URL, error handling)
│   │   ├── chatApi.ts           # Functions calling chat endpoints
│   │   └── doubtApi.ts          # Functions calling doubt endpoints
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx   # Main message list + scroll behavior
│   │   │   ├── MessageBubble.tsx # Single message; hosts text-selection detection
│   │   │   └── MessageInput.tsx  # Main chat input box
│   │   └── doubt/
│   │       ├── DoubtTooltip.tsx # "Raise Doubt" floating button on selection
│   │       ├── DoubtPanel.tsx    # Side panel: pinned snippet + its own message list/input
│   │       └── DoubtBadge.tsx    # Doubt count indicator under a message
│   ├── hooks/
│   │   ├── useSelection.ts      # Detects text selection inside assistant bubbles
│   │   ├── useConversation.ts    # State/logic for the main chat
│   │   └── useDoubtThread.ts     # State/logic for one open doubt thread
│   ├── types/
│   │   ├── chat.ts              # TypeScript types: Conversation, Message
│   │   └── doubt.ts             # TypeScript types: DoubtThread, DoubtMessage
│   └── styles/                  # CSS
├── index.html
├── package.json
├── vite.config.ts
└── .env.example                 # VITE_API_BASE_URL
```

## 4. Data Model

### Conversation

- `id`: integer primary key
- `title`: string
- `created_at`: timestamp
- Relationship: one conversation has many main-chat `Message` records

### Message

- `id`: integer primary key
- `conversation_id`: integer foreign key to `Conversation`
- `role`: string or enum containing `user` or `assistant`
- `content`: text
- `created_at`: timestamp
- Relationship: belongs to one conversation and may have many `DoubtThread` records

### DoubtThread

- `id`: integer primary key
- `parent_message_id`: integer foreign key to the exact parent `Message` where the doubt was raised
- `selected_text`: text containing the highlighted assistant text
- `created_at`: timestamp
- Relationship: belongs to one parent message and has many `DoubtMessage` records

### DoubtMessage

- `id`: integer primary key
- `doubt_thread_id`: integer foreign key to `DoubtThread`
- `role`: string or enum containing `user` or `assistant`
- `content`: text
- `created_at`: timestamp
- Relationship: belongs to one doubt thread

Doubt context is isolated. When generating a doubt response, the backend may use the parent message's `selected_text` and that doubt thread's own `DoubtMessage` records. It must not read the main conversation's other messages for that request.

## 5. Working Rules For All Future Changes

- Only modify files relevant to the specific phase or feature currently requested.
- Never restructure, rename, move, or delete existing files unless explicitly asked to.
- Never introduce a new dependency/library without asking first.
- All LLM calls must go through the single `llm_service` function - never call Ollama directly from a router or component.
- Doubt-thread logic must stay fully separate from main-chat logic, and must never write to or read from the main conversation's messages.
- After completing any phase, append a short entry to an "Implementation status" section at the bottom of this file noting what was completed, so future sessions can see project state at a glance without re-reading all the code.

## Phase Boundaries

- Implement exactly one phase per session request.
- Do not implement future-phase features speculatively.
- Stop after the requested phase is complete and explain what was built, why it was built, what changed, how the request/data flows, and the important concepts introduced.
- Before each phase, read this specification and the current project structure.
- Before continuing to the next phase, verify the current phase using its checklist.

## Implementation Status

- Phase -1 completed: created the project specification and locked the database choice to MySQL database `aiboot`.
- Phase 0 completed: created the React/Vite frontend, FastAPI backend, `/health` endpoint, environment templates, and root setup README.
- Phase 1 completed: added the centralized Ollama service and verified `/debug/llm-test` with the local `qwen2.5:0.5b` model.
- Phase 2 completed: added SQLModel Conversation and Message models, MySQL session wiring, and the initial Alembic migration for database `aiboot`. Migration application is pending valid local MySQL credentials.
- Phase 3 completed: added conversation creation, multi-turn message sending with persisted LLM replies, conversation history retrieval, and chat schemas/services. Live MySQL verification remains pending valid local credentials.
- Phase 4 completed: added the React chat UI, API client, conversation hook, loading/error states, and local FastAPI CORS support.
- Phase 5 completed: added assistant-only text selection detection and the temporary Raise Doubt tooltip with console logging.
- Phase 6 completed: added DoubtThread and DoubtMessage models, relationships, metadata registration, and the second Alembic migration.
- Phase 7 completed: added isolated doubt-thread schemas, service logic, routes, and verified independent thread histories without main-message writes.
- Phase 8 completed: wired selection to doubt-thread creation, added the side-panel UI and isolated doubt input flow. Live database-backed browser verification remains pending valid local MySQL credentials.
- Phase 9 completed: added saved doubt counts beneath assistant messages and reopening of existing doubt threads with their full history.
- Phase 10 completed: finalized loading/error handling, environment templates, and complete local setup and run instructions.
- Migration fix completed: shortened Alembic revision IDs to fit MySQL's 32-character `alembic_version.version_num` column after the first live migration attempt exposed the limit.
