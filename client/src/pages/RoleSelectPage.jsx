import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimStore } from '../store/useSimStore.js';
import { ROLES, getScenario } from '../scenarios/index.js';
import api from '../lib/api.js';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { setRole, setRoomCode, user, guestId, resetSim } = useSimStore();
  const [counts, setCounts] = useState({ sde: 0, hr: 0, pm: 0 });
  const [selecting, setSelecting] = useState(null);

  // Reset any previous sim on mount
  useEffect(() => { resetSim(); }, []);

  // Poll live counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const results = await Promise.all(
          ROLES.map(r => api.get(`/api/room/count/${r.id}`))
        );
        const next = {};
        results.forEach(({ data }) => { next[data.role] = data.count; });
        setCounts(next);
      } catch {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = async (roleId) => {
    setSelecting(roleId);
    const scenario = getScenario(roleId);
    setRole(roleId, scenario);
    // roomCode will be set by socket on join-room ack
    navigate('/sim');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient bg */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>✈</div>
          <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>WorkPod</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar" style={{ background: 'var(--brand-primary)', color: 'white', width: 32, height: 32, fontSize: '0.7rem' }}>
                {user.name?.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.name}</span>
            </div>
          ) : (
            <span className="badge badge-primary">👤 Guest Mode</span>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', zIndex: 2 }}>
        <div className="animate-fadeIn" style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Choose your role
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            45-minute simulation · AI teammates · Real emergency scenarios
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          width: '100%',
          maxWidth: 1000,
        }}>
          {ROLES.map((role, i) => {
            const scenario = getScenario(role.id);
            const isLoading = selecting === role.id;
            return (
              <button
                key={role.id}
                id={`role-card-${role.id}`}
                onClick={() => handleSelect(role.id)}
                disabled={!!selecting}
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 20,
                  padding: '32px 28px',
                  cursor: selecting ? 'wait' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideUp 0.5s ${i * 100}ms both`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = `1px solid ${role.color}`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${role.color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1px solid var(--surface-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: role.gradient, opacity: 0.8,
                }} />

                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${role.color}20`,
                  border: `1px solid ${role.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', marginBottom: 20,
                }}>
                  {role.icon}
                </div>

                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{role.label}</h2>
                  {counts[role.id] > 0 && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: '0.75rem', color: 'var(--brand-accent)',
                      background: 'rgba(16,185,129,0.1)', padding: '3px 10px',
                      borderRadius: 20,
                    }}>
                      <span style={{ width: 6, height: 6, background: 'var(--brand-accent)', borderRadius: '50%', display: 'inline-block' }} />
                      {counts[role.id]} live
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
                  {role.description}
                </p>

                {/* Team members */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI Teammates
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {scenario?.members.map(m => (
                      <div key={m.id} title={`${m.name} — ${m.role}`} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: m.color, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700,
                        border: '2px solid var(--surface-card)',
                      }}>
                        {m.avatar}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {scenario?.tasks.slice(0, 2).map(t => (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.8rem', color: 'var(--text-muted)',
                    }}>
                      <span style={{ width: 14, height: 14, borderRadius: 4, border: '1px solid var(--surface-border)', flexShrink: 0 }} />
                      {t.title}
                    </div>
                  ))}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+2 more tasks...</div>
                </div>

                {/* CTA */}
                <div style={{
                  marginTop: 28,
                  background: role.gradient,
                  color: 'white',
                  borderRadius: 10,
                  padding: '12px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}>
                  {isLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <>Join Simulation →</>}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
