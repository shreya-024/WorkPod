# WorkPod 🚀

An AI-powered work simulation platform. Practice real workplace scenarios with AI teammates, handle emergencies, and get scored performance reports.

## Quick Start

### 1. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment variables

**Server** — copy `.env.example` to `.env` and fill in:
```
GEMINI_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_random_string
CLIENT_URL=http://localhost:5173
PORT=5000
```

**Client** — copy `.env.example` to `.env`:
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run locally (two terminals)

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

Open `http://localhost:5173`

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, React Router v6, Zustand |
| Realtime | Socket.io-client |
| HTTP | Axios |
| Backend | Express, Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT (local accounts) + guest mode |
| AI | Gemini 2.5 Flash (`@google/generative-ai`) |
| Voice | Web Speech API (Chrome) |

## Features

- 🎭 **3 Roles** — SDE, HR Manager, Product Manager
- 🤖 **AI Teammates** — Gemini-powered, stay in character
- 👥 **Multiplayer** — share a room if 2+ users pick same role within 2 min
- 🚨 **Emergency Scenarios** — appear at 60% timer mark
- 🎤 **Voice Input** — Chrome Web Speech API
- 📊 **Performance Reports** — scored by Gemini on 3 dimensions
- 🔐 **Guest + Auth** — play instantly, save history when logged in

## Project Structure

```
WorkPod/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/   # LandingPage, RoleSelectPage, SimulationPage, ReportPage
│       ├── components/
│       ├── hooks/   # useSocket, useVoice
│       ├── store/   # Zustand store
│       └── scenarios/  # sde.json, hr.json, pm.json
└── server/          # Express + Socket.io
    ├── controllers/
    ├── models/      # User, Session, Room
    ├── routes/
    ├── services/    # geminiService.js
    ├── socket/      # roomManager.js
    └── scenarios/   # JSON scenario data
```
