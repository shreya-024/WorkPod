import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimStore } from '../store/useSimStore.js';
import api from '../lib/api.js';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setUser } = useSimStore();
  const [modal, setModal] = useState(null); // 'login' | 'register' | null
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuest = () => navigate('/select');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = modal === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = modal === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, name: form.name, password: form.password };

      const { data } = await api.post(endpoint, payload);
      setUser(data.user, data.token);
      setModal(null);
      navigate('/select');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>✈</div>
          <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>WorkPod</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" id="landing-login-btn" onClick={() => setModal('login')}>Sign In</button>
          <button className="btn btn-primary btn-sm" id="landing-register-btn" onClick={() => setModal('register')}>Create Account</button>
        </div>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '80px 24px',
        position: 'relative', zIndex: 2,
      }}>
        <div className="badge badge-primary animate-fadeIn" style={{ marginBottom: 24 }}>
          <span>✨</span> AI-Powered Work Simulation
        </div>

        <h1 className="font-display animate-fadeIn" style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-0.04em',
          marginBottom: 24,
          animationDelay: '100ms',
        }}>
          Master your role <br />
          <span className="text-gradient">before the stakes are real</span>
        </h1>

        <p style={{
          fontSize: '1.2rem', color: 'var(--text-secondary)',
          maxWidth: 600, lineHeight: 1.7, marginBottom: 48,
          animation: 'fadeIn 0.5s 200ms both',
        }}>
          Simulate real workplace scenarios with AI teammates. Handle emergencies, manage tasks, and get a detailed performance score — all in a safe sandbox.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeIn 0.5s 300ms both' }}>
          <button className="btn btn-primary btn-lg" id="landing-play-guest-btn" onClick={handleGuest}
            style={{ minWidth: 200 }}>
            🚀 Play as Guest
          </button>
          <button className="btn btn-secondary btn-lg" id="landing-signup-btn" onClick={() => setModal('register')}
            style={{ minWidth: 200 }}>
            Create Free Account
          </button>
        </div>

        <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No signup required · Sessions saved when logged in
        </p>

        {/* Feature pills */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 80,
          flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeIn 0.5s 400ms both',
        }}>
          {[
            { icon: '🤖', text: 'AI Teammates (Gemini 2.5)' },
            { icon: '🔴', text: 'Live Emergency Scenarios' },
            { icon: '👥', text: 'Multiplayer Rooms' },
            { icon: '🎤', text: 'Voice Input' },
            { icon: '📊', text: 'Performance Reports' },
          ].map((f) => (
            <div key={f.text} className="card" style={{
              padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.875rem', color: 'var(--text-secondary)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </main>

      {/* Auth Modal */}
      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="card" style={{
            width: '100%', maxWidth: 420, padding: 40,
            animation: 'slideUp 0.3s both',
          }} onClick={e => e.stopPropagation()}>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
              {modal === 'login' ? 'Welcome back' : 'Join WorkPod'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.9rem' }}>
              {modal === 'login' ? 'Sign in to save your sessions and track progress.' : 'Create an account to save your performance history.'}
            </p>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {modal === 'register' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input className="input" id="auth-name-input" placeholder="Alex Johnson"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
                <input className="input" id="auth-email-input" type="email" placeholder="you@company.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password</label>
                <input className="input" id="auth-password-input" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>

              {error && <p style={{ color: 'var(--brand-danger)', fontSize: '0.85rem' }}>⚠️ {error}</p>}

              <button className="btn btn-primary" id="auth-submit-btn" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? <span className="spinner" /> : modal === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="divider" style={{ margin: '24px 0' }} />
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {modal === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setModal(modal === 'login' ? 'register' : 'login')}
                style={{ color: 'var(--brand-primary-light)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {modal === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
            <p style={{ textAlign: 'center', marginTop: 12 }}>
              <button className="btn btn-ghost btn-sm" id="auth-guest-btn" onClick={handleGuest} style={{ width: '100%' }}>
                Continue as Guest instead
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
