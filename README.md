# Doubt-Threaded Chat App

A local, ChatGPT-style learning project where an assistant response can open an independent doubt thread from selected text. The main conversation and each doubt thread have separate histories, so a side question does not pollute the main chat context.

This repository is currently at the end of the MVP build: Phases -1 through 10 are implemented. The application is ready for local testing and a first commit.

## What The App Does

- Creates and stores main conversations.
- Sends the main conversation history to a local Ollama model.
- Saves user and assistant messages in MySQL.
- Lets you highlight text in an assistant message.
- Opens a separate doubt thread for that exact selected text.
- Keeps doubt messages out of the main conversation table and prompt.
- Saves doubt threads and lets you reopen their previous history.
- Shows loading and error states in the frontend.

## Development Tools And Technologies

### Frontend

- **React 19:** Builds the interactive chat interface.
- **TypeScript:** Adds types for conversations, messages, and doubt threads.
- **Vite:** Runs the frontend development server and creates production builds.
- **npm:** Installs frontend dependencies and runs scripts.
- **Oxlint:** Checks frontend code quality.
- **CSS:** Provides the responsive chat and side-panel design without an extra UI library.

### Backend

- **Python:** Backend programming language.
- **FastAPI:** Defines HTTP API routes and dependency injection.
- **Uvicorn:** Runs the FastAPI application server.
- **Pydantic Settings:** Loads configuration from environment variables.
- **SQLModel:** Defines Python database models and sessions.
- **SQLAlchemy:** Database engine used underneath SQLModel.
- **PyMySQL:** MySQL database driver.
- **Alembic:** Tracks and applies database schema migrations.

### Local AI And Database

- **Ollama:** Runs the language model locally through HTTP.
- **qwen2.5:0.5b:** The currently configured local model.
- **MySQL:** Stores conversations, messages, doubt threads, and doubt messages.
- **MySQL database:** `aiboot`

### Project Tools And Practices

- **Git:** Version control and commit history.
- **VS Code:** Development environment.
- **Environment variables:** Keep database and service configuration outside source code.
- **Virtual environment:** Keeps Python dependencies isolated from the system Python installation.
- **Alembic migrations:** Ensure database changes are reproducible.

## Project Structure

```text
mybot/
├── PROJECT_SPEC.md              # Architecture, rules, data model, and phase status
├── README.md                    # This setup and development guide
├── .gitignore                   # Excludes secrets, environments, and build output
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app and router registration
│   │   ├── config.py            # Environment-backed configuration
│   │   ├── db/                  # SQLModel engine, sessions, and metadata
│   │   ├── models/              # Conversation, message, and doubt tables
│   │   ├── schemas/             # API request and response models
│   │   ├── routers/             # HTTP endpoints
│   │   └── services/            # Chat, doubt, and Ollama business logic
│   ├── alembic/
│   │   └── versions/            # Database migrations
│   ├── .env.example             # Safe configuration template
│   ├── requirements.txt         # Python dependencies
│   └── alembic.ini              # Alembic configuration
└── frontend/
    ├── src/
    │   ├── api/                 # Backend request functions
    │   ├── components/          # Chat and doubt UI components
    │   ├── hooks/               # Conversation, selection, and doubt state
    │   └── types/               # TypeScript data types
    ├── .env.example             # Vite API URL template
    └── package.json             # Frontend scripts and dependencies
```

## Configuration

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

The local file should contain valid MySQL credentials:

```env
DATABASE_URL=mysql+pymysql://aiboot_user:YOUR_PASSWORD@127.0.0.1:3306/aiboot
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5:0.5b
```

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

It should contain:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Never commit either `.env` file.

## First-Time MySQL Setup

Start MySQL with Homebrew:

```bash
brew services start mysql
```

Open MySQL as an administrative user:

```bash
mysql -u root -p
```

Create the application database and user. Replace the example password with your own password:

```sql
CREATE DATABASE IF NOT EXISTS aiboot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'aiboot_user'@'localhost'
  IDENTIFIED BY 'aiboot_password';

CREATE USER IF NOT EXISTS 'aiboot_user'@'127.0.0.1'
  IDENTIFIED BY 'aiboot_password';

GRANT ALL PRIVILEGES ON aiboot.* TO 'aiboot_user'@'localhost';
GRANT ALL PRIVILEGES ON aiboot.* TO 'aiboot_user'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

Verify the login:

```bash
mysql -u aiboot_user -p -h 127.0.0.1 -P 3306 aiboot -e "SELECT 1 AS mysql_ok;"
```

## First-Time Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Apply the migrations:

```bash
alembic upgrade head
```

Expected migration revisions:

```text
0001_chat
0002_doubts
```

The short revision names are intentional. MySQL's default Alembic version table uses a 32-character column.

If an earlier migration attempt failed after creating tables, clean the incomplete schema once:

```bash
mysql -u aiboot_user -p -h 127.0.0.1 -P 3306 aiboot
```

Then run inside MySQL:

```sql
DROP TABLE IF EXISTS doubt_message;
DROP TABLE IF EXISTS doubt_thread;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS conversation;
DROP TABLE IF EXISTS alembic_version;
EXIT;
```

Then rerun:

```bash
alembic upgrade head
```

## First-Time Ollama Setup

Start Ollama in its own terminal:

```bash
ollama serve
```

In another terminal, download the configured model:

```bash
ollama pull qwen2.5:0.5b
ollama list
```

Only start `ollama serve` if Ollama is not already running.

## Run The Application

Use three terminals.

### Terminal 1: Ollama

```bash
ollama serve
```

### Terminal 2: FastAPI backend

```bash
cd /Users/niveshgowdpadamata/Desktop/Projects/mybot/backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 3: React frontend

```bash
cd /Users/niveshgowdpadamata/Desktop/Projects/mybot/frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173
```

## API Checks

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"status":"ok"}
```

Ollama connection check:

```bash
curl -X POST http://127.0.0.1:8000/debug/llm-test
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

## Validation Commands

Frontend build and lint:

```bash
cd frontend
npm run build
npm run lint
```

Backend compile check:

```bash
cd backend
source .venv/bin/activate
python -m compileall -q app
```

Migration check:

```bash
cd backend
source .venv/bin/activate
alembic current
alembic heads
```

## Current Development Status

- Phase -1: planning and project specification complete.
- Phase 0: frontend and backend scaffolding complete.
- Phase 1: Ollama connection complete.
- Phase 2: MySQL models and first migration complete.
- Phase 3: core chat API complete.
- Phase 4: frontend chat UI complete.
- Phase 5: text selection and Raise Doubt interaction complete.
- Phase 6: doubt database models and migration complete.
- Phase 7: isolated doubt API complete.
- Phase 8: doubt side panel complete.
- Phase 9: doubt history badges and reopening complete.
- Phase 10: loading, error handling, styling, and setup documentation complete.

The next work should be normal testing and small improvements rather than adding another planned MVP phase.

## Commit Checklist

Before committing:

```bash
git status --short
cd frontend && npm run build && npm run lint
cd ../backend && source .venv/bin/activate && python -m compileall -q app
```

Confirm that these are not staged:

```text
backend/.env
frontend/.env
backend/.venv/
frontend/node_modules/
frontend/dist/
```

Because the Git repository currently appears to be rooted at `/Users/niveshgowdpadamata` rather than this project folder, confirm the repository root before staging files:

```bash
git rev-parse --show-toplevel
```

Only stage the intended project files.
