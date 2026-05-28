import ThemeToggle from './ThemeToggle.jsx';

const AlertTriangle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function SimTopBar({
  scenario,
  roomCode,
  roomParticipants = [],
  timerSeconds,
  onEndSession,
  onEmergency,
  showEmergencyBtn,
}) {
  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const secs = String(timerSeconds % 60).padStart(2, '0');
  const timerCritical = timerSeconds < 300;   // < 5 min
  const timerWarn     = timerSeconds < 900;   // < 15 min

  const timerColor = timerCritical
    ? 'var(--danger)'
    : timerWarn
    ? 'var(--warning)'
    : 'var(--text-secondary)';

  const othersCount = roomParticipants.length > 1 ? roomParticipants.length - 1 : 0;

  return (
    <header className="sim-topbar">
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Work<span style={{ color: 'var(--accent)' }}>Pod</span>
        </span>
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {scenario?.teamName}
          {scenario?.label && (
            <span style={{ color: 'var(--text-primary)', marginLeft: 6 }}>
              — {scenario.label}
            </span>
          )}
        </span>
        {othersCount > 0 && (
          <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
            +{othersCount} in room
          </span>
        )}
        {roomCode && (
          <span style={{
            fontSize: '0.68rem', color: 'var(--text-tertiary)',
            fontFamily: 'monospace',
          }}>
            #{roomCode.split('-').slice(-1)[0]}
          </span>
        )}
      </div>

      {/* Center */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--success)',
          boxShadow: '0 0 6px var(--success)',
          display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
          Simulation Active
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showEmergencyBtn && (
          <button
            id="emergency-trigger-btn"
            className="btn btn-danger btn-sm"
            onClick={onEmergency}
            style={{ display: 'flex', alignItems: 'center', gap: 6, animation: 'pulse-ring 2s infinite' }}
          >
            <AlertTriangle />
            Emergency
          </button>
        )}

        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: timerCritical
            ? 'rgba(224,85,85,0.1)'
            : timerWarn
            ? 'rgba(240,165,0,0.08)'
            : 'var(--accent-muted)',
          border: `1px solid ${timerCritical ? 'rgba(224,85,85,0.3)' : timerWarn ? 'rgba(240,165,0,0.25)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '4px 12px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={timerColor} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: timerColor,
            letterSpacing: '0.05em',
          }}>
            {mins}:{secs}
          </span>
        </div>

        <button
          id="end-session-btn"
          className="btn btn-ghost btn-sm"
          onClick={onEndSession}
        >
          End Session
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
