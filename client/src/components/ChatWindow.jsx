import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWindow({ messages, scenario }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build member lookup: name -> member config
  const memberMap = {};
  scenario?.members.forEach(m => { memberMap[m.name] = m; });

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      padding: '24px 40px',
      display: 'flex', flexDirection: 'column', gap: 2,
      background: '#ffffff',
    }}>
      {/* Welcome message */}
      {messages.length === 0 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 40,
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>👋</div>
          <h3 className="font-display" style={{ fontWeight: 600, marginBottom: 8, fontSize: '1.5rem' }}>
            Welcome to {scenario?.teamName}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 400, lineHeight: 1.6 }}>
            Say hello or jump straight into your tasks. Your AI teammates are ready to collaborate.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              "Let's get started on our tasks",
              "What's the priority today?",
              "Can someone give me an update?",
            ].map(s => (
              <span key={s} style={{
                padding: '6px 12px',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: 20, fontSize: '0.8rem',
                color: 'var(--text-secondary)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0078d4'; e.currentTarget.style.backgroundColor = '#eef6fc'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
              >
                "{s}"
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
