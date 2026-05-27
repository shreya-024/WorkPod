import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimStore } from '../store/useSimStore.js';
import { useSocket } from '../hooks/useSocket.js';
import { useVoice } from '../hooks/useVoice.js';
import ChatWindow from '../components/ChatWindow.jsx';
import ChatSidebar from '../components/ChatSidebar.jsx';
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
  const [showOfferLetter, setShowOfferLetter] = useState(true);
  const [chatChannel, setChatChannel] = useState('team'); // 'team' | 'mentor'
  const inputRef = useRef(null);

  const {
    role, scenario, roomCode, messages, aiTyping,
    timerSeconds, startTimer, stopTimer, resetTimer,
    isEmergencyActive, setEmergencyActive,
    completedTasks, user, guestId,
    setReport, setEndSessionFn,
    theme, setTheme,
  } = useSimStore();

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const { sendMessage, triggerEmergency } = useSocket();

  // Timer starts after offer letter is accepted
  useEffect(() => {
    if (!showOfferLetter) startTimer();
    return () => {}; // timer persists in store
  }, [showOfferLetter, startTimer]);

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
    sendMessage(text, chatChannel);
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
    <div className="sim-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <header className="sim-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--gradient-brand)',
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
            background: timerUrgent ? 'rgba(232,17,35,0.1)' : 'rgba(0,120,212,0.08)',
            border: `1px solid ${timerUrgent ? 'rgba(232,17,35,0.3)' : 'var(--brand-primary)'}`,
            borderRadius: 8, padding: '6px 14px',
          }}>
            <span style={{ fontSize: '0.75rem' }}>⏱</span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem',
              color: timerUrgent ? 'var(--brand-danger)' : 'var(--brand-primary)',
            }}>
              {mins}:{secs}
            </span>
          </div>

          {/* Theme toggle button */}
          <button
            id="theme-toggle-btn"
            className="btn btn-icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* End session */}
          <button
            id="end-session-btn"
            className="btn btn-sm"
            onClick={() => setShowEndConfirm(true)}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--brand-primary)',
              color: 'var(--brand-primary)',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--brand-primary)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface-card)';
              e.currentTarget.style.color = 'var(--brand-primary)';
            }}
          >
            End Session
          </button>
        </div>
      </header>

      {/* ── CONTENT AREA ────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Chat sidebar on the left */}
        <ChatSidebar scenario={scenario} chatChannel={chatChannel} onChannelChange={setChatChannel} />

        {/* Task sidebar */}
        <aside className="sim-sidebar">
          <TaskSidebar scenario={scenario} timerSeconds={timerSeconds} percentElapsed={percentElapsed} />
        </aside>

        {/* Main chat area on the right */}
        <main className="sim-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Emergency banner */}
          {isEmergencyActive && (
            <EmergencyBanner label={scenario.emergencyLabel} />
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
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
                placeholder={chatChannel === 'mentor'
                  ? `Ask ${scenario.mentorName || 'Team Lead'} a doubt...`
                  : `Message ${scenario.teamName}...`}
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
                      ? 'var(--brand-primary)'
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
      </div>

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

      {/* ── OFFER LETTER / PROJECT BRIEF ───────────────────── */}
      {showOfferLetter && (
        <div className="overlay">
          <div className="card" style={{ maxWidth: 760, width: '100%', padding: 34 }}>
            <p className="badge badge-primary" style={{ marginBottom: 12 }}>Offer Letter</p>
            <h2 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 8 }}>
              Welcome to {scenario.teamName}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 18, fontSize: '0.9rem' }}>
              You are joining as <strong>{scenario.label}</strong>. Review your project scope and deliverables before starting.
            </p>

            <div style={{ marginBottom: 16, padding: 14, border: '1px solid var(--surface-border)', borderRadius: 10 }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Project Brief
              </p>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                {scenario.projectBrief || `You are part of ${scenario.teamName}. Complete sprint tasks, collaborate with teammates, and handle escalation scenarios under time pressure.`}
              </p>
            </div>

            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Initial Deliverables
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {scenario.tasks.map((t) => (
                  <div key={t.id} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface-hover)' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.meta}</div>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 18 }}>
              Need clarification anytime? Switch to <strong>Ask {scenario.mentorName || 'Team Lead'}</strong> in chat to ask doubts.
            </p>

            <button className="btn btn-primary" onClick={() => setShowOfferLetter(false)} style={{ width: '100%' }}>
              Accept Offer & Start Simulation
            </button>
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
