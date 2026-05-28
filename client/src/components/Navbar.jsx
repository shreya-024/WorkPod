import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

export default function Navbar({ onSignIn, onGetStarted, showAuth = true, rightContent }) {
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 48px',
      height: 64,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(var(--bg-secondary-raw, 10,10,15), 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 88%, transparent)',
    }}>
      {/* Wordmark */}
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: 0,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Work<span style={{ color: 'var(--accent)' }}>Pod</span>
        </span>
      </button>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {rightContent}
        {showAuth && (
          <>
            {onSignIn && (
              <button
                className="btn btn-ghost btn-sm"
                id="nav-signin-btn"
                onClick={onSignIn}
              >
                Sign In
              </button>
            )}
            {onGetStarted && (
              <button
                className="btn btn-accent btn-sm"
                id="nav-getstarted-btn"
                onClick={onGetStarted}
              >
                Get Started
              </button>
            )}
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
