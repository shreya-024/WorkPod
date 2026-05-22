export default function TypingIndicator({ members = [] }) {
  // Pick a random-ish member to show as typing
  const member = members[Math.floor(Date.now() / 3000) % members.length];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'fadeIn 0.2s both',
    }}>
      {member && (
        <div className="avatar" style={{
          background: member.color, color: 'white',
          width: 28, height: 28, fontSize: '0.6rem',
        }}>
          {member.avatar}
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'var(--surface-card)',
        border: '1px solid var(--surface-border)',
        borderRadius: '4px 14px 14px 14px',
        padding: '10px 14px',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: member?.color || 'var(--brand-primary)',
            display: 'inline-block',
            animation: `bounce-dots 1.4s ease-in-out ${i * 0.16}s infinite`,
          }} />
        ))}
      </div>
      {member && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {member.name} is typing...
        </span>
      )}
    </div>
  );
}
