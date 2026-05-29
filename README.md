# WorkPod 🚀

An AI-powered workplace simulation platform. Practice real job scenarios with AI teammates, handle live emergencies, collaborate with other humans in multiplayer, and get a scored performance report powered by Gemini.

---

## Features

- 🎭 **3 Roles** — Software Engineer, HR Manager, Product Manager
- 🤖 **AI Teammates** — Gemini-powered personas that stay fully in character
- 👥 **Multiplayer** — join a room with real humans + AI, or go solo with all AI
- 📋 **Task Artifacts** — write and submit work directly in the sim (PRDs, code reviews, etc.)
- 🚨 **Emergency Scenarios** — triggered at 60% session time, require urgent team response
- 🧑‍🏫 **Mentor Channel** — separate private channel to ask your AI mentor questions
- 🎤 **Voice Input** — speak your messages (Chrome Web Speech API)
- 📊 **AI Performance Report** — scored on Communication, Task Management & Pressure Handling
- 🗺️ **30-Day Learning Roadmap** — personalized resource links generated after each session
- 🔐 **Guest + Auth** — play instantly as a guest, sign in to save history

---

## Quick Start

### 1. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### 2. Configure environment variables

**Server** — copy `.env.example` → `.env`:
```env
GEMINI_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash        # optional, this is the default
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string
CLIENT_URL=http://localhost:5173
PORT=5000
```

**Client** — copy `.env.example` → `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run locally (two terminals)

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

Open `http://localhost:5173`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, React Router v6, Zustand |
| Realtime | Socket.io-client / Socket.io |
| HTTP | Axios |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (bcrypt) + guest mode (localStorage ID) |
| AI | Gemini 2.5 Flash via `@google/generative-ai` |
| Voice | Web Speech API (Chrome only) |

---

## How It Works

### 1. Role Selection
Pick a role (SDE, HR, PM). A **Team Selection Modal** opens and queries the server in real-time for other humans already in an active room for that role. You can:
- **All AI Teammates** — solo session with AI personas only
- **Join with Humans** — join an existing room where real users are waiting (enabled only when humans are found)

### 2. Simulation
- An **Offer Letter** modal shows your project brief and deliverables before the 45-minute timer starts
- Chat with your AI team in `#team-general` — each persona (e.g. Alex Chen, Maya Patel) responds in character
- Switch to the **Mentor channel** to ask your EM/manager private questions
- Click any task to open a **Task Artifact panel** — write a full document and submit it to auto-message the team
- An **Emergency** button appears after 60% of time has elapsed — triggers a crisis scenario requiring urgent response
- Human participants are shown live in the top bar and team sidebar

### 3. Report
When the session ends (manual or timeout), Gemini evaluates the full transcript and returns:
- **Overall Score** (0–100) with animated gauge
- **Skill Breakdown**: Communication, Task Management, Pressure Handling
- **3 AI Feedback Points** — specific observations from the session
- **30-Day Learning Roadmap** — 3 curated resource links with explanations

---

## Multiplayer

Two users picking the **same role** within a 2-minute window are auto-placed in the same room. The second user sees a live human count in the Team Selection Modal before joining.

**Socket events:**

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `join-room` | `{ role, userId, userName }` |
| Client → Server | `get-available-humans` | `{ role }` |
| Client → Server | `set-team-composition` | `{ teamType, preferredRoom }` |
| Client → Server | `user-message` | `{ content, userName, channel }` |
| Client → Server | `emergency-trigger` | — |
| Server → Client | `room-joined` | `{ roomCode, participants, isEmergencyActive }` |
| Server → Client | `available-humans` | `{ rooms: [{ roomCode, humanCount, humans }] }` |
| Server → Client | `room-update` | `{ participants }` |
| Server → Client | `new-message` | `{ sender, senderType, content, channel, timestamp }` |
| Server → Client | `ai-typing` | `{ typing, channel }` |
| Server → Client | `emergency-trigger` | `{ label, timestamp }` |

---

## Project Structure

```
WorkPod/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── RoleSelectPage.jsx   # Team selection modal + live human query
│       │   ├── SimulationPage.jsx   # Main sim UI, timer, end session
│       │   └── ReportPage.jsx       # Animated score report
│       ├── components/
│       │   ├── TeamSelectionModal.jsx  # Choose AI-only or join humans
│       │   ├── TeamDisplay.jsx         # Live team roster in sidebar
│       │   ├── ChatWindow.jsx          # Message feed
│       │   ├── ChatSidebar.jsx         # Channel switcher + team display
│       │   ├── TaskSidebar.jsx         # Task checklist + progress
│       │   ├── TaskArtifact.jsx        # Full-screen task writing panel
│       │   ├── SimTopBar.jsx           # Timer, room code, emergency btn
│       │   ├── MessageBubble.jsx
│       │   ├── TypingIndicator.jsx
│       │   └── VoiceBtn.jsx
│       ├── hooks/
│       │   ├── useSocket.js    # Socket.io connection + all events
│       │   └── useVoice.js     # Web Speech API
│       ├── store/
│       │   └── useSimStore.js  # Zustand global state
│       └── scenarios/
│           ├── sde.json
│           ├── hr.json
│           └── pm.json
│
└── server/                    # Express + Socket.io backend
    ├── index.js               # App entry, CORS, routes, socket init
    ├── socket/
    │   └── roomManager.js     # All socket logic, room state, AI calls
    ├── services/
    │   └── geminiService.js   # Chat model (300 tok) + Evaluator model (1500 tok)
    ├── controllers/
    │   ├── authController.js
    │   ├── sessionController.js
    │   └── roomController.js
    ├── models/                # Mongoose: User, Session
    ├── routes/
    └── scenarios/             # Server-side scenario JSON (with mentorPrompt)
```

---

## REST API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/session/end` | Optional | Evaluate session, save if logged in |
| GET | `/api/session/history/:userId` | JWT | Past sessions |
| GET | `/api/room/count/:role` | — | Live participant count for a role |
| GET | `/api/health` | — | Server health check |

---

## Gemini Integration

Two separate model instances are used:

| Model | `maxOutputTokens` | `temperature` | Used for |
|-------|-------------------|---------------|----------|
| Chat model | 300 | 0.85 | Teammate + mentor replies (short, in-character) |
| Evaluator model | 1500 | 0.40 | End-of-session JSON report (needs full output) |

The evaluator prompt instructs Gemini to return a strict JSON object. The parser uses `indexOf('{')` / `lastIndexOf('}')` to extract the JSON block robustly, regardless of any surrounding markdown fences or explanatory text Gemini may add.

---

## Known Limitations

- Rooms expire/reset if all participants disconnect
- No persistent room rejoining after page refresh
- Voice input is Chrome-only (Web Speech API)
- Emergency can only be triggered once per session
- Guest reports are shown but not persisted
