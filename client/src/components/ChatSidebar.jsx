import { useSimStore } from '../store/useSimStore.js';

// ── SVG Icons ──────────────────────────────────────────────────────
const HashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);
const CheckSquareIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const UserGroupIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const GraduationIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

/* ── Section label — tight, Teams-style ──── */
const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-tertiary)',
    padding: '10px 10px 4px',
    display: 'flex', alignItems: 'center', gap: 4,
  }}>
    {children}
  </div>
);

/* ── Channel row — 32px height, Teams density ──── */
const ChannelBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      height: 32,
      padding: '0 10px',
      background: active ? 'var(--accent)' : 'transparent',
      border: 'none',
      borderRadius: 4,
      color: active ? '#ffffff' : 'var(--text-secondary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '0.75rem',
      fontWeight: active ? 600 : 400,
      transition: 'background 0.12s, color 0.12s',
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
    <span style={{ color: active ? '#ffffff' : 'var(--text-tertiary)', flexShrink: 0, opacity: 0.8 }}>
      <HashIcon />
    </span>
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  </button>
);

export default function ChatSidebar({ scenario, chatChannel, onChannelChange, onTaskClick }) {
  const { completedTasks, roomParticipants, user, guestId, timerSeconds } = useSimStore();
  const teamMembers = scenario?.members || [];
  const myId = user?.id || guestId;

  const elapsed = 2700 - timerSeconds;
  const percentElapsed = Math.round((elapsed / 2700) * 100);

  return (
    <aside style={{
      width: 260,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>

        {/* 1. CHANNELS */}
        <SectionLabel><HashIcon /> Channels</SectionLabel>
        <div style={{ padding: '0 6px 4px' }}>
          <ChannelBtn label="team-general" active={chatChannel === 'team'}   onClick={() => onChannelChange('team')} />
          <ChannelBtn label="standup"      active={false}                    onClick={() => onChannelChange('team')} />
          {/* Mentor — clickable row as channel */}
          <button
            onClick={() => onChannelChange('mentor')}
            style={{
              height: 32, padding: '0 10px', borderRadius: 4,
              background: chatChannel === 'mentor' ? 'var(--accent)' : 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', textAlign: 'left',
              color: chatChannel === 'mentor' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.75rem', fontWeight: chatChannel === 'mentor' ? 600 : 400,
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => {
              if (chatChannel !== 'mentor') {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
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
            <span style={{ color: chatChannel === 'mentor' ? '#ffffff' : 'var(--text-tertiary)', flexShrink: 0, opacity: 0.8 }}>
              <GraduationIcon />
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              mentor
            </span>
          </button>
          <ChannelBtn label="incidents"    active={false}                    onClick={() => onChannelChange('team')} />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '6px 10px' }} />

        {/* 2. TEAM MEMBERS (AI Only) */}
        <SectionLabel><UserGroupIcon /> Team</SectionLabel>
        <div style={{ padding: '0 6px 4px', display: 'flex', flexDirection: 'column' }}>
          {teamMembers.map(member => (
            <div key={member.name} style={{
              height: 36,
              padding: '0 10px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: member.color || 'var(--accent)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
              }}>
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                  fontSize: '13px', fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}>
                  {member.name}
                </div>
                <div style={{
                  fontSize: '11px', color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}>
                  {member.role}
                </div>
              </div>

              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--success)', flexShrink: 0,
              }} />
            </div>
          ))}
        </div>

        {/* 3. IN THIS ROOM (Humans Only) */}
        {roomParticipants.length > 0 && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '6px 10px' }} />
            <SectionLabel><UserGroupIcon /> In This Room</SectionLabel>
            <div style={{ padding: '0 6px 4px', display: 'flex', flexDirection: 'column' }}>
              {roomParticipants.map((p, i) => (
                <div key={p.userId || i} style={{
                  height: 36,
                  padding: '0 10px',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: p.userId === myId ? 'var(--accent)' : 'var(--bg-tertiary)',
                    border: p.userId === myId ? 'none' : '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700,
                    color: p.userId === myId ? '#fff' : 'var(--text-secondary)',
                    flexShrink: 0,
                  }}>
                    {(p.userName || 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{
                      fontSize: '13px', fontWeight: 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                    }}>
                      {p.userName} {p.userId === myId && <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(you)</span>}
                    </div>
                    <div style={{
                      fontSize: '11px', color: 'var(--text-secondary)',
                      lineHeight: 1.2,
                    }}>
                      Participant
                    </div>
                  </div>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--success)', flexShrink: 0,
                  }} />
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ height: 1, background: 'var(--border)', margin: '6px 10px' }} />

        {/* 4. TASKS */}
        <SectionLabel>
          <CheckSquareIcon />
          Tasks · {completedTasks.size}/{scenario?.tasks?.length || 0} done
        </SectionLabel>
        <div style={{ padding: '0 6px 10px', display: 'flex', flexDirection: 'column' }}>
          {(scenario?.tasks || []).map((task, idx, arr) => {
            const done = completedTasks.has(task.id);
            const isLast = idx === arr.length - 1;
            return (
              <button
                key={task.id}
                onClick={() => onTaskClick && onTaskClick(task.id, task.title)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  borderRadius: 4,
                  padding: '7px 8px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s', width: '100%',
                  opacity: done ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  border: `1.5px solid ${done ? 'var(--success)' : 'var(--border-hover)'}`,
                  background: done ? 'var(--success)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', transition: 'all 0.15s',
                }}>
                  {done && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  textDecoration: done ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {task.title}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  color: 'var(--warning)',
                  flexShrink: 0,
                }}>
                  +{task.points}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SESSION PROGRESS */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600,
        }}>
          <span>{completedTasks.size}/{scenario?.tasks?.length || 0} tasks</span>
          <span>{percentElapsed}% complete</span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            width: `${percentElapsed}%`, height: '100%',
            background: 'var(--accent)',
            borderRadius: 99, transition: 'width 1s linear',
          }} />
        </div>
      </div>
    </aside>
  );
}
