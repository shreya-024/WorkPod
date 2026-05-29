# Multiplayer Team Selection Guide

## 🎯 Overview

Your app now has a **team composition selection system** that allows users to:
1. **Play with All AI Teammates** - Solo experience with only AI-powered team members
2. **Join with Human Players** - Multiplayer mode mixing real humans + AI teammates

---

## 🏗️ Architecture

### Backend Flow
```
1. User joins room via socket 'join-room' event
   ↓
2. Participant marked as isHuman: true
   ↓
3. Frontend requests available humans: 'get-available-humans'
   ↓
4. Backend returns list of available rooms/humans
   ↓
5. User selects team preference: 'set-team-composition'
   ↓
6. Room broadcasts 'team-composition-update' to all participants
```

### Frontend Flow
```
RoleSelectPage
   ↓
User clicks role → handleSelect()
   ↓
Show TeamSelectionModal
   ↓
User chooses "All AI" or "Mix with Humans"
   ↓
Navigate to SimulationPage
   ↓
ChatSidebar displays TeamDisplay with team roster
```

---

## 📝 File Changes Summary

### Backend
- **`server/socket/roomManager.js`**
  - Added `get-available-humans` socket event
  - Added `set-team-composition` socket event
  - Track `isHuman` flag on participants

### Frontend Components
- **`client/src/components/TeamSelectionModal.jsx`** (NEW)
  - Beautiful modal for choosing team composition
  - Shows available humans count
  - Disables "humans" option if no humans available

- **`client/src/components/TeamDisplay.jsx`** (NEW)
  - Expandable team roster component
  - Shows human 👤 vs AI 🤖 indicators
  - Displays team composition preference badge

### Updated Files
- **`client/src/pages/RoleSelectPage.jsx`**
  - Integrated TeamSelectionModal
  - Added handlers for team selection

- **`client/src/pages/SimulationPage.jsx`**
  - Added import for TeamDisplay
  - Added `teamComposition` to store destructuring

- **`client/src/components/ChatSidebar.jsx`**
  - Added TeamDisplay at top of sidebar
  - Imported TeamDisplay component

- **`client/src/hooks/useSocket.js`**
  - Added `getAvailableHumans()` method
  - Added `setTeamCompositionPreference()` method
  - Added listeners for team events

- **`client/src/store/useSimStore.js`**
  - Added `teamComposition` state
  - Added `availableHumans` state
  - Added `setTeamComposition()` and `setAvailableHumans()` setters

---

## 🔧 How to Test

### Test 1: Single User (All AI)
```
1. Open app in browser
2. Click any role (SDE, HR, PM)
3. In TeamSelectionModal, click "All AI Teammates"
4. Confirm button becomes enabled
5. Click "Confirm"
6. Should navigate to simulation
7. In left sidebar, see TeamDisplay showing only AI members
8. Can expand TeamDisplay to see roster
```

### Test 2: Multiple Users (Mix with Humans)
```
Open Browser 1:
1. Select role (e.g., SDE)
2. Choose "All AI Teammates"
3. Wait in simulation (stays in room)

Open Browser 2:
1. Select same role (SDE)
2. In TeamSelectionModal, should see "1 player available in room sde-xxxxx"
3. Choose "Join with Humans"
4. Click Confirm
5. In simulation, TeamDisplay should show:
   - Badge: "1 Human"
   - Expand to see: Your name + AI teammates
```

### Test 3: Team Display Interaction
```
During simulation:
1. Look at left sidebar - see TeamDisplay
2. Click to expand → shows all team members
   - Human members: 👤 name (green text)
   - AI members: 🤖 AI (accent color)
3. Shows team composition badge
4. Click to collapse
```

---

## 🎮 User Experience

### Role Selection Page
- User sees all role cards
- Clicks a role card
- TeamSelectionModal appears with smooth animation

### Team Selection Modal
- **Option 1: All AI Teammates**
  - Icon: 🤖
  - Description: "Work solo with AI-powered team members"
  - Always available

- **Option 2: Join with Humans**
  - Icon: 👥
  - Shows live count of available humans
  - Disabled if no humans available
  - Shows list of available rooms when selected

### Simulation Screen
- TeamDisplay in left sidebar shows:
  - Team count
  - Team composition badge (e.g., "2 Humans" or "AI Only")
  - Can expand to see roster with 👤/🤖 indicators

---

## 🔌 Socket Events Reference

### Client → Server

**`get-available-humans`**
```javascript
socket.emit('get-available-humans', { role: 'sde' })
```

**`set-team-composition`**
```javascript
socket.emit('set-team-composition', {
  teamType: 'all-ai',  // or 'mix-humans'
  preferredRoom: null   // future: specific room preference
})
```

### Server → Client

**`available-humans`**
```javascript
{
  rooms: [
    {
      roomCode: 'sde-abc123',
      humanCount: 2,
      totalCount: 3,
      humans: [
        { userName: 'Alice', joinedAt: '2026-05-29...' },
        { userName: 'Bob', joinedAt: '2026-05-29...' }
      ]
    }
  ]
}
```

**`team-composition-update`**
```javascript
{
  userId: 'user123',
  preference: 'mix-humans',
  totalParticipants: 3,
  humanParticipants: 2
}
```

---

## 🚀 Next Steps (Optional Enhancements)

1. **Persistent Team Matching**
   - Auto-match humans to same room instead of choosing
   - Add team size preferences (solo, small team, large team)

2. **Team Statistics**
   - Show average performance of AI vs human teams
   - Track win rates by team composition

3. **Friend Invites**
   - Invite specific users to join your team
   - Quick-join friends' sessions

4. **Team Roles**
   - Within a role, assign specific subtasks
   - E.g., SDE could be Frontend Lead vs Backend Lead

5. **Practice Buddy System**
   - Pair users of different experience levels
   - AI moderator guides the session

---

## 📊 Current Limitations

1. **No pre-matching logic** - Users must manually select
2. **No timeout handling** - Teams aren't reassigned if someone disconnects mid-simulation
3. **No rating system** - No feedback on team compatibility
4. **Fixed team size** - Always 1 human + AI, not configurable

---

## 🐛 Debugging

### Check Available Humans
Open browser console in RoleSelectPage:
```javascript
// In useSocket hook:
socketRef.current.emit('get-available-humans', { role: 'sde' })

// Listen for response
socketRef.current.on('available-humans', (data) => {
  console.log('Available humans:', data)
})
```

### Verify Team Composition
During simulation, check store:
```javascript
// In browser console
import { useSimStore } from './src/store/useSimStore.js'
const state = useSimStore.getState()
console.log(state.teamComposition)  // 'all-ai' or 'mix-humans'
console.log(state.roomParticipants) // array of participants
```

---

## 💡 Design Decisions

1. **Modal-based Selection** - Clearer intent before joining vs inline buttons
2. **Team Display Component** - Dedicated component for reusability
3. **Socket Events** - Real-time updates when team composition changes
4. **Disabled UI States** - Prevents selection of unavailable options
5. **Expandable Display** - Compact by default, detail on demand
