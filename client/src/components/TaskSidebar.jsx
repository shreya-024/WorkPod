import { useSimStore } from '../store/useSimStore.js';

function TimerRing({ seconds, total = 2700 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = seconds / total;
  const dashOffset = circ * (1 - progress);
  const color = seconds < 300 ? '#ef4444' : seconds < 600 ? '#f59e0b' : '#6366f1';

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--surface-hover)" strokeWidth="5" />
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
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="monospace">
          {mins}:{secs}
        </text>
      </svg>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>Remaining</p>
    </div>
  );
}

export default function TaskSidebar({ scenario, timerSeconds, percentElapsed }) {
  const { completedTasks, toggleTask, roomParticipants, user, guestId } = useSimStore();

  const myId = user?.id || guestId;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Timer */}
      <div style={{ borderBottom: '1px solid var(--surface-border)', padding: '0 16px' }}>
        <TimerRing seconds={timerSeconds} />
        {/* Progress bar */}
        <div style={{ paddingBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Progress</span>
            <span>{percentElapsed}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--surface-hover)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${percentElapsed}%`, height: '100%',
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              borderRadius: 99, transition: 'width 1s linear',
            }} />
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          AI Teammates
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scenario.members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar" style={{
                background: m.color, color: 'white',
                width: 32, height: 32, fontSize: '0.65rem',
                boxShadow: `0 0 8px ${m.color}50`,
              }}>
                {m.avatar}
              </div>
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{m.name}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.role}</p>
              </div>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--brand-accent)',
                marginLeft: 'auto', flexShrink: 0,
                boxShadow: '0 0 6px var(--brand-accent)',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ padding: '16px', flex: 1 }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Tasks · {completedTasks.size}/{scenario.tasks.length} done
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scenario.tasks.map(task => {
            const done = completedTasks.has(task.id);
            return (
              <button
                key={task.id}
                id={`task-btn-${task.id}`}
                onClick={() => toggleTask(task.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: done ? 'rgba(16,185,129,0.06)' : 'var(--surface-hover)',
                  border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'var(--surface-border)'}`,
                  borderRadius: 10, padding: '10px 12px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${done ? 'var(--brand-accent)' : 'var(--surface-border)'}`,
                  background: done ? 'var(--brand-accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1, transition: 'all 0.2s',
                  fontSize: '0.7rem', color: 'white',
                }}>
                  {done && '✓'}
                </div>
                <div>
                  <p style={{
                    fontSize: '0.82rem', fontWeight: 500,
                    color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: done ? 'line-through' : 'none',
                    lineHeight: 1.4,
                  }}>
                    {task.title}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{task.meta}</p>
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    fontSize: '0.7rem', fontWeight: 600,
                    color: 'var(--brand-warning)',
                    background: 'rgba(245,158,11,0.1)',
                    padding: '2px 8px', borderRadius: 10,
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
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--surface-border)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            In this room · {roomParticipants.length}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {roomParticipants.map((p, i) => (
              <div key={p.userId || i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: p.userId === myId ? 'var(--brand-primary)' : 'var(--surface-hover)',
                  border: '1px solid var(--surface-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)',
                }}>
                  {(p.userName || 'U').slice(0, 1).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {p.userName}
                  {p.userId === myId && <span style={{ color: 'var(--brand-primary)', marginLeft: 4 }}>(you)</span>}
                </span>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--brand-accent)', marginLeft: 'auto',
                  boxShadow: '0 0 5px var(--brand-accent)',
                }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
