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

export default function ChatWindow({ messages, scenario }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const memberMap = {};
  scenario?.members.forEach(m => { memberMap[m.name] = m; });

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      background: 'var(--bg-primary)',
    }}>
      {/* Welcome state */}
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
            {[
              "Let's get started on our tasks",
              "What's the priority today?",
              "Can someone give me an update?",
            ].map(s => (
              <span key={s} style={{
                padding: '6px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-muted)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <MessageBubble
          key={msg.id || i}
          msg={msg}
          memberMap={memberMap}
          prevMsg={messages[i - 1]}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
