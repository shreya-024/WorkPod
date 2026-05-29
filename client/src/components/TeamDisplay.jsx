import { useState } from 'react';

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

const BotIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>
);

export default function TeamDisplay({ participants, teamComposition, role }) {
  const [expanded, setExpanded] = useState(false);

  if (!participants || participants.length === 0) return null;

  const humans = participants.filter(p => p.isHuman);
  const showTeamInfo = teamComposition !== null;

  return (
    <div style={{
      padding: '12px 16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      marginBottom: 12,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}>
            Team ({participants.length})
          </div>
          {showTeamInfo && (
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              background: teamComposition === 'mix-humans' ? 'var(--success)20' : 'var(--accent)20',
              color: teamComposition === 'mix-humans' ? 'var(--success)' : 'var(--accent)',
              borderRadius: 12,
              fontWeight: 600,
            }}>
              {teamComposition === 'mix-humans' ? `${humans.length} Human${humans.length !== 1 ? 's' : ''}` : 'AI Only'}
            </span>
          )}
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--text-secondary)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded team list */}
      {expanded && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {participants.map((p, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: 'var(--bg-primary)',
                borderRadius: 8,
                fontSize: '0.85rem',
              }}
            >
              {p.isHuman ? (
                <>
                  <UserIcon />
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    {p.userName}
                  </span>
                </>
              ) : (
                <>
                  <BotIconSmall />
                  <span style={{ color: 'var(--accent)' }}>
                    {p.userName}
                  </span>
                </>
              )}
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}>
                {p.isHuman ? '👤 Human' : '🤖 AI'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
