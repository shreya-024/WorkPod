import { useSimStore } from '../store/useSimStore.js';

function TimerRing({ seconds, total = 2700 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = seconds / total;
  const dashOffset = circ * (1 - progress);
  const color = seconds < 300 ? 'var(--danger)' : seconds < 600 ? 'var(--warning)' : 'var(--accent)';

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r}
          fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          filter={`drop-shadow(0 0 4px ${color})`}
        />
        {/* Timer text: use dominant-baseline for vertical centering */}
        <text
          x="36" y="40"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="11"
          fontWeight="700"
          fontFamily="monospace"
        >
          {mins}:{secs}
        </text>
      </svg>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 6 }}>Remaining</p>
    </div>
  );
}

export default function TaskSidebar({ scenario, timerSeconds, percentElapsed, onTaskClick }) {
  const { completedTasks, roomParticipants, user, guestId } = useSimStore();
  const myId = user?.id || guestId;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Timer */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
        <TimerRing seconds={timerSeconds} />
        <div style={{ paddingBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>
            <span>Progress</span>
            <span>{percentElapsed}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${percentElapsed}%`, height: '100%',
              background: 'var(--accent)',
              borderRadius: 99, transition: 'width 1s linear',
            }} />
          </div>
        </div>
      </div>

      {/* AI Teammates */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <p style={{
          fontSize: '0.68rem', color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 700,
        }}>
          AI Teammates
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scenario.members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: m.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
                boxShadow: `0 0 8px ${m.color}40`,
              }}>
                {m.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.role}</p>
              </div>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--success)', marginLeft: 'auto', flexShrink: 0,
                boxShadow: '0 0 5px var(--success)',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <p style={{
          fontSize: '0.68rem', color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 700,
        }}>
          Tasks · {completedTasks.size}/{scenario.tasks.length} done
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {scenario.tasks.map(task => {
            const done = completedTasks.has(task.id);
            return (
              <button
                key={task.id}
                id={`task-btn-${task.id}`}
                onClick={() => onTaskClick && onTaskClick(task.id, task.title)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: done ? 'rgba(46,204,138,0.06)' : 'var(--bg-tertiary)',
                  border: `1px solid ${done ? 'rgba(46,204,138,0.25)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '10px 10px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', width: '100%',
                  opacity: done ? 0.7 : 1,
                }}
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
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '0.8rem', fontWeight: 500,
                    color: done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    textDecoration: done ? 'line-through' : 'none',
                    lineHeight: 1.4,
                  }}>
                    {task.title}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 3 }}>{task.meta}</p>
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    fontSize: '0.68rem', fontWeight: 600,
                    color: 'var(--warning)',
                    background: 'rgba(240,165,0,0.1)',
                    padding: '2px 7px', borderRadius: 8,
                  }}>
                    +{task.points}pts
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Room participants */}
      {roomParticipants.length > 0 && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
          <p style={{
            fontSize: '0.68rem', color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 700,
          }}>
            In this room · {roomParticipants.length}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {roomParticipants.map((p, i) => (
              <div key={p.userId || i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: p.userId === myId ? 'var(--accent)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 700, color: p.userId === myId ? '#fff' : 'var(--text-secondary)',
                }}>
                  {(p.userName || 'U').slice(0, 1).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>
                  {p.userName}
                  {p.userId === myId && (
                    <span style={{ color: 'var(--accent)', marginLeft: 4, fontSize: '0.7rem' }}>(you)</span>
                  )}
                </span>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--success)',
                  boxShadow: '0 0 4px var(--success)',
                }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
