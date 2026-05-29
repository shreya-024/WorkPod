import { nanoid } from 'nanoid';
import { callGemini, callMentorGemini } from '../services/geminiService.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Scenario loader ─────────────────────────────────────────────────────────
function loadScenario(role) {
  const raw = readFileSync(join(__dirname, `../scenarios/${role}.json`), 'utf-8');
  return JSON.parse(raw);
}

// roomCode -> RoomState
const rooms = new Map();

// ─── Room message log (for replay on rejoin) ─────────────────────────────────
// Stored inside each room as room.messageLog[]
const REPLAY_COUNT = 20; // last N messages replayed to rejoining users
const EMPTY_ROOM_TTL_MS = 5 * 60 * 1000; // 5 minutes before an empty room is deleted

function getOrCreateRoom(role, teamType) {
  // If user wants 'mix-humans', find an existing non-full room for this role
  if (teamType === 'mix-humans') {
    for (const [code, room] of rooms.entries()) {
      if (room.role === role && room.teamType === 'mix-humans' && room.participants.length < 10) {
        return room;
      }
    }
  }

  // Otherwise, create a new room (either because 'all-ai' or no 'mix-humans' room found)
  const scenario = loadScenario(role);
  const code = `${role}-${nanoid(6)}`;
  const room = {
    role,
    code,
    teamType,             // store whether this room is mix-humans or all-ai
    history: [],
    mentorHistory: [],
    participants: [],
    messageLog: [],       // full ordered chat log for replay
    whiteboardElements: [],  // collaborative whiteboard state
    scenario,
    systemPrompt: scenario.systemPrompt,
    emergencyPrompt: scenario.emergencyPrompt,
    emergencyLabel: scenario.emergencyLabel,
    isEmergencyActive: false,
    aiTyping: false,
    createdAt: Date.now(),
    emptyTtlTimer: null,  // set when last participant leaves
  };
  rooms.set(code, room);

  return room;
}

/** Append a message to room.messageLog, keeping last REPLAY_COUNT entries. */
function logMessage(room, msg) {
  room.messageLog.push(msg);
  if (room.messageLog.length > REPLAY_COUNT) {
    room.messageLog = room.messageLog.slice(room.messageLog.length - REPLAY_COUNT);
  }
}

/** Cancel any pending empty-room TTL timer on a room. */
function cancelEmptyTimer(room) {
  if (room.emptyTtlTimer) {
    clearTimeout(room.emptyTtlTimer);
    room.emptyTtlTimer = null;
  }
}

/** Schedule room deletion after TTL if it stays empty. */
function scheduleEmptyTimer(room) {
  cancelEmptyTimer(room);
  room.emptyTtlTimer = setTimeout(() => {
    if (room.participants.length === 0) {
      rooms.delete(room.code);
    }
  }, EMPTY_ROOM_TTL_MS);
}

// ─── Socket manager ───────────────────────────────────────────────────────────
export function initRoomManager(io) {
  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    // ─── JOIN ROOM ──────────────────────────────────────────────────────────
    socket.on('join-room', ({ role, userId, userName, teamType }) => {
      if (!['sde', 'hr', 'pm'].includes(role)) return;

      const room = getOrCreateRoom(role, teamType);
      currentRoom = room;
      currentUser = {
        userId,
        userName: userName || 'User',
        socketId: socket.id,
        isHuman: true,
        joinedAt: new Date().toISOString(),
      };

      // Cancel any pending empty-room TTL now that someone is joining
      cancelEmptyTimer(room);

      // Deduplicate by userId
      if (!room.participants.find(p => p.userId === userId)) {
        room.participants.push(currentUser);
      }

      socket.join(room.code);

      socket.emit('room-joined', {
        roomCode: room.code,
        participants: room.participants,
        isEmergencyActive: room.isEmergencyActive,
      });

      io.to(room.code).emit('room-update', { participants: room.participants });

      const joinMsg = {
        sender: 'System',
        senderType: 'system',
        content: `${currentUser.userName} joined the workspace.`,
        timestamp: new Date().toISOString(),
      };
      logMessage(room, joinMsg);
      io.to(room.code).emit('system-message', joinMsg);
    });

    // ─── REJOIN ROOM ────────────────────────────────────────────────────────
    // Called by the client on socket reconnect if it has a saved roomCode.
    socket.on('rejoin-room', ({ roomCode, userId, userName }) => {
      const room = rooms.get(roomCode);
      if (!room) {
        // Room expired — tell client to fall back to a fresh join
        socket.emit('rejoin-failed', { reason: 'Room no longer exists. Starting a new session.' });
        return;
      }

      currentRoom = room;
      currentUser = {
        userId,
        userName: userName || 'User',
        socketId: socket.id,
        isHuman: true,
        joinedAt: new Date().toISOString(),
      };

      // Cancel TTL and restore participant
      cancelEmptyTimer(room);
      const existing = room.participants.find(p => p.userId === userId);
      if (existing) {
        existing.socketId = socket.id; // update stale socket ID
      } else {
        room.participants.push(currentUser);
      }

      socket.join(room.code);

      // Send room-joined with the last N messages for replay
      socket.emit('room-joined', {
        roomCode: room.code,
        participants: room.participants,
        isEmergencyActive: room.isEmergencyActive,
        replayMessages: room.messageLog.slice(-REPLAY_COUNT),
      });

      io.to(room.code).emit('room-update', { participants: room.participants });

      const rejoinMsg = {
        sender: 'System',
        senderType: 'system',
        content: `${currentUser.userName} rejoined the workspace.`,
        timestamp: new Date().toISOString(),
      };
      logMessage(room, rejoinMsg);
      io.to(room.code).emit('system-message', rejoinMsg);
    });

    // ─── USER MESSAGE ───────────────────────────────────────────────────────
    socket.on('user-message', async ({ content, userName, channel = 'team' }) => {
      if (!currentRoom) return;
      const room = currentRoom;

      const userMsg = {
        sender: userName || 'You',
        senderType: 'user',
        content,
        channel,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
      };
      logMessage(room, userMsg);
      io.to(room.code).emit('new-message', userMsg);

      // Guard: don't pile up AI calls
      if (room.aiTyping) return;
      room.aiTyping = true;
      io.to(room.code).emit('ai-typing', { typing: true, channel });

      try {
        const useMentor = channel === 'mentor';
        const aiText = useMentor
          ? await callMentorGemini(room.mentorHistory, content, room.scenario)
          : await callGemini(
              room.history,
              content,
              room.history.length === 0 ? room.systemPrompt : null,
            );

        if (useMentor) {
          room.mentorHistory.push({ role: 'user', parts: [{ text: content }] });
          room.mentorHistory.push({ role: 'model', parts: [{ text: aiText }] });
          if (room.mentorHistory.length > 30) {
            room.mentorHistory = room.mentorHistory.slice(room.mentorHistory.length - 30);
          }
        } else {
          room.history.push({ role: 'user', parts: [{ text: content }] });
          room.history.push({ role: 'model', parts: [{ text: aiText }] });
          if (room.history.length > 30) {
            room.history = room.history.slice(room.history.length - 30);
          }
        }

        const aiMsg = useMentor
          ? {
              sender: room.scenario.mentorName || 'Mentor',
              senderType: 'mentor',
              content: aiText,
              channel: 'mentor',
              timestamp: new Date().toISOString(),
            }
          : {
              sender: 'AI',
              senderType: 'ai',
              content: aiText,
              channel: 'team',
              timestamp: new Date().toISOString(),
            };

        logMessage(room, aiMsg);
        io.to(room.code).emit('new-message', aiMsg);
      } catch (err) {
        console.error('Gemini error:', err.message);
        const errMsg = {
          sender: 'System',
          senderType: 'system',
          content: '⚠️ AI teammates are momentarily unavailable. Please try again.',
          timestamp: new Date().toISOString(),
        };
        logMessage(room, errMsg);
        io.to(room.code).emit('new-message', errMsg);
      } finally {
        room.aiTyping = false;
        io.to(room.code).emit('ai-typing', { typing: false, channel });
      }
    });

    // ─── EMERGENCY TRIGGER ──────────────────────────────────────────────────
    socket.on('emergency-trigger', async () => {
      if (!currentRoom || currentRoom.isEmergencyActive) return;
      const room = currentRoom;
      room.isEmergencyActive = true;

      io.to(room.code).emit('emergency-trigger', {
        label: room.emergencyLabel || '🚨 Emergency',
        timestamp: new Date().toISOString(),
      });

      io.to(room.code).emit('ai-typing', { typing: true });
      try {
        const aiText = await callGemini(room.history, room.emergencyPrompt, null);
        room.history.push({ role: 'user', parts: [{ text: room.emergencyPrompt }] });
        room.history.push({ role: 'model', parts: [{ text: aiText }] });
        if (room.history.length > 30) {
          room.history = room.history.slice(room.history.length - 30);
        }

        const emergencyMsg = {
          sender: 'AI',
          senderType: 'ai',
          content: aiText,
          timestamp: new Date().toISOString(),
          isEmergency: true,
        };
        logMessage(room, emergencyMsg);
        io.to(room.code).emit('new-message', emergencyMsg);
      } catch (err) {
        console.error('Emergency Gemini error:', err.message);
      } finally {
        io.to(room.code).emit('ai-typing', { typing: false });
      }
    });

    // ─── GET AVAILABLE HUMANS ───────────────────────────────────────────────
    socket.on('get-available-humans', ({ role }) => {
      if (!['sde', 'hr', 'pm'].includes(role)) return;

      const availableRooms = [];
      for (const [code, room] of rooms) {
        if (room.role === role && room.teamType === 'mix-humans') {
          const humans = room.participants.filter(p => p.isHuman);
          if (humans.length > 0 && room.participants.length < 10) {
            availableRooms.push({
              roomCode: code,
              humanCount: humans.length,
              totalCount: room.participants.length,
              humans: humans.map(h => ({ userName: h.userName, joinedAt: h.joinedAt })),
            });
          }
        }
      }
      socket.emit('available-humans', { rooms: availableRooms });
    });

    // ─── SET TEAM COMPOSITION ───────────────────────────────────────────────
    socket.on('set-team-composition', ({ teamType, preferredRoom }) => {
      if (!currentRoom || !currentUser) return;
      if (!['all-ai', 'mix-humans'].includes(teamType)) return;

      if (!currentRoom.teamComposition) {
        currentRoom.teamComposition = new Map();
      }
      currentRoom.teamComposition.set(currentUser.userId, {
        preference: teamType,
        preferredRoom,
        setAt: new Date().toISOString(),
      });

      const teamInfo = {
        userId: currentUser.userId,
        preference: teamType,
        totalParticipants: currentRoom.participants.length,
        humanParticipants: currentRoom.participants.filter(p => p.isHuman).length,
      };
      io.to(currentRoom.code).emit('team-composition-update', teamInfo);
    });

    // ─── WHITEBOARD JOIN ────────────────────────────────────────────────────
    socket.on('whiteboard-join', ({ roomCode }) => {
      if (!roomCode) return;
      const room = rooms.get(roomCode);
      if (!room) return;

      socket.join(roomCode);

      // Send existing canvas state to new joiner
      if (room.whiteboardElements && room.whiteboardElements.length > 0) {
        socket.emit('whiteboard-full-state', {
          elements: room.whiteboardElements,
        });
      }
    });

    // ─── WHITEBOARD UPDATE ──────────────────────────────────────────────────
    socket.on('whiteboard-update', ({ roomCode, elements }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      // Save latest state server-side
      room.whiteboardElements = elements;

      // Broadcast to everyone EXCEPT sender
      socket.to(roomCode).emit('whiteboard-update', { elements });
    });

    // ─── WHITEBOARD SYNC REQUEST ────────────────────────────────────────────
    socket.on('whiteboard-sync-request', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      // Send current whiteboard state to the requesting user
      if (room.whiteboardElements && room.whiteboardElements.length > 0) {
        socket.emit('whiteboard-update', room.whiteboardElements);
      }
    });

    // ─── DISCONNECT ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (!currentRoom || !currentUser) return;
      const room = currentRoom;

      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      io.to(room.code).emit('room-update', { participants: room.participants });

      const leaveMsg = {
        sender: 'System',
        senderType: 'system',
        content: `${currentUser.userName} left the workspace.`,
        timestamp: new Date().toISOString(),
      };
      logMessage(room, leaveMsg);
      io.to(room.code).emit('system-message', leaveMsg);

      // Instead of immediately deleting, give a 5-min TTL for rejoin
      if (room.participants.length === 0) {
        scheduleEmptyTimer(room);
      }
    });
  });

  // Export rooms map for REST API use
  io.rooms$ = rooms;
}

export function getRoomParticipantCount(role) {
  let count = 0;
  for (const [, room] of rooms) {
    if (room.role === role && room.teamType === 'mix-humans') {
      const humans = room.participants.filter(p => p.isHuman);
      count += humans.length;
    }
  }
  return count;
}
