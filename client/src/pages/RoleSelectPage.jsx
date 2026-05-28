import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimStore } from '../store/useSimStore.js';
import { ROLES, getScenario } from '../scenarios/index.js';
import api from '../lib/api.js';
import Navbar from '../components/Navbar.jsx';

const ROLE_META = {
  sde: {
    accent: 'var(--accent)',
    difficulty: 'Intermediate',
    tasks: [
      'Review critical pull requests',
      'Fix failing CI/CD pipeline',
      'Debug production auth issue',
      'Write unit tests (80% coverage)',
    ],
  },
  hr: {
    accent: '#2ecc8a',
    difficulty: 'Beginner',
    tasks: [
      'Complete new hire onboarding',
      'Conduct performance review',
      'Handle employee complaint',
      'Allocate L&D budget',
    ],
  },
  pm: {
    accent: '#f0a500',
    difficulty: 'Intermediate',
    tasks: [
      'Write product spec for new feature',
      'Align cross-functional stakeholders',
      'Analyze beta metrics dashboard',
      'Draft launch announcement',
    ],
  },
};

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const LiveDot = () => (
  <span style={{
    width: 7, height: 7, borderRadius: '50%',
    background: 'var(--success)',
    display: 'inline-block',
    boxShadow: '0 0 5px var(--success)',
    animation: 'pulse 2s infinite',
  }} />
);

const UsersIconSm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { setRole, setRoomCode, user, guestId, resetSim } = useSimStore();
  const [counts, setCounts] = useState({ sde: 0, hr: 0, pm: 0 });
  const [selecting, setSelecting] = useState(null);

  useEffect(() => { resetSim(); }, []);

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
    navigate('/sim');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar
        showAuth={false}
        rightContent={
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700,
              }}>
                {user.name?.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.name}</span>
            </div>
          ) : (
            <span className="badge badge-primary">Guest</span>
          )
        }
      />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '64px 48px',
        maxWidth: 1100, margin: '0 auto', width: '100%',
      }}>
        {/* Header */}
        <div className="animate-fadeIn" style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 className="font-display" style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: 12,
          }}>
            What role do you want to simulate today?
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            You'll be placed in a realistic workplace with AI teammates for 45 minutes
          </p>
        </div>

        {/* Role Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24, width: '100%',
        }}>
          {ROLES.map((role, i) => {
            const scenario = getScenario(role.id);
            const meta = ROLE_META[role.id] || {};
            const isLoading = selecting === role.id;
            const liveCount = counts[role.id] || 0;

            return (
              <RoleCard
                key={role.id}
                role={role}
                scenario={scenario}
                meta={meta}
                liveCount={liveCount}
                isLoading={isLoading}
                disabled={!!selecting}
                delay={i * 80}
                onSelect={() => handleSelect(role.id)}
              />
            );
          })}
        </div>

        {/* Guest notice */}
        {!user && (
          <div style={{
            marginTop: 48, padding: '14px 24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: '0.85rem', color: 'var(--text-secondary)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Playing as guest — sign in to save your report
          </div>
        )}
      </main>
    </div>
  );
}

function RoleCard({ role, scenario, meta, liveCount, isLoading, disabled, delay, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const accent = meta.accent || 'var(--accent)';

  return (
    <button
      id={`role-card-${role.id}`}
      onClick={onSelect}
      disabled={disabled}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? `${accent}40` : 'var(--border)'}`,
        borderRadius: 16,
        padding: '28px 24px',
        cursor: disabled ? 'wait' : 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        animation: `slideUp 0.5s ${delay}ms both`,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.3)` : 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent,
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
            {role.label}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {scenario?.teamName || role.description?.split('.')[0]}
          </div>
        </div>
        {liveCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '0.72rem', color: 'var(--success)',
            background: 'rgba(46,204,138,0.1)',
            padding: '3px 10px', borderRadius: 20, flexShrink: 0,
          }}>
            <LiveDot />
            {liveCount} live
          </div>
        )}
      </div>

      {/* Task bullets */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {(meta.tasks || []).map(t => (
          <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: accent, marginTop: 1, flexShrink: 0 }}><CheckIcon /></span>
            {t}
          </li>
        ))}
      </ul>

      {/* Team avatars */}
      {scenario?.members && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: -4 }}>
            {scenario.members.slice(0, 4).map(m => (
              <div key={m.id} title={`${m.name} — ${m.role}`} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: m.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700,
                border: '2px solid var(--bg-card)',
                marginLeft: -6,
              }}>
                {m.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <UsersIconSm /> {scenario.members.length} AI teammates
          </span>
        </div>
      )}

      {/* Difficulty */}
      <div style={{ marginBottom: 20 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          fontSize: '0.72rem', fontWeight: 600,
          color: accent, background: `${accent}12`,
          padding: '3px 10px', borderRadius: 20,
        }}>
          {meta.difficulty || 'Intermediate'}
        </span>
      </div>

      {/* CTA */}
      <div style={{
        marginTop: 'auto',
        background: accent,
        color: '#fff',
        borderRadius: 8,
        padding: '11px 16px',
        fontSize: '0.88rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        {isLoading
          ? <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} />
          : <>Start this role <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg></>
        }
      </div>
    </button>
  );
}
