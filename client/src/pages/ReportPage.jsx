import { useNavigate } from 'react-router-dom';
import { useSimStore } from '../store/useSimStore.js';
import { ROLES } from '../scenarios/index.js';

function ScoreBar({ label, value, color = 'var(--brand-primary)' }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color }}>{value}/100</span>
      </div>
      <div style={{ height: 8, background: 'var(--surface-hover)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${value}%`, height: '100%',
          background: color, borderRadius: 99,
          transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}80`,
        }} />
      </div>
    </div>
  );
}

function ScoreGauge({ score }) {
  const angle = (score / 100) * 180;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work';

  // SVG semicircle gauge
  const r = 70;
  const cx = 90, cy = 90;
  const circumference = Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="var(--surface-hover)" strokeWidth="14" strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="28" fontWeight="800" fontFamily="Space Grotesk">
          {score}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={color} fontSize="11" fontWeight="600" fontFamily="Inter">
          {label}
        </text>
      </svg>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Overall Score</p>
    </div>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { report, reportSaved, role, scenario, resetSim } = useSimStore();

  const roleInfo = ROLES.find(r => r.id === role);

  const handlePlayAgain = () => {
    resetSim();
    navigate('/select');
  };

  if (!report) return null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Bg */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)',
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
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>✈</div>
          <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>WorkPod</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" id="report-play-again-top" onClick={handlePlayAgain}>
            Play Again
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div className="animate-fadeIn" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-success" style={{ marginBottom: 16 }}>✅ Session Complete</div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Your Performance Report
          </h1>
          {role && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              {roleInfo?.icon} {roleInfo?.label} · {scenario?.teamName}
            </p>
          )}
          {!reportSaved && (
            <p style={{ color: 'var(--brand-warning)', fontSize: '0.8rem', marginTop: 8 }}>
              ⚠️ Guest mode — this report won't be saved. Create an account to track your progress.
            </p>
          )}
        </div>

        {/* Score section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Gauge card */}
          <div className="card animate-slideUp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <ScoreGauge score={report.overallScore} />
          </div>

          {/* Sub-scores */}
          <div className="card animate-slideUp" style={{ animationDelay: '100ms' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 24, fontSize: '1rem' }}>Skill Breakdown</h3>
            <ScoreBar label="Communication" value={report.communication} color="#6366f1" />
            <ScoreBar label="Task Management" value={report.taskManagement} color="#10b981" />
            <ScoreBar label="Pressure Handling" value={report.pressureHandling} color="#ec4899" />
          </div>
        </div>

        {/* Feedback */}
        {report.feedback?.length > 0 && (
          <div className="card animate-slideUp" style={{ marginBottom: 24, animationDelay: '200ms' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              💬 AI Feedback
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {report.feedback.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '14px 16px',
                  background: 'var(--surface-raised)',
                  borderRadius: 10,
                  borderLeft: '3px solid var(--brand-primary)',
                }}>
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                    {i + 1}.
                  </span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap */}
        {report.roadmap?.length > 0 && (
          <div className="card animate-slideUp" style={{ marginBottom: 40, animationDelay: '300ms' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              🗺️ 30-Day Learning Roadmap
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {report.roadmap.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`roadmap-item-${i}`}
                  style={{
                    display: 'block', padding: '18px 20px',
                    background: 'var(--surface-raised)',
                    borderRadius: 12,
                    border: '1px solid var(--surface-border)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(99,102,241,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', marginBottom: 12,
                  }}>
                    {['📚', '🎯', '⚡'][i] || '📖'}
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 10 }}>
                    {item.description}
                  </p>
                  {item.link && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Open resource →
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', animation: 'fadeIn 0.5s 400ms both' }}>
          <button className="btn btn-primary btn-lg" id="report-play-again-btn" onClick={handlePlayAgain} style={{ minWidth: 180 }}>
            🚀 Play Again
          </button>
          <button className="btn btn-secondary btn-lg" id="report-home-btn" onClick={() => navigate('/')} style={{ minWidth: 180 }}>
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}
