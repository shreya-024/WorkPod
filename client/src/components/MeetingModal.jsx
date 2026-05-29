const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function MeetingModal({ scenarioName, roomId, role, onClose }) {
  const jitsiRoom = `workpod-${roomId || (role + '-' + Date.now())}`;
  const jitsiUrl = `https://meet.jit.si/${jitsiRoom}`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90vw', height: '85vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Team Meeting — {scenarioName}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              width: 30, height: 30, borderRadius: 6,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Jitsi iframe */}
        <div style={{ flex: 1, position: 'relative' }}>
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture"
            allowFullScreen
            style={{
              width: '100%', height: '100%',
              border: 'none',
            }}
            title="Jitsi Meeting"
          />
        </div>

        {/* Footer note */}
        <div style={{
          padding: '8px 20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', gap: 6,
          flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            Allow camera/microphone when prompted · Share this link with teammates to join
          </span>
        </div>
      </div>
    </div>
  );
}
