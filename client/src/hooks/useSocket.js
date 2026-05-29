import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSimStore } from '../store/useSimStore.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef(null);
  const {
    role,
    user,
    guestId,
    setRoomCode,
    setRoomParticipants,
    setTeamComposition,
    setAvailableHumans,
    addMessage,
    setAiTyping,
    setEmergencyActive,
  } = useSimStore();

  useEffect(() => {
    if (!role) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const userId = user?.id || guestId;
    const userName = user?.name || `Guest_${guestId.slice(-4)}`;

    socket.on('connect', () => {
      socket.emit('join-room', { role, userId, userName });
    });

    socket.on('room-joined', ({ roomCode, participants, isEmergencyActive }) => {
      setRoomCode(roomCode);
      setRoomParticipants(participants);
      if (isEmergencyActive) setEmergencyActive(true);
    });

    socket.on('room-update', ({ participants }) => {
      setRoomParticipants(participants);
    });

    socket.on('new-message', (msg) => {
      addMessage(msg);
    });

    socket.on('system-message', ({ content, timestamp }) => {
      addMessage({ sender: 'System', senderType: 'system', content, timestamp });
    });

    socket.on('ai-typing', ({ typing }) => {
      setAiTyping(typing);
    });

    socket.on('emergency-trigger', ({ label }) => {
      setEmergencyActive(true);
      addMessage({
        sender: 'System',
        senderType: 'system',
        content: `[ALERT] EMERGENCY: ${label}`,
        timestamp: new Date().toISOString(),
        isEmergency: true,
      });
    });

    socket.on('team-composition-update', ({ userId, preference, totalParticipants, humanParticipants }) => {
      setTeamComposition(preference);
      // Update UI to show team composition
    });

    socket.on('available-humans', ({ rooms }) => {
      setAvailableHumans(rooms);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [role]);

  const sendMessage = (content, channel = 'team') => {
    const userName = user?.name || `Guest_${guestId.slice(-4)}`;
    socketRef.current?.emit('user-message', { content, userName, channel });
  };

  const triggerEmergency = () => {
    socketRef.current?.emit('emergency-trigger');
  };

  const getAvailableHumans = () => {
    socketRef.current?.emit('get-available-humans', { role });
  };

  const setTeamCompositionPreference = (teamType) => {
    socketRef.current?.emit('set-team-composition', { teamType, preferredRoom: null });
  };

  return { sendMessage, triggerEmergency, getAvailableHumans, setTeamCompositionPreference, socket: socketRef };
}
