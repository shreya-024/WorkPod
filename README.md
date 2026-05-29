# WorkPod 

An AI-powered workplace simulation platform. Practice real job scenarios with AI teammates, handle live emergencies, collaborate with other humans in multiplayer, and get a scored performance report powered by Gemini.

---

## Features

- **5 Roles** — Software Engineer, HR Manager, Product Manager, SDE Intern, ML Intern
- **AI Teammates** — Gemini-powered personas that stay fully in character
- **Multiplayer** — join a room with real humans + AI, or go solo with all AI
- **Collaborative Whiteboard** — Excalidraw-based real-time synchronized canvas for visual collaboration
- **Team Meetings** — seamlessly embedded Jitsi video/audio conference rooms inside the simulation
- **Teams-Style Sidebar** — unified navigation in `ChatSidebar.jsx` showing channels, team statuses, active humans, tasks checklist, and live progress
- **Task Artifacts** — write and submit deliverables (PRD, code review, etc.) via embedded Monaco Editor
- **Emergency Scenarios** — triggered at 60% session time, requiring urgent team response
- **Mentor Channel** — separate private channel with custom career-coaching prompts to ask your AI mentor questions
- **Voice Input** — speak your messages using Chrome Web Speech API
- **AI Performance Report** — evaluated on Communication, Task Management & Pressure Handling
- **30-Day Learning Roadmap** — personalized, high-quality resource links generated after each session
- **Guest + Auth** — play instantly as a guest, or sign in to save simulation history
- **Premium SaaS UI** — Sleek dark theme, animated gradient typography, and glowing hover states across the application

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
| Editor / Visuals | `@excalidraw/excalidraw` (Whiteboard), `@monaco-editor/react` (Coding) |
| Meetings | Jitsi Meet iframe integration |
| Realtime | Socket.io-client / Socket.io |
| HTTP | Axios |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (bcrypt) + guest mode (localStorage ID) |
| AI | Gemini 2.5 Flash via `@google/generative-ai` (Chat, Mentor & Evaluation) |
| Voice | Web Speech API (Chrome only) |

---

## How It Works

### 1. Role Selection
Pick a role (SDE, HR, PM). A **Team Selection Modal** opens and queries the server in real-time for other humans already in an active room for that role. You can:
- **All AI Teammates** — solo session with AI personas only
- **Join with Humans** — join an existing room where real users are waiting (enabled only when humans are found)

### 2. Simulation
- An **Offer Letter** modal shows your project brief and deliverables before the 45-minute timer starts.
- **Teams-style navigation** — switch between `#team-general` chat, a `#whiteboard` collaborative canvas, and your private italicized **Mentor channel** (Team Lead).
- **Collaborative Whiteboard** — draw and model diagrams in real-time with excalidraw-synced canvases.
- **Embedded Team Meetings** — click the meeting icon in the top bar to spin up an instant, face-to-face Jitsi audio/video meeting room.
- **Task Artifact Panel** — click any task in the sidebar to open a full-featured writing drawer with an integrated Monaco Code Editor, then submit your deliverables to auto-notify the team.
- **Emergency Button** — appears after 60% of session time has elapsed, triggering a crisis scenario that demands urgent team response.
- **Active Humans Count** — shown live in the sidebar roster ("In This Room") and top header.

### 3. Report & Evaluation
When the session ends (via manual submit or timeout), Gemini reviews the full session transcript and returns:
- **Overall Score** (0–100) with an animated visual gauge
- **Skill Breakdown** — scored metrics on Communication, Task Management, and Pressure Handling
- **3 Critical AI Feedback Points** — constructive, highly specific observations of your session
- **30-Day Learning Roadmap** — 3 curated, actionable external links with custom descriptions on how to improve

---

## Multiplayer

Two users picking the **same role** within a 2-minute window are auto-placed in the same room. The second user sees a live human count in the Team Selection Modal before joining.

**Socket events:**

| Direction | Event | Payload | Description |
|-----------|-------|---------|-------------|
| Client → Server | `join-room` | `{ role, userId, userName }` | Join room by role |
| Client → Server | `get-available-humans` | `{ role }` | Request human rooms available |
| Client → Server | `set-team-composition` | `{ teamType, preferredRoom }` | Set preferences (mix-humans/all-ai) |
| Client → Server | `user-message` | `{ content, userName, channel }` | Send chat text |
| Client → Server | `emergency-trigger` | — | Trigger scenario crisis |
| Client → Server | `whiteboard-join` | `{ roomCode }` | Join Excalidraw session |
| Client → Server | `whiteboard-update` | `{ roomCode, elements }` | Send whiteboard updates |
| Client → Server | `whiteboard-sync-request` | `{ roomCode }` | Request latest whiteboard state |
| Server → Client | `room-joined` | `{ roomCode, participants, isEmergencyActive }` | Room join confirmation |
| Server → Client | `available-humans` | `{ rooms: [...] }` | List of human rooms |
| Server → Client | `room-update` | `{ participants }` | Broadcast updated room roster |
| Server → Client | `new-message` | `{ sender, senderType, content, channel, timestamp }` | Broadcast incoming chat message |
| Server → Client | `ai-typing` | `{ typing, channel }` | Teammate typing indicator status |
| Server → Client | `emergency-trigger` | `{ label, timestamp }` | Broadcast active emergency |
| Server → Client | `whiteboard-full-state` | `{ elements }` | Send full whiteboard state to joiner |
| Server → Client | `whiteboard-update` | `{ elements }` | Broadcast whiteboard changes |

---

## Project Structure

```
WorkPod/
├── client/                    # React + Vite frontend
│   ├── check_whiteboard.cjs   # Automated Puppeteer test script for whiteboard channel
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── RoleSelectPage.jsx   # Team selection modal + live human query
│       │   ├── SimulationPage.jsx   # Main sim UI (coordinates Chat, Whiteboard, Meetings)
│       │   └── ReportPage.jsx       # Animated performance score report
│       ├── components/
│       │   ├── TeamSelectionModal.jsx  # Choose AI-only or join humans
│       │   ├── TeamDisplay.jsx         # Live team roster in sidebar
│       │   ├── ChatWindow.jsx          # Message feed (supports system, user, teammates, mentor)
│       │   ├── ChatSidebar.jsx         # Consolidated Channels, Members, Tasks list, and Progress
│       │   ├── TaskArtifact.jsx        # Write-up drawer with integrated Monaco Editor
│       │   ├── SimTopBar.jsx           # Timer, room code, video meeting button, and emergency btn
│       │   ├── MeetingModal.jsx        # Video/Audio conferencing room via embedded Jitsi Meet iframe
│       │   ├── Whiteboard.jsx          # Excalidraw real-time collaborative canvas
│       │   ├── MessageBubble.jsx
│       │   ├── TypingIndicator.jsx
│       │   └── VoiceBtn.jsx
│       ├── hooks/
│       │   ├── useSocket.js    # Socket.io connection + whiteboard & room events
│       │   └── useVoice.js     # Web Speech API
│       ├── store/
│       │   └── useSimStore.js  # Zustand global simulation state
│       └── scenarios/
│           ├── sde.json
│           ├── hr.json
│           ├── pm.json
│           ├── ml_intern.json
│           └── sde_intern.json
│
└── server/                    # Express + Socket.io backend
    ├── index.js               # App entry, CORS, routes, socket init, and Jitsi room links
    ├── socket/
    │   └── roomManager.js     # All socket logic, multiplayer rooms, Excalidraw synchronization
    ├── services/
    │   └── geminiService.js   # Generative AI calls: Chat model, career mentor model, evaluation model
    ├── controllers/
    │   ├── authController.js
    │   ├── sessionController.js
    │   └── roomController.js
    ├── models/                # Mongoose schemas: User, Session
    ├── routes/
    └── scenarios/             # Server-side scenario JSON files (with specialized mentorPrompts)
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

### System Guardrails & Prompt Engineering
- **Unified Workplace Guardrails** — Pre-appended to every chat and mentor prompt to guarantee the AI stays fully in character as a professional teammate. Includes strict defense mechanics that redirect jailbreak attempts or casual chat back to simulation topics.
- **Custom Career Mentorship Channel** — The mentor channel injects a role-specific system prompt (`mentorPrompt`) loaded dynamically based on the current scenario, blended with career coaching guidelines, keeping it distinct and focused compared to standard teammate chat.
- **JSON Evaluation Parser** — The evaluator prompt instructs Gemini to return a strict JSON object. The parser uses `indexOf('{')` and `lastIndexOf('}')` to robustly extract the JSON object, gracefully bypassing markdown code blocks or extra text added by the model.

---

## Known Limitations

- Rooms expire/reset if all human participants disconnect
- No persistent room rejoining or state recovery after page refresh
- Voice input is Google Chrome-only (Web Speech API)
- Emergency scenario can only be triggered once per session
- Guest simulation reports are shown immediately but not saved in database history
