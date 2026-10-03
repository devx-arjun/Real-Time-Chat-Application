# LinkUp

### Connect. Discover. Talk.

**LinkUp** is a real-time social platform for discovering communities, joining conversations, and connecting with people.

Create a guest profile, explore **Spaces**, join conversations, or start a private chat — all with real-time communication powered by WebSockets.

---

## ✦ What is LinkUp?

LinkUp brings communities and conversations into one simple place.

**Spaces** give people a place to gather around shared interests. Inside a Space, users can discover and join conversations, while private conversations make it easy to connect directly with others.

The goal is simple:

> **Find people. Join the conversation. Connect.**

---

## ✨ Features

### 👤 Guest Profiles

Users can quickly create a guest profile without a traditional account registration flow.

Guest identity is persisted locally and validated against the backend.

### 🌐 Spaces

Create and explore communities around shared interests.

Spaces provide a higher-level place for people to discover and participate in conversations.

### 💬 Conversations

Join conversations inside Spaces and communicate in real time.

### 🔒 Private Conversations

Create private conversations and invite other users using a generated **6-character join code**.

### ⚡ Real-Time Messaging

Messages are delivered instantly through WebSockets without requiring page refreshes.

### 😀 Reactions

React to messages in real time.

### ⌨️ Typing Indicators

See when another participant is typing.

### 📱 Responsive UI

The interface is designed for desktop and mobile layouts, including a dedicated full-screen mobile chat experience.

---

## ⚡ Real-Time Architecture

```text
┌──────────────────────┐
│   React + Vite       │
│   TypeScript         │
└──────────┬───────────┘
           │
           │ HTTPS / WSS
           ▼
┌──────────────────────┐
│ Express + TypeScript │
│                      │
│ REST API             │
│ WebSocket Server     │
└──────────┬───────────┘
           │
           │ Prisma 7
           ▼
┌──────────────────────┐
│     PostgreSQL       │
└──────────────────────┘
```

The REST API handles persistent application data, while WebSockets provide real-time communication for:

* Messages
* Message editing and deletion
* Typing indicators
* Reactions
* Conversation updates
* Participant updates

---

## 🛠️ Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* React Router
* Tailwind CSS
* Axios
* Lucide React

### Backend

* Node.js
* Express 5
* TypeScript
* WebSocket (`ws`)
* CORS
* Cookie Parser

### Database

* PostgreSQL
* Prisma 7
* `pg`
* `@prisma/adapter-pg`

### Development

* Docker
* Docker Compose
* Git
* GitHub

---

## 📁 Project Structure

```text
LinkUp/
│
├── client/                 # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Express + WebSocket backend
│   ├── src/
│   ├── prisma/
│   ├── prisma.config.ts
│   └── package.json
│
├── docker-compose.yml      # Local PostgreSQL
├── .gitignore
└── README.md
```

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/devx-arjun/Real-Time-Chat-Application.git
cd Real-Time-Chat-Application
```

### 2. Start PostgreSQL

Start the local PostgreSQL database with Docker Compose:

```bash
docker compose up -d
```

Check that the container is running:

```bash
docker compose ps
```

### 3. Configure the backend

Move into the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create:

```text
server/.env
```

Add:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/linkup"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

> Keep `.env` files out of Git. Use `.env.example` for shareable configuration templates.

### 4. Set up Prisma

Apply the existing migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma client if needed:

```bash
npx prisma generate
```

### 5. Start the backend

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

WebSocket endpoint:

```text
ws://localhost:5000/ws
```

### 6. Configure the frontend

Open another terminal:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL="http://localhost:5000/api"
```

Start the frontend:

```bash
npm run dev
```

The Vite development server will normally be available at:

```text
http://localhost:5173
```

---

## 🐳 Local Development with Docker

Docker is used for the local PostgreSQL database.

```text
┌─────────────────────┐
│ React + Vite        │
│ localhost:5173      │
└──────────┬──────────┘
           │
           │ HTTP / WebSocket
           ▼
┌─────────────────────┐
│ Express Server      │
│ localhost:5000      │
└──────────┬──────────┘
           │
           │ PostgreSQL
           ▼
┌─────────────────────┐
│ PostgreSQL          │
│ Docker              │
│ localhost:5432      │
└─────────────────────┘
```

---

## 🧩 Application Architecture

```text
                         LinkUp
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Frontend                    Backend
             │                           │
       React + Vite              Express + WebSocket
             │                           │
             │       REST / WSS          │
             └─────────────┬─────────────┘
                           │
                         Prisma
                           │
                           ▼
                      PostgreSQL
```

### REST API

Used for persistent application operations such as:

* Guest creation and retrieval
* Spaces
* Conversations
* Profile data
* Messages
* Dashboard data

### WebSockets

Used for real-time communication such as:

* New messages
* Message updates
* Message deletion
* Typing indicators
* Reactions
* Conversation events
* Participant updates

---

## 🔐 Environment & Secrets

Production and local secrets should **never** be committed to Git.

Do not commit:

```text
.env
.env.local
.env.production
node_modules/
dist/
```

Use environment variables for configuration.

A safe repository can contain:

```text
.env.example
```

with placeholder or local-development values.

---

## 🗃️ Database & Prisma

Prisma 7 manages the PostgreSQL schema and migrations.

The project uses:

```text
prisma/
├── migrations/
└── schema.prisma
```

and:

```text
prisma.config.ts
```

Database migrations are committed to the repository so that environments can reproduce the same database schema.

---

## 🧭 Future Improvements

LinkUp's architecture leaves room for future improvements such as:

* Redis Pub/Sub for horizontal WebSocket scaling
* Rich presence and online status
* Notifications
* Media and file sharing
* Stronger authentication
* Message search
* Read receipts
* Moderation tools
* Rate limiting
* Observability and monitoring
* Horizontal backend scaling

---

## ❤️ LinkUp

**A place to find your people and join the conversation.**

Built with:

**React · TypeScript · Vite · Express · WebSockets · Prisma · PostgreSQL · Docker**
