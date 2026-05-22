import { nanoid } from 'nanoid';
import { callGemini } from '../services/geminiService.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load scenario data
function loadScenario(role) {
  const raw = readFileSync(join(__dirname, `../scenarios/${role}.json`), 'utf-8');
  return JSON.parse(raw);
}

// In-memory room state: roomCode -> RoomState
// RoomState: { role, code, history[], participants[], systemPrompt, isEmergencyActive, aiTyping }
const rooms = new Map();

// role -> active roomCode (join window: 2 minutes)
const roleActiveRoom = new Map();

function getOrCreateRoom(role) {
  // Check if there's an active room for this role created within 2 min
  if (roleActiveRoom.has(role)) {
    const code = roleActiveRoom.get(role);
    const room = rooms.get(code);
    if (room && room.participants.length < 10) {
      return room;
    }
  }
  // Create new room
  const scenario = loadScenario(role);
  const code = `${role}-${nanoid(6)}`;
  const room = {
    role,
    code,
    history: [],
    participants: [],
    systemPrompt: scenario.systemPrompt,
    emergencyPrompt: scenario.emergencyPrompt,
    emergencyLabel: scenario.emergencyLabel,
    isEmergencyActive: false,
    aiTyping: false,
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  roleActiveRoom.set(role, code);

  // Expire room assignment after 2 minutes
  setTimeout(() => {
    if (roleActiveRoom.get(role) === code) {
      roleActiveRoom.delete(role);
    }
  }, 2 * 60 * 1000);

  return room;
}

export function initRoomManager(io) {
  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    // ─── JOIN ROOM ────────────────────────────────────────────────
    socket.on('join-room', ({ role, userId, userName }) => {
      if (!['sde', 'hr', 'pm'].includes(role)) return;

      const room = getOrCreateRoom(role);
      currentRoom = room;
      currentUser = { userId, userName: userName || 'User', socketId: socket.id };

      // Add participant
      if (!room.participants.find(p => p.userId === userId)) {
        room.participants.push(currentUser);
      }

      socket.join(room.code);

      // Ack to joining user
      socket.emit('room-joined', {
        roomCode: room.code,
        participants: room.participants,
        isEmergencyActive: room.isEmergencyActive,
      });

      // Notify room of new participant
      io.to(room.code).emit('room-update', { participants: room.participants });

      // System message to room
      io.to(room.code).emit('system-message', {
        content: `${currentUser.userName} joined the workspace.`,
        timestamp: new Date().toISOString(),
      });
    });

    // ─── USER MESSAGE ─────────────────────────────────────────────
    socket.on('user-message', async ({ content, userName }) => {
      if (!currentRoom) return;
      const room = currentRoom;

      // Broadcast the user's message to all room participants
      const userMsg = {
        sender: userName || 'You',
        senderType: 'user',
        content,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
      };
      io.to(room.code).emit('new-message', userMsg);

      // Guard: don't pile up AI calls
      if (room.aiTyping) return;
      room.aiTyping = true;
      io.to(room.code).emit('ai-typing', { typing: true });

      try {
        const aiText = await callGemini(
          room.history,
          content,
          room.history.length === 0 ? room.systemPrompt : null,
        );

        // Push to shared history
        room.history.push({ role: 'user', parts: [{ text: content }] });
        room.history.push({ role: 'model', parts: [{ text: aiText }] });

        // Trim to last 15 turns
        if (room.history.length > 30) {
          room.history = room.history.slice(room.history.length - 30);
        }

        const aiMsg = {
          sender: 'AI',
          senderType: 'ai',
          content: aiText,
          timestamp: new Date().toISOString(),
        };
        io.to(room.code).emit('new-message', aiMsg);
      } catch (err) {
        console.error('Gemini error:', err.message);
        io.to(room.code).emit('new-message', {
          sender: 'System',
          senderType: 'system',
          content: '⚠️ AI teammates are momentarily unavailable. Please try again.',
          timestamp: new Date().toISOString(),
        });
      } finally {
        room.aiTyping = false;
        io.to(room.code).emit('ai-typing', { typing: false });
      }
    });

    // ─── EMERGENCY TRIGGER ────────────────────────────────────────
    socket.on('emergency-trigger', async () => {
      if (!currentRoom || currentRoom.isEmergencyActive) return;
      const room = currentRoom;
      room.isEmergencyActive = true;

      io.to(room.code).emit('emergency-trigger', {
        label: room.emergencyLabel || '🚨 Emergency',
        timestamp: new Date().toISOString(),
      });

      // AI responds to emergency
      io.to(room.code).emit('ai-typing', { typing: true });
      try {
        const aiText = await callGemini(
          room.history,
          room.emergencyPrompt,
          null,
        );
        room.history.push({ role: 'user', parts: [{ text: room.emergencyPrompt }] });
        room.history.push({ role: 'model', parts: [{ text: aiText }] });

        if (room.history.length > 30) {
          room.history = room.history.slice(room.history.length - 30);
        }

        io.to(room.code).emit('new-message', {
          sender: 'AI',
          senderType: 'ai',
          content: aiText,
          timestamp: new Date().toISOString(),
          isEmergency: true,
        });
      } catch (err) {
        console.error('Emergency Gemini error:', err.message);
      } finally {
        io.to(room.code).emit('ai-typing', { typing: false });
      }
    });

    // ─── DISCONNECT ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (!currentRoom || !currentUser) return;
      const room = currentRoom;
      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      io.to(room.code).emit('room-update', { participants: room.participants });
      io.to(room.code).emit('system-message', {
        content: `${currentUser.userName} left the workspace.`,
        timestamp: new Date().toISOString(),
      });
      // Clean up empty rooms
      if (room.participants.length === 0) {
        rooms.delete(room.code);
      }
    });
  });

  // Export rooms map for REST API use
  io.rooms$ = rooms;
}

export function getRoomParticipantCount(role) {
  let count = 0;
  for (const [, room] of rooms) {
    if (room.role === role) count += room.participants.length;
  }
  return count;
}
