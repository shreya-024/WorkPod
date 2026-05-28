const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function EmergencyBanner({ label }) {
  return (
    <div style={{
      background: 'rgba(224,85,85,0.08)',
      borderBottom: '1px solid rgba(224,85,85,0.3)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'emergency-flash 2s ease-in-out infinite',
      flexShrink: 0,
    }}>
      {/* Pulsing dot */}
      <span style={{
        width: 9, height: 9, borderRadius: '50%',
        background: 'var(--danger)',
        boxShadow: '0 0 8px var(--danger)',
        flexShrink: 0,
        animation: 'pulse-ring 1.5s infinite',
        display: 'inline-block',
      }} />

      <span style={{ color: 'var(--danger)', flexShrink: 0 }}>
        <WarningIcon />
      </span>

      <div>
        <p style={{
          fontWeight: 700, fontSize: '0.875rem',
          color: 'var(--danger)',
          letterSpacing: '0.01em',
        }}>
          {label || 'Emergency Scenario Active'}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'rgba(224,85,85,0.75)' }}>
          Respond to the crisis with your team. This is being tracked.
        </p>
      </div>
    </div>
  );
}
