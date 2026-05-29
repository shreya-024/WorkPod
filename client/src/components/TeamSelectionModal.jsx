import { useEffect, useState } from 'react';
import { useSimStore } from '../store/useSimStore.js';

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4m0 4v.01M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function TeamSelectionModal({ onSelect, role, availableHumans = [], loadingHumans = false }) {
  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { teamComposition } = useSimStore();

  const hasHumans = availableHumans.length > 0;

  const handleSelect = (type) => {
    setSelected(type);
    setShowDetails(true);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '40px 32px',
        maxWidth: 500,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Choose Your Team
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          marginBottom: 28,
        }}>
          Select whether you want to work with AI teammates only or join with real people.
        </p>

        {/* Option 1: All AI */}
        <button
          onClick={() => handleSelect('all-ai')}
          style={{
            width: '100%',
            padding: '20px 24px',
            marginBottom: 16,
            background: selected === 'all-ai' ? 'var(--accent)10' : 'var(--bg-primary)',
            border: selected === 'all-ai' ? '2px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 12,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
          }}
          onMouseEnter={(e) => {
            if (selected !== 'all-ai') {
              e.currentTarget.style.borderColor = 'var(--accent)40';
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== 'all-ai') {
              e.currentTarget.style.borderColor = 'var(--border)';
            }
          }}
        >
          <div style={{ paddingTop: 2 }}>
            <BotIcon />
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              All AI Teammates
              {selected === 'all-ai' && <CheckCircleIcon />}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}>
              Work solo with AI-powered team members. Perfect for practice and experimentation.
            </div>
          </div>
        </button>

        {/* Option 2: Mix with Humans */}
        <button
          onClick={() => handleSelect('mix-humans')}
          disabled={!hasHumans && !loadingHumans}
          style={{
            width: '100%',
            padding: '20px 24px',
            marginBottom: 24,
            background: selected === 'mix-humans' ? 'var(--accent)10' : 'var(--bg-primary)',
            border: selected === 'mix-humans'
              ? '2px solid var(--accent)'
              : (hasHumans || loadingHumans)
                ? '1px solid var(--border)'
                : '1px solid var(--border)40',
            borderRadius: 12,
            cursor: (hasHumans || loadingHumans) ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            opacity: (hasHumans || loadingHumans) ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (selected !== 'mix-humans' && hasHumans) {
              e.currentTarget.style.borderColor = 'var(--accent)40';
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== 'mix-humans' && hasHumans) {
              e.currentTarget.style.borderColor = 'var(--border)';
            }
          }}
        >
          <div style={{ paddingTop: 2 }}>
            <UsersIcon />
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              Join with Humans
              {selected === 'mix-humans' && <CheckCircleIcon />}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: 8,
            }}>
              {loadingHumans
                ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spinner" style={{ width: 12, height: 12, borderTopColor: 'var(--accent)' }} />
                    Searching for available players...
                  </span>
                )
                : hasHumans
                  ? `${availableHumans.reduce((sum, room) => sum + room.humanCount, 0)} people available to join`
                  : 'No humans available right now'}
            </div>

            {/* Show available humans */}
            {hasHumans && selected === 'mix-humans' && (
              <div style={{
                marginTop: 12,
                padding: '12px',
                background: 'var(--bg-primary)20',
                borderRadius: 8,
                fontSize: '0.8rem',
              }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <strong>Available humans:</strong>
                </div>
                {availableHumans.map((room, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: idx < availableHumans.length - 1 ? 6 : 0,
                  }}>
                    🟢 {room.humanCount} player{room.humanCount !== 1 ? 's' : ''} in room {room.roomCode}
                  </div>
                ))}
              </div>
            )}
          </div>
        </button>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
        }}>
          <button
            onClick={() => {
              setSelected(null);
              setShowDetails(false);
            }}
            disabled={teamComposition !== null}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              cursor: teamComposition ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              opacity: teamComposition ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || teamComposition !== null}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: selected && !teamComposition ? 'var(--accent)' : 'var(--accent)40',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: selected && !teamComposition ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (selected && !teamComposition) {
                e.currentTarget.style.background = 'var(--accent)dd';
              }
            }}
            onMouseLeave={(e) => {
              if (selected && !teamComposition) {
                e.currentTarget.style.background = 'var(--accent)';
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
