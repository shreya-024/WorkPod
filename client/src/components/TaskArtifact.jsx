import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSimStore } from '../store/useSimStore.js';

// ── Panel header label (replaces emoji + text) ──────────────────────
function PanelLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.85rem', fontWeight: 700,
      color: 'var(--text-primary)', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {children}
    </div>
  );
}

// ─── Problem Panels for SDE ───────────────────────────────────────
function SDEProblemPanel({ taskId }) {
  if (taskId === 't1') return null;

  if (taskId === 't2') {
    return (
      <div style={{
        flex: 1,
        background: 'var(--bg-secondary)',
        overflow: 'auto',
        borderRight: '1px solid var(--border)',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <PanelLabel>Pull Requests #142, #145, #147</PanelLabel>
          <pre style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
{`diff --git a/auth/login.ts b/auth/login.ts
index abc1234..def5678 100644
--- a/auth/login.ts
+++ b/auth/login.ts
@@ -15,6 +15,8 @@
   const user = await findUserByEmail(email);
   if (!user) throw new Error('Invalid credentials');
+  // [BUG] Missing password hash verification
+  // [BUG] No rate limiting on failed attempts
   return signJWT(user.id);

diff --git a/payment/processor.ts b/payment/processor.ts
index xyz9876..uvw5432 100644
--- a/payment/processor.ts
+++ b/payment/processor.ts
@@ -32,7 +32,8 @@
   async processPayment(amount, cardToken) {
     const result = await stripe.charge({ amount, source: cardToken });
-    // [BUG] No idempotency key; duplicate charges possible
+    // [BUG] No idempotency key; duplicate charges possible
+    // [BUG] Missing error handling for network failures
     return result;
   }

diff --git a/tests/integration.spec.ts b/tests/integration.spec.ts`}
          </pre>
        </div>
      </div>
    );
  }

  if (taskId === 't3') {
    return (
      <div style={{
        flex: 1,
        background: '#1a1a1a',
        overflow: 'auto',
        borderRight: '1px solid var(--border)',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: '#ff6b6b',
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: '#ffd93d', marginBottom: 8, fontWeight: 600 }}>FAIL  tests/payment.test.js</div>
          <pre style={{ margin: 0, lineHeight: 1.6, color: '#ff6b6b', fontSize: '0.8rem' }}>
{`  [FAIL] should charge card successfully (25ms)
  [FAIL] should refund payment within 5 days (18ms)
  [FAIL] should validate card expiry before charging (12ms)

Test Suites: 1 failed, 0 passed, 1 total
Tests:       3 failed, 0 passed, 3 total
Time:        2.456s

FAIL  tests/auth.test.js
  [FAIL] should not allow weak passwords (15ms)

FAIL  tests/user.test.js
  [FAIL] should create user with valid email (22ms)

Tests:       5 failed, 0 passed, 5 total
Time:        3.892s

npm ERR! code ELIFECYCLE`}
          </pre>
        </div>
      </div>
    );
  }

  if (taskId === 't4') {
    return (
      <div style={{
        flex: 1,
        background: 'var(--bg-secondary)',
        overflow: 'auto',
        borderRight: '1px solid var(--border)',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
      }}>
        <PanelLabel>Test Scaffold: user.service.test.js</PanelLabel>
        <pre style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
{`import { createUser, findUserByEmail } from './user.service.js';

describe('User Service', () => {
  beforeEach(() => {
    // Setup: clear test database
  });

  describe('createUser', () => {
    // TODO: Should create user with valid data
    // TODO: Should reject weak passwords
    // TODO: Should reject duplicate emails
  });

  describe('findUserByEmail', () => {
    // TODO: Should find existing user
    // TODO: Should return null for non-existent user
  });
});`}
        </pre>
      </div>
    );
  }

  return null;
}

// ─── HR Document Panels ────────────────────────────────────────────
function HRDocumentPanel({ taskId }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [formData, setFormData] = useState({});

  const toggleCheckbox = (key) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (taskId === 't1') {
    const items = [
      'Complete W-4 tax forms',
      'Set up company email account',
      'Grant access to GitHub and Jira',
      'Schedule 1:1 with manager',
      'Review code of conduct',
      'Add to team Slack channels',
      'Attend orientation video',
      'Submit emergency contact information',
    ];
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Onboarding Checklist</PanelLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, idx) => (
            <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checkedItems[item] || false}
                onChange={() => toggleCheckbox(item)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              <span style={{
                color: checkedItems[item] ? 'var(--text-tertiary)' : 'var(--text-primary)',
                textDecoration: checkedItems[item] ? 'line-through' : 'none',
                fontSize: '0.9rem',
              }}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (taskId === 't2') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Annual Performance Review</PanelLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Technical Skills', field: 'technical' },
            { label: 'Communication', field: 'communication' },
            { label: 'Collaboration', field: 'collaboration' },
            { label: 'Leadership Potential', field: 'leadership' },
            { label: 'Additional Comments', field: 'comments' }
          ].map(({ label, field }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: 7, color: 'var(--text-secondary)' }}>
                {label}
              </label>
              {field === 'comments' ? (
                <textarea
                  value={formData[field] || ''}
                  onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                  placeholder="Enter your feedback..."
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: 8, minHeight: 80, fontFamily: 'inherit',
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical',
                    outline: 'none',
                  }}
                />
              ) : (
                <select
                  value={formData[field] || ''}
                  onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="">Select rating...</option>
                  <option value="1">1 - Needs Improvement</option>
                  <option value="2">2 - Satisfactory</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Excellent</option>
                  <option value="5">5 - Outstanding</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (taskId === 't3') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Employee Complaint — Draft Response</PanelLabel>
        <div style={{
          background: 'var(--bg-primary)', padding: '14px 16px', borderRadius: 8,
          marginBottom: 16, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65,
          border: '1px solid var(--border)',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>From:</strong> Sarah Chen<br />
          <strong style={{ color: 'var(--text-primary)' }}>Subject:</strong> Concerns about workload and team dynamics<br /><br />
          <em>"I've been struggling with the increased workload post-launch. Team communication feels misaligned, and I'm concerned about burnout."</em>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>
            Your Response
          </label>
          <textarea
            placeholder="Draft your response here..."
            style={{
              width: '100%', padding: '12px', border: '1px solid var(--border)',
              borderRadius: 8, minHeight: 120, fontFamily: 'inherit',
              background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>
      </div>
    );
  }

  if (taskId === 't4') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Learning &amp; Development Budget Allocation</PanelLabel>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem',
            border: '1px solid var(--border)',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>Category</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>Budget</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>Allocated</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: 'Online Courses', budget: '$5000' },
                { cat: 'Conferences & Events', budget: '$3000' },
                { cat: 'Books & Resources', budget: '$1000' },
                { cat: 'Certifications', budget: '$2000' },
                { cat: 'Coaching & Mentorship', budget: '$1500' },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>{row.cat}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{row.budget}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                    <input
                      type="text"
                      placeholder="$0"
                      style={{
                        width: '80px', padding: '6px 8px', borderRadius: 4,
                        border: '1px solid var(--border)', textAlign: 'center',
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

// ─── PM Data Panels ───────────────────────────────────────────────
function PMDataPanel({ taskId }) {
  const [formData, setFormData] = useState({});
  const [stakeholders, setStakeholders] = useState({});

  if (taskId === 't1') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Product Specification Template</PanelLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Feature Title', field: 'title', type: 'text' },
            { label: 'User Story', field: 'story', type: 'textarea' },
            { label: 'Success Metrics', field: 'metrics', type: 'textarea' },
            { label: 'Dependencies', field: 'deps', type: 'text' },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                {label}
              </label>
              {type === 'textarea' ? (
                <textarea
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: 8, minHeight: 60, fontFamily: 'inherit',
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical',
                    outline: 'none',
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (taskId === 't2') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Stakeholder Alignment Status</PanelLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'Engineering Lead (Alex)', initial: 'Aligned' },
            { name: 'Product Manager (Sam)', initial: 'Partial' },
            { name: 'Sales Director (James)', initial: 'Needs Discussion' },
            { name: 'Legal & Compliance', initial: 'Pending Review' },
            { name: 'Customer Success', initial: 'Aligned' },
          ].map((stakeholder, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{stakeholder.name}</span>
              <select
                onChange={e => setStakeholders(prev => ({ ...prev, [stakeholder.name]: e.target.value }))}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="Aligned">Aligned</option>
                <option value="Partial">Partial</option>
                <option value="NeedsDiscussion">Needs Discussion</option>
                <option value="BlockedBy">Blocked By</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (taskId === 't3') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Beta Metrics Dashboard</PanelLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { metric: 'Daily Active Users (DAU)', value: '12,450', trend: '+18%' },
            { metric: 'Weekly Retention', value: '68%', trend: '+5%' },
            { metric: 'Net Promoter Score (NPS)', value: '47', trend: '+12' },
            { metric: 'Session Duration (avg)', value: '14m 32s', trend: '+3m' },
            { metric: 'Crash Rate', value: '0.2%', trend: '-0.1%' },
            { metric: 'Feature Adoption', value: '42%', trend: '+8%' },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-primary)', padding: '16px', borderRadius: 8,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{item.metric}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: 4, fontWeight: 600 }}>{item.trend}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (taskId === 't4') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Launch Announcement Draft</PanelLabel>
        <div>
          <textarea
            placeholder={`Craft your launch announcement for:
- External marketing (LinkedIn, social)
- Press release
- Customer communication
- Sales talking points

Include: What, Why, When, Call-to-Action`}
            style={{
              width: '100%', padding: '16px', border: '1px solid var(--border)',
              borderRadius: 8, minHeight: 200, fontFamily: 'inherit',
              background: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontSize: '0.92rem', resize: 'vertical', outline: 'none', lineHeight: 1.6,
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}

// ─── Shared artifact header ────────────────────────────────────────
function ArtifactHeader({ taskTitle, onSubmit, submitting }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'var(--bg-secondary)',
      flexShrink: 0,
    }}>
      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
        {taskTitle}
      </h3>
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="btn btn-accent btn-sm"
        style={{ opacity: submitting ? 0.6 : 1 }}
      >
        {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Submit'}
      </button>
    </div>
  );
}

// ─── Main TaskArtifact Component ────────────────────────────────────
export default function TaskArtifact({ role, taskId, taskTitle, onSubmit }) {
  const [code, setCode] = useState(getInitialCode(role, taskId));
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useSimStore();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      onSubmit({ role, taskId, content: code });
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (role === 'hr') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
        <ArtifactHeader taskTitle={taskTitle} onSubmit={handleSubmit} submitting={submitting} />
        <HRDocumentPanel taskId={taskId} />
      </div>
    );
  }

  if (role === 'pm') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
        <ArtifactHeader taskTitle={taskTitle} onSubmit={handleSubmit} submitting={submitting} />
        <PMDataPanel taskId={taskId} />
      </div>
    );
  }

  // SDE role
  const problemPanel = <SDEProblemPanel taskId={taskId} />;

  if (!problemPanel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
        <ArtifactHeader taskTitle={taskTitle} onSubmit={handleSubmit} submitting={submitting} />
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-tertiary)', fontSize: '0.9rem', padding: 40, textAlign: 'center',
        }}>
          No code artifact required for this task. Use the chat to discuss, then submit when ready.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
      <ArtifactHeader taskTitle={taskTitle} onSubmit={handleSubmit} submitting={submitting} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {problemPanel}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            fontSize: '0.72rem', color: 'var(--text-tertiary)',
            padding: '6px 12px',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border)',
            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
          }}>
            Code Editor
          </div>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Helper Functions ──────────────────────────────────────────────
function getInitialCode(role, taskId) {
  if (role === 'sde') {
    if (taskId === 't1') return '// Design REST API endpoints for user auth\n\n';
    if (taskId === 't2') return '// Review and fix the issues in the PRs\n\n';
    if (taskId === 't3') return '// Fix the failing tests\n\n';
    if (taskId === 't4') {
      return `// Write unit tests for the payment module (80% coverage target)
import { describe, it, expect, beforeEach } from 'vitest';
import { processPayment, refundPayment, validateCard } from '../payment.js';

describe('Payment Module', () => {
  beforeEach(() => {
    // Setup
  });

  describe('processPayment', () => {
    it('should charge card successfully', () => {
      // TODO: Implement test
    });

    it('should handle network failures', () => {
      // TODO: Implement test
    });
  });

  describe('refundPayment', () => {
    it('should refund within 5 days', () => {
      // TODO: Implement test
    });
  });
});`;
    }
  }
  return '';
}
