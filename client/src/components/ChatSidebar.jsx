/**
 * ChatSidebar - Left sidebar with chat channels (Teams-style layout)
 */
export default function ChatSidebar({ scenario, chatChannel, onChannelChange }) {
  const teamMembers = scenario?.members || [];
  const mentorName = scenario?.mentorName || 'Team Lead';

  return (
    <aside style={{
      width: '260px',
      background: 'var(--surface-raised)',
      borderRight: '1px solid var(--surface-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--surface-border)',
      }}>
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: 0,
        }}>
          Channels
        </h3>
      </div>

      {/* Chat channels */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
      }}>
        {/* Team Chat */}
        <button
          onClick={() => onChannelChange('team')}
          style={{
            width: '100%',
            padding: '10px 12px',
            marginBottom: '4px',
            background: chatChannel === 'team' ? 'var(--surface-hover)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: chatChannel === 'team' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: chatChannel === 'team' ? 600 : 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (chatChannel !== 'team') {
              e.currentTarget.style.background = 'var(--surface-card)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={e => {
            if (chatChannel !== 'team') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <span style={{ fontSize: '1rem' }}>👥</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {scenario?.teamName || 'Team Chat'}
          </span>
        </button>

        {/* Mentor Chat */}
        <button
          onClick={() => onChannelChange('mentor')}
          style={{
            width: '100%',
            padding: '10px 12px',
            marginBottom: '12px',
            background: chatChannel === 'mentor' ? 'var(--surface-hover)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: chatChannel === 'mentor' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: chatChannel === 'mentor' ? 600 : 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (chatChannel !== 'mentor') {
              e.currentTarget.style.background = 'var(--surface-card)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={e => {
            if (chatChannel !== 'mentor') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <span style={{ fontSize: '1rem' }}>🎓</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mentorName}
          </span>
        </button>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'var(--surface-border)',
          margin: '8px 0 12px',
        }} />

        {/* Team members section */}
        <div style={{ paddingLeft: '4px' }}>
          <h4 style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 8px 8px',
          }}>
            Team ({teamMembers.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {teamMembers.map((member) => (
              <div
                key={member.name}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--surface-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '40px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--surface-card)';
                  e.currentTarget.style.borderColor = 'var(--surface-border)';
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: member.color || 'var(--brand-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>

                {/* Name and role */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {member.name}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {member.role}
                  </div>
                </div>

                {/* Online status indicator */}
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--brand-accent)',
                    flexShrink: 0,
                    animation: 'pulse 2s infinite',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
