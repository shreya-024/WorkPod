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
const PenToolIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
  </svg>
);

/* ── Section label — 11px, uppercase, letter-spacing 1px, opacity 0.5 ──── */
const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--sidebar-text)',
    opacity: 0.5,
    padding: '12px 14px 6px',
    display: 'flex', alignItems: 'center', gap: 5,
    userSelect: 'none',
  }}>
    {children}
  </div>
);

/* ── Channel row — Teams-style: left border active, subtle hover ──── */
const ChannelBtn = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      height: 34,
      padding: '0 14px',
      background: active ? 'var(--channel-active-bg)' : 'transparent',
      border: 'none',
      borderLeft: active ? '3px solid #0a66c2' : '3px solid transparent',
      borderRadius: 0,
      color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: '13px',
      fontWeight: active ? 600 : 400,
      transition: 'background 0.12s, color 0.12s, border-color 0.12s',
      textAlign: 'left',
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.background = 'var(--channel-hover-bg)';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.background = 'transparent';
      }
    }}
  >
    <span style={{ color: active ? '#0a66c2' : 'var(--sidebar-text)', opacity: active ? 1 : 0.6, flexShrink: 0, display: 'flex' }}>
      {icon || <HashIcon />}
    </span>
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  </button>
);

export default function ChatSidebar({ scenario, chatChannel, onChannelChange, onTaskClick }) {
  const { completedTasks, roomParticipants, user, guestId, timerSeconds } = useSimStore();
  const teamMembers = scenario?.members || [];
  const mentorName = scenario?.mentorName || 'Team Lead';
  const myId = user?.id || guestId;

  const elapsed = 2700 - timerSeconds;
  const percentElapsed = Math.round((elapsed / 2700) * 100);

  // Mentor avatar color — use first member's color or accent
  const mentorColor = '#0a66c2';
  const mentorInitials = mentorName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <aside style={{
      width: 260,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>

        {/* 1. CHANNELS */}
        <SectionLabel>Channels</SectionLabel>
        <div style={{ padding: '0 0 4px' }}>
          <ChannelBtn label="team-general" active={chatChannel === 'team'}       onClick={() => onChannelChange('team')} />
          <ChannelBtn label="standup"      active={false}                        onClick={() => onChannelChange('team')} />
          <ChannelBtn label="whiteboard"   active={chatChannel === 'whiteboard'} onClick={() => onChannelChange('whiteboard')} icon={<PenToolIcon />} />
          <ChannelBtn label="incidents"    active={false}                        onClick={() => onChannelChange('team')} />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 14px' }} />

        {/* 2. TEAM (AI Members) */}
        <SectionLabel>Team</SectionLabel>
        <div style={{ padding: '0 8px 4px', display: 'flex', flexDirection: 'column' }}>
          {teamMembers.map(member => (
            <div key={member.name} style={{
              height: 40,
              padding: '0 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: member.color || 'var(--accent)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
              }}>
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px', fontWeight: 500,
                  color: 'var(--sidebar-text-active)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}>
                  {member.name}
                </div>
                <div style={{
                  fontSize: '11px', color: 'var(--sidebar-text)', opacity: 0.6,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}>
                  {member.role}
                </div>
              </div>

              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--success)', flexShrink: 0,
              }} />
            </div>
          ))}

          {/* MENTOR — rendered as special person row under TEAM */}
          <button
            onClick={() => onChannelChange('mentor')}
            style={{
              height: 40,
              padding: '0 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%', border: 'none', textAlign: 'left',
              background: chatChannel === 'mentor' ? 'var(--channel-active-bg)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (chatChannel !== 'mentor') e.currentTarget.style.background = 'var(--channel-hover-bg)'; }}
            onMouseLeave={e => { if (chatChannel !== 'mentor') e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Avatar with "M" badge */}
            <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: mentorColor,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700,
              }}>
                {mentorInitials}
              </div>
              {/* Star/M badge */}
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 14, height: 14, borderRadius: '50%',
                background: '#f0a500',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '8px', fontWeight: 800,
                border: '2px solid var(--sidebar-bg)',
                lineHeight: 1,
              }}>
                M
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px', fontWeight: 500,
                color: 'var(--sidebar-text-active)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                lineHeight: 1.2,
                fontStyle: 'italic',
              }}>
                {mentorName} · Mentor
              </div>
              <div style={{
                fontSize: '11px', color: 'var(--sidebar-text)', opacity: 0.6,
                lineHeight: 1.2,
              }}>
                Team Lead
              </div>
            </div>

            {/* Accent dot instead of green */}
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#0a66c2', flexShrink: 0,
            }} />
          </button>
        </div>

        {/* 3. IN THIS ROOM (Humans Only) */}
        {roomParticipants.length > 0 && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 14px' }} />
            <SectionLabel>In This Room</SectionLabel>
            <div style={{ padding: '0 8px 4px', display: 'flex', flexDirection: 'column' }}>
              {roomParticipants.map((p, i) => (
                <div key={p.userId || i} style={{
                  height: 40,
                  padding: '0 8px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: p.userId === myId ? '#0a66c2' : 'var(--bg-tertiary)',
                    border: p.userId === myId ? 'none' : '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700,
                    color: p.userId === myId ? '#fff' : 'var(--sidebar-text)',
                    flexShrink: 0,
                  }}>
                    {(p.userName || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', fontWeight: 500,
                      color: 'var(--sidebar-text-active)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                    }}>
                      {p.userName} {p.userId === myId && <span style={{ opacity: 0.5, fontWeight: 400 }}>(you)</span>}
                    </div>
                    <div style={{
                      fontSize: '11px', color: 'var(--sidebar-text)', opacity: 0.6,
                      lineHeight: 1.2,
                    }}>
                      Participant
                    </div>
                  </div>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--success)', flexShrink: 0,
                  }} />
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 14px' }} />

        {/* 4. TASKS */}
        <SectionLabel>
          <CheckSquareIcon />
          Tasks · {completedTasks.size}/{scenario?.tasks?.length || 0} done
        </SectionLabel>
        <div style={{ padding: '0 8px 10px', display: 'flex', flexDirection: 'column' }}>
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
                  opacity: done ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'var(--channel-hover-bg)'; }}
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
                  color: done ? 'var(--sidebar-text)' : 'var(--sidebar-text-active)',
                  textDecoration: done ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1,
                  opacity: done ? 0.6 : 1,
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

      {/* 5. SESSION PROGRESS — pinned to bottom */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--sidebar-bg)', flexShrink: 0 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '11px', color: 'var(--sidebar-text)', opacity: 0.7, marginBottom: 5,
        }}>
          <span>{completedTasks.size}/{scenario?.tasks?.length || 0} tasks</span>
          <span>{percentElapsed}% complete</span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            width: `${percentElapsed}%`, height: '100%',
            background: '#0a66c2',
            borderRadius: 99, transition: 'width 1s linear',
          }} />
        </div>
      </div>
    </aside>
  );
}
