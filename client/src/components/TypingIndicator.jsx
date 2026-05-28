export default function TypingIndicator({ members = [] }) {
  const member = members[Math.floor(Date.now() / 3000) % members.length];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      animation: 'fadeIn 0.2s both',
    }}>
      {member && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: member.color || 'var(--accent)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.58rem', fontWeight: 700, flexShrink: 0,
        }}>
          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: '0 10px 10px 10px',
        padding: '9px 12px',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: member?.color || 'var(--accent)',
            display: 'inline-block',
            animation: `bounce-dots 1.4s ease-in-out ${i * 0.16}s infinite`,
          }} />
        ))}
      </div>

      {member && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          {member.name} is typing...
        </span>
      )}
    </div>
  );
}
