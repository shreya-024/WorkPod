import { useSimStore } from '../store/useSimStore.js';

// ── SVG Icons ──────────────────────────────────────────────────────
const HashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);
const CheckSquareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const UserGroupIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const GraduationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-tertiary)',
    padding: '14px 12px 6px',
  }}>
    {children}
  </div>
);

const ChannelBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '7px 10px',
      marginBottom: 2,
      background: active ? 'var(--accent-muted)' : 'transparent',
      border: 'none',
      borderRadius: 6,
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: '0.85rem',
      fontWeight: active ? 600 : 400,
      transition: 'all 0.15s',
      textAlign: 'left',
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.background = 'var(--bg-tertiary)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }
    }}
  >
    <span style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)', flexShrink: 0 }}>
      <HashIcon />
    </span>
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  </button>
);

export default function ChatSidebar({ scenario, chatChannel, onChannelChange, onTaskClick }) {
  const { completedTasks } = useSimStore();
  const teamMembers = scenario?.members || [];
  const mentorName = scenario?.mentorName || 'Team Lead';

  return (
    <aside style={{
      width: 240,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* CHANNELS */}
        <SectionLabel>Channels</SectionLabel>
        <div style={{ padding: '0 8px 4px' }}>
          <ChannelBtn label="team-general" active={chatChannel === 'team'}   onClick={() => onChannelChange('team')} />
          <ChannelBtn label="standup"      active={false}                    onClick={() => onChannelChange('team')} />
          <ChannelBtn label="incidents"    active={false}                    onClick={() => onChannelChange('team')} />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 12px' }} />

        {/* TEAM */}
        <SectionLabel>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <UserGroupIcon /> Team
          </span>
        </SectionLabel>
        <div style={{ padding: '0 8px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {teamMembers.map(member => (
            <div key={member.name} style={{
              padding: '7px 10px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: member.color || 'var(--accent)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
              }}>
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>

              {/* Name + role */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {member.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {member.role}
                </div>
              </div>

              {/* Online dot */}
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--success)', flexShrink: 0,
                boxShadow: '0 0 4px var(--success)',
              }} />
            </div>
          ))}

          {/* Mentor */}
          <button
            onClick={() => onChannelChange('mentor')}
            style={{
              padding: '7px 10px', borderRadius: 6,
              background: chatChannel === 'mentor' ? 'var(--accent-muted)' : 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', textAlign: 'left',
            }}
            onMouseEnter={e => { if (chatChannel !== 'mentor') e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={e => { if (chatChannel !== 'mentor') e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
            }}>
              <GraduationIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: chatChannel === 'mentor' ? 'var(--accent)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mentorName}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Team Lead</div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', flexShrink: 0, boxShadow: '0 0 4px var(--success)' }} />
          </button>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 12px' }} />

        {/* YOUR TASKS */}
        <SectionLabel>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckSquareIcon />
            Your Tasks · {completedTasks.size}/{scenario?.tasks?.length || 0}
          </span>
        </SectionLabel>
        <div style={{ padding: '0 8px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {(scenario?.tasks || []).map(task => {
            const done = completedTasks.has(task.id);
            return (
              <button
                key={task.id}
                onClick={() => onTaskClick && onTaskClick(task.id, task.title)}
                style={{
                  width: '100%', padding: '8px 10px',
                  borderRadius: 6, border: 'none',
                  background: done ? 'rgba(46,204,138,0.06)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  transition: 'background 0.15s',
                  opacity: done ? 0.65 : 1,
                }}
                onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = done ? 'rgba(46,204,138,0.06)' : 'transparent'; }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${done ? 'var(--success)' : 'var(--border-hover)'}`,
                  background: done ? 'var(--success)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 2, transition: 'all 0.2s', color: '#fff',
                }}>
                  {done && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.78rem', fontWeight: 500,
                    color: done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    textDecoration: done ? 'line-through' : 'none',
                    lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {task.title}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{task.meta}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
