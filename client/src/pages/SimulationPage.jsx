import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimStore } from '../store/useSimStore.js';
import { useSocket } from '../hooks/useSocket.js';
import { useVoice } from '../hooks/useVoice.js';
import ChatWindow from '../components/ChatWindow.jsx';
import TaskSidebar from '../components/TaskSidebar.jsx';
import EmergencyBanner from '../components/EmergencyBanner.jsx';
import VoiceBtn from '../components/VoiceBtn.jsx';
import TypingIndicator from '../components/TypingIndicator.jsx';
import api from '../lib/api.js';

export default function SimulationPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [ending, setEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const inputRef = useRef(null);

  const {
    role, scenario, roomCode, messages, aiTyping,
    timerSeconds, startTimer, stopTimer, resetTimer,
    isEmergencyActive, setEmergencyActive,
    completedTasks, user, guestId,
    setReport, setEndSessionFn,
  } = useSimStore();

  const { sendMessage, triggerEmergency } = useSocket();

  // Timer setup
  useEffect(() => {
    startTimer();
    return () => {}; // timer persists in store
  }, []);

  // 60% = 1080 elapsed of 2700 → 1620 remaining
  const elapsed = 2700 - timerSeconds;
  const percentElapsed = Math.round((elapsed / 2700) * 100);
  const showEmergencyBtn = percentElapsed >= 60 && !isEmergencyActive;

  // Auto-end when timer hits 0
  useEffect(() => {
    if (timerSeconds === 0) endSession('timeout');
  }, [timerSeconds]);

  const endSession = useCallback(async (reason = 'manual') => {
    if (ending) return;
    setEnding(true);
    stopTimer();

    const durationSeconds = 2700 - timerSeconds;
    const payload = {
      userId: user?.id || guestId,
      guestId: guestId,
      role,
      roomId: roomCode || 'solo',
      messages: messages.map(m => ({
        sender: m.sender,
        senderType: m.senderType,
        content: m.content,
        timestamp: m.timestamp,
      })),
      tasksCompleted: [...completedTasks],
      emergencyTriggered: isEmergencyActive,
      durationSeconds,
    };

    try {
      const { data } = await api.post('/api/session/end', payload);
      setReport(data.report, data.saved);
      navigate('/report');
    } catch (err) {
      console.error('End session error:', err);
      // Use fallback report
      setReport({
        overallScore: 55,
        communication: 55,
        taskManagement: completedTasks.size * 25,
        pressureHandling: isEmergencyActive ? 60 : 45,
        feedback: ['Session could not be evaluated — server error.', 'Your data was not saved.', 'Please try again.'],
        roadmap: [],
      }, false);
      navigate('/report');
    }
  }, [ending, timerSeconds, messages, completedTasks, isEmergencyActive, role, roomCode, user, guestId]);

  // Register end fn in store for auto-timeout
  useEffect(() => { setEndSessionFn(endSession); }, [endSession]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || aiTyping) return;
    sendMessage(text);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceResult = useCallback((transcript) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    inputRef.current?.focus();
  }, []);

  const handleEmergency = () => {
    setEmergencyActive(true);
    triggerEmergency();
  };

  if (!scenario) return null;

  // Format timer
  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const secs = String(timerSeconds % 60).padStart(2, '0');
  const timerUrgent = timerSeconds < 300; // < 5 min

  return (
    <div className="sim-layout">
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <header className="sim-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>✈</div>
            <span className="font-display" style={{ fontWeight: 700, fontSize: '0.95rem' }}>WorkPod</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {scenario.teamName} · <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{scenario.label}</span>
          </span>
          {roomCode && (
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              #{roomCode.split('-').slice(-1)[0]}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Emergency button */}
          {showEmergencyBtn && (
            <button
              id="emergency-trigger-btn"
              className="btn btn-danger btn-sm"
              onClick={handleEmergency}
              style={{ animation: 'pulse-ring 2s infinite' }}
            >
              🚨 Emergency
            </button>
          )}

          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: timerUrgent ? 'rgba(239,68,68,0.1)' : 'var(--surface-card)',
            border: `1px solid ${timerUrgent ? 'rgba(239,68,68,0.4)' : 'var(--surface-border)'}`,
            borderRadius: 8, padding: '6px 14px',
          }}>
            <span style={{ fontSize: '0.75rem' }}>⏱</span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem',
              color: timerUrgent ? 'var(--brand-danger)' : 'var(--text-primary)',
            }}>
              {mins}:{secs}
            </span>
          </div>

          {/* End session */}
          <button
            id="end-session-btn"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEndConfirm(true)}
          >
            End Session
          </button>
        </div>
      </header>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="sim-sidebar">
        <TaskSidebar scenario={scenario} timerSeconds={timerSeconds} percentElapsed={percentElapsed} />
      </aside>

      {/* ── MAIN CHAT ───────────────────────────────────────── */}
      <main className="sim-main">
        {/* Emergency banner */}
        {isEmergencyActive && (
          <EmergencyBanner label={scenario.emergencyLabel} />
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatWindow messages={messages} scenario={scenario} />
        </div>

        {/* Typing indicator */}
        {aiTyping && (
          <div style={{ padding: '4px 20px' }}>
            <TypingIndicator members={scenario.members} />
          </div>
        )}

        {/* Input area */}
        <div style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid var(--surface-border)',
          background: 'var(--surface-raised)',
        }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: 'var(--surface-input)',
            border: '1px solid var(--surface-border)',
            borderRadius: 12,
            padding: '8px 12px',
            transition: 'border-color 0.2s',
          }}>
            <textarea
              ref={inputRef}
              id="chat-input"
              placeholder={`Message ${scenario.teamName}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'var(--font-base)',
                fontSize: '0.9rem', resize: 'none', lineHeight: 1.5,
                maxHeight: 120, overflowY: 'auto',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <VoiceBtn onResult={handleVoiceResult} />
              <button
                id="send-message-btn"
                onClick={handleSend}
                disabled={!input.trim() || aiTyping}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none',
                  background: input.trim() && !aiTyping
                    ? 'linear-gradient(135deg, #6366f1, #ec4899)'
                    : 'var(--surface-hover)',
                  color: input.trim() && !aiTyping ? 'white' : 'var(--text-muted)',
                  cursor: input.trim() && !aiTyping ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, paddingLeft: 4 }}>
            Enter to send · Shift+Enter for new line · Chrome voice input supported
          </p>
        </div>
      </main>

      {/* ── END CONFIRM MODAL ───────────────────────────────── */}
      {showEndConfirm && (
        <div className="overlay" onClick={() => setShowEndConfirm(false)}>
          <div className="card" style={{ maxWidth: 400, width: '100%', padding: 36, animation: 'slideUp 0.3s both' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>End simulation?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
              Your session will be evaluated by AI and you'll receive a detailed performance report.
              {!user && ' (Not saved — you\'re in guest mode)'}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEndConfirm(false)}>
                Keep going
              </button>
              <button id="confirm-end-btn" className="btn btn-primary" style={{ flex: 1 }}
                onClick={() => { setShowEndConfirm(false); endSession('manual'); }}
                disabled={ending}>
                {ending ? <span className="spinner" /> : 'Get Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay when ending */}
      {ending && (
        <div className="overlay" style={{ flexDirection: 'column', gap: 20 }}>
          <div className="spinner" style={{ width: 48, height: 48, borderWidth: 3 }} />
          <p className="font-display" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Analyzing your performance...
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Gemini is reviewing your session transcript
          </p>
        </div>
      )}
    </div>
  );
}
