export default function EmergencyBanner({ label }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(239,68,68,0.15), rgba(185,28,28,0.1))',
      borderBottom: '1px solid rgba(239,68,68,0.4)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'emergency-flash 2s ease-in-out infinite',
    }}>
      <span style={{
        width: 10, height: 10, borderRadius: '50%',
        background: 'var(--brand-danger)',
        boxShadow: '0 0 10px var(--brand-danger)',
        flexShrink: 0,
        animation: 'pulse-ring 1.5s infinite',
        display: 'inline-block',
      }} />
      <div>
        <p style={{
          fontWeight: 700, fontSize: '0.875rem',
          color: 'var(--brand-danger)',
          letterSpacing: '0.01em',
        }}>
          {label || '🚨 Emergency Scenario Active'}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'rgba(239,68,68,0.7)' }}>
          Respond to the crisis with your team. This is being tracked.
        </p>
      </div>
    </div>
  );
}
