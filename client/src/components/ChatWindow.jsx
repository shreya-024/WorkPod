import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';

const WaveIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

/** Returns "Today", "Yesterday", or a date string */
function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today - msgDay) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Check if two messages are on different days */
function isDifferentDay(a, b) {
  if (!a?.timestamp || !b?.timestamp) return false;
  const da = new Date(a.timestamp);
  const db = new Date(b.timestamp);
  return da.getDate() !== db.getDate() || da.getMonth() !== db.getMonth() || da.getFullYear() !== db.getFullYear();
}

const QUICK_STARTERS = [
  "Let's get started on tasks",
  "What's the priority today?",
  "Can someone give me an update?",
];

export default function ChatWindow({ messages, scenario, onQuickSend }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const memberMap = {};
  scenario?.members.forEach(m => { memberMap[m.name] = m; });

  // Check if we should show quick starters (no user messages yet)
  const hasUserMessage = messages.some(m => m.senderType === 'user');

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      background: 'var(--chat-bg, var(--bg-primary))',
    }}>
      {/* Welcome state with quick starters */}
      {messages.length === 0 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 40,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--accent-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <WaveIcon />
          </div>
          <h3 className="font-display" style={{ fontWeight: 700, marginBottom: 8, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
            Welcome to {scenario?.teamName}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 380, lineHeight: 1.65 }}>
            Your AI teammates are ready to collaborate. Say hello or jump straight into your tasks.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {QUICK_STARTERS.map(s => (
              <button key={s}
                onClick={() => onQuickSend && onQuickSend(s)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-base)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#0a66c2';
                  e.currentTarget.style.color = '#0a66c2';
                  e.currentTarget.style.background = 'var(--accent-muted)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick starters when there are system messages but no user messages yet */}
      {messages.length > 0 && !hasUserMessage && (
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          padding: '16px 0', flexWrap: 'wrap',
        }}>
          {QUICK_STARTERS.map(s => (
            <button key={s}
              onClick={() => onQuickSend && onQuickSend(s)}
              style={{
                padding: '6px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-base)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#0a66c2';
                e.currentTarget.style.color = '#0a66c2';
                e.currentTarget.style.background = 'var(--accent-muted)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'var(--bg-card)';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const showDateSep = i === 0 || isDifferentDay(prev, msg);
        return (
          <div key={msg.id || i}>
            {/* Date separator */}
            {showDateSep && msg.timestamp && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '16px 0 8px',
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                }}>
                  {formatDateLabel(msg.timestamp)}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
            )}
            <MessageBubble
              msg={msg}
              memberMap={memberMap}
              prevMsg={prev}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
