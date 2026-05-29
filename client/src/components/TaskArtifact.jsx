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
// ─── ML Intern Panels ─────────────────────────────────────────────
function MLInternPanel({ taskId }) {
  if (taskId === 't1') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Dataset Exploration Notes</PanelLabel>
        <div style={{
          background: 'var(--bg-primary)', padding: '14px 16px', borderRadius: 8,
          marginBottom: 16, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65,
          border: '1px solid var(--border)',
        }}>
          Use the editor on the right to write your exploration notes. Cover:
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>Dataset shape (rows × columns)</li>
            <li>Column dtypes and descriptions</li>
            <li>Missing value counts per column</li>
            <li>Key statistical distributions (mean, median, std for numeric cols)</li>
            <li>Observations about survival rates across groups</li>
          </ul>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          The dataset is available here: 
          <a href="/datasets/titanic_sample.csv" download="titanic_sample.csv" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download titanic_sample.csv
          </a>
        </div>
      </div>
    );
  }

  if (taskId === 't2') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Titanic Dataset — Column Reference</PanelLabel>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem',
            border: '1px solid var(--border)',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>Column</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>Type</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['PassengerId', 'int', 'Unique passenger ID'],
                ['Survived', 'int (0/1)', 'Target — did they survive?'],
                ['Pclass', 'int (1-3)', 'Ticket class (1st/2nd/3rd)'],
                ['Name', 'string', 'Passenger name'],
                ['Sex', 'string', 'male / female'],
                ['Age', 'float', 'Age in years (has nulls!)'],
                ['SibSp', 'int', '# siblings/spouses aboard'],
                ['Parch', 'int', '# parents/children aboard'],
                ['Fare', 'float', 'Passenger fare'],
                ['Cabin', 'string', 'Cabin number (mostly null)'],
                ['Embarked', 'char', 'Port: C/Q/S'],
              ].map(([col, type, desc], idx) => (
                <tr key={idx}>
                  <td style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{col}</td>
                  <td style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{type}</td>
                  <td style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (taskId === 't3') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Pipeline Requirements</PanelLabel>
        <div style={{
          background: 'var(--bg-primary)', padding: '14px 16px', borderRadius: 8,
          fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65,
          border: '1px solid var(--border)',
        }}>
          Build a preprocessing + training pipeline. Your code should:
          <ol style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>Load the Titanic CSV</li>
            <li>Handle missing values (Age, Cabin, Embarked)</li>
            <li>Encode categorical features (Sex, Embarked)</li>
            <li>Split into train/test sets</li>
            <li>Train a classifier (LogisticRegression, RandomForest, etc.)</li>
            <li>Print accuracy, precision, recall, and F1 score</li>
          </ol>
          <div style={{ marginTop: 12, color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
            ⚠️ Watch out for data leakage — fit transformers on train set only!
          </div>
        </div>
      </div>
    );
  }

  if (taskId === 't4') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Submission — Model Summary or Predictions</PanelLabel>
        <div style={{
          background: 'var(--bg-primary)', padding: '14px 16px', borderRadius: 8,
          fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65,
          border: '1px solid var(--border)',
        }}>
          Submit one of the following in the editor:
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li><strong>Option A:</strong> A trained model summary — include algorithm used, hyperparameters, accuracy, precision, recall, F1, and a brief confusion matrix</li>
            <li><strong>Option B:</strong> A predictions CSV with columns: <code>PassengerId, Predicted_Survived</code></li>
          </ul>
          <div style={{ marginTop: 12, color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
            Use the template pre-filled in the editor. Replace the TODO sections with your results.
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── SDE Intern Panels ────────────────────────────────────────────
function SDEInternPanel({ taskId }) {
  if (taskId === 't1') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>Onboarding Wiki</PanelLabel>
        <div style={{
          background: 'var(--bg-primary)', padding: '14px 16px', borderRadius: 8,
          fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65,
          border: '1px solid var(--border)',
        }}>
          Your Engineering Manager shared the onboarding wiki in chat. Review it and submit a brief summary of what you learned.
          <div style={{ marginTop: 12, fontWeight: 500, color: 'var(--text-primary)' }}>Key topics to cover:</div>
          <ul style={{ marginTop: 4, paddingLeft: 20 }}>
            <li>Repository structure and folder layout</li>
            <li>Local dev setup steps</li>
            <li>Team norms (standup, PR process, branching)</li>
            <li>How to pick and claim tickets</li>
          </ul>
        </div>
      </div>
    );
  }

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
        <PanelLabel>🐛 Issue #247 — Buggy Login Handler</PanelLabel>
        <div style={{
          background: '#1a1a1a', padding: '12px', borderRadius: 6, marginBottom: 12,
          fontSize: '0.78rem', color: '#ff6b6b', fontWeight: 600,
        }}>
          P0 Security Bug — Fix both issues in the editor →
        </div>
        <pre style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
{`Bugs to fix:
1. Missing password hash comparison
   → Add bcrypt.compare(password, user.passwordHash)
   → Return 401 if mismatch

2. No rate limiting
   → Track failed attempts per IP/email
   → Block after 5 failures (15 min cooldown)

The buggy code is pre-loaded in the editor.
Fix it, then move to Task 3 (write tests).`}
        </pre>
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
        <div style={{ color: '#ffd93d', marginBottom: 8, fontWeight: 600 }}>FAIL  tests/auth.test.ts</div>
        <pre style={{ margin: 0, lineHeight: 1.6, color: '#ff6b6b', fontSize: '0.8rem' }}>
{`  [FAIL] should reject login with wrong password (0ms)
  [FAIL] should block after 5 failed attempts (0ms)
  [FAIL] should return token for valid credentials (0ms)

Test Suites: 1 failed, 0 passed, 1 total
Tests:       3 failed, 0 passed, 3 total
Time:        0.000s

Write tests that prove the bugs were fixed.
A scaffold is pre-loaded in the editor →`}
        </pre>
      </div>
    );
  }

  if (taskId === 't4') {
    return (
      <div style={{ flex: 1, background: 'var(--bg-secondary)', overflow: 'auto', padding: '24px' }}>
        <PanelLabel>PR Description Template</PanelLabel>
        <div style={{
          background: 'var(--bg-primary)', padding: '14px 16px', borderRadius: 8,
          fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65,
          border: '1px solid var(--border)',
        }}>
          Submit a PR description that covers:
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li><strong>What:</strong> What did you change and why?</li>
            <li><strong>Why:</strong> What bug or issue does this fix?</li>
            <li><strong>How to test:</strong> Steps to verify the fix works</li>
            <li><strong>Screenshots / logs:</strong> (if applicable)</li>
          </ul>
          <div style={{ marginTop: 12, color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
            A template is pre-filled in the editor. Fill in the sections.
          </div>
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

// ─── Editor language helper ─────────────────────────────────────────
function getEditorLanguage(role, taskId) {
  if (role === 'ml_intern') return 'python';
  if (role === 'sde_intern') {
    if (taskId === 't2') return 'typescript';
    if (taskId === 't3') return 'typescript';
    if (taskId === 't4') return 'markdown';
    return 'markdown';
  }
  return 'javascript';
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

  // ML Intern role — always shows problem panel + Python editor
  if (role === 'ml_intern') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
        <ArtifactHeader taskTitle={taskTitle} onSubmit={handleSubmit} submitting={submitting} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <MLInternPanel taskId={taskId} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-tertiary)',
              padding: '6px 12px',
              background: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border)',
              textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
            }}>
              {taskId === 't4' ? 'Submission Editor' : 'Python Editor'}
            </div>
            <Editor
              height="100%"
              defaultLanguage="python"
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

  // SDE Intern role — always shows problem panel + code editor
  if (role === 'sde_intern') {
    const lang = getEditorLanguage(role, taskId);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
        <ArtifactHeader taskTitle={taskTitle} onSubmit={handleSubmit} submitting={submitting} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <SDEInternPanel taskId={taskId} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-tertiary)',
              padding: '6px 12px',
              background: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border)',
              textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
            }}>
              {taskId === 't4' ? 'PR Description' : 'Code Editor'}
            </div>
            <Editor
              height="100%"
              defaultLanguage={lang}
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

  // SDE role (original)
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

  // ── ML Intern pre-filled content ──────────────────────────────
  if (role === 'ml_intern') {
    if (taskId === 't1') {
      return `# Dataset Exploration Notes\n\n## Dataset Overview\n- **Shape**: TODO rows × TODO columns\n- **Source**: /datasets/titanic_sample.csv\n\n## Column Summary\n| Column | Type | Missing | Notes |\n|--------|------|---------|-------|\n| PassengerId | int | 0 | |\n| Survived | int | 0 | Target variable |\n| Pclass | int | 0 | |\n| Sex | str | 0 | |\n| Age | float | TODO | |\n| Fare | float | 0 | |\n| Cabin | str | TODO | |\n| Embarked | str | TODO | |\n\n## Key Observations\n- TODO: Survival rate by gender\n- TODO: Survival rate by class\n- TODO: Age distribution\n- TODO: Fare distribution\n`;
    }
    if (taskId === 't2') {
      return `# Detailed Dataset Exploration\n\n# TODO: Write your detailed exploration here\n# Describe patterns, correlations, and interesting findings\n`;
    }
    if (taskId === 't3') {
      return `import pandas as pd\nimport numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import LabelEncoder, StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score, classification_report, confusion_matrix\n\n# ─── 1. Load Data ────────────────────────────────────────────────\ndf = pd.read_csv('/datasets/titanic_sample.csv')\nprint(f"Shape: {df.shape}")\nprint(df.info())\nprint(df.describe())\n\n# ─── 2. Preprocessing ───────────────────────────────────────────\n# TODO: Handle missing values\n# - Age: fill with median? mean? group-based imputation?\n# - Cabin: drop column or extract deck letter?\n# - Embarked: fill with mode?\n\n# TODO: Encode categorical features\n# - Sex: LabelEncoder or pd.get_dummies?\n# - Embarked: one-hot encode?\n\n# TODO: Feature engineering (optional)\n# - FamilySize = SibSp + Parch + 1\n# - IsAlone = 1 if FamilySize == 1\n# - Title extraction from Name\n\n# TODO: Select features for modeling\n# features = ['Pclass', 'Sex', 'Age', 'Fare', 'Embarked', ...]\n\n# ─── 3. Train/Test Split ────────────────────────────────────────\n# TODO: Split data (80/20 or 70/30)\n# X_train, X_test, y_train, y_test = train_test_split(...)\n\n# ─── 4. Train Model ─────────────────────────────────────────────\n# TODO: Initialize and fit a classifier\n# model = LogisticRegression()  # or RandomForestClassifier()\n# model.fit(X_train, y_train)\n\n# ─── 5. Evaluate ─────────────────────────────────────────────────\n# TODO: Print metrics\n# y_pred = model.predict(X_test)\n# print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")\n# print(classification_report(y_test, y_pred))\n# print(confusion_matrix(y_test, y_pred))\n`;
    }
    if (taskId === 't4') {
      return `# Model Submission\n\n## Algorithm\n- **Model**: TODO (e.g., RandomForestClassifier)\n- **Hyperparameters**: TODO\n\n## Results\n- **Accuracy**: TODO\n- **Precision**: TODO\n- **Recall**: TODO\n- **F1 Score**: TODO\n\n## Classification Report\n\`\`\`\n              precision    recall  f1-score   support\n\n           0       TODO      TODO      TODO      TODO\n           1       TODO      TODO      TODO      TODO\n\n    accuracy                           TODO      TODO\n   macro avg       TODO      TODO      TODO      TODO\nweighted avg       TODO      TODO      TODO      TODO\n\`\`\`\n\n## Confusion Matrix\n\`\`\`\n[[TODO, TODO],\n [TODO, TODO]]\n\`\`\`\n\n## Key Decisions\n- TODO: Why did you choose this algorithm?\n- TODO: How did you handle missing values?\n- TODO: What features had the most impact?\n\n---\n\n## OR: Predictions CSV\n\`\`\`csv\nPassengerId,Predicted_Survived\n1,0\n2,1\n...\n\`\`\`\n`;
    }
  }

  // ── SDE Intern pre-filled content ─────────────────────────────
  if (role === 'sde_intern') {
    if (taskId === 't1') {
      return `// Onboarding notes — summarize what you learned from the wiki\n// After reviewing, submit to mark Task 1 as complete.\n`;
    }
    if (taskId === 't2') {
      return `import { Request, Response } from 'express';\nimport jwt from 'jsonwebtoken';\nimport bcrypt from 'bcrypt';\nimport { findUserByEmail } from '../services/userService';\n\n// In-memory rate limiter (replace with Redis in production)\nconst failedAttempts: Map<string, { count: number; blockedUntil: number }> = new Map();\nconst MAX_ATTEMPTS = 5;\nconst BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes\n\nexport async function loginHandler(req: Request, res: Response) {\n  const { email, password } = req.body;\n\n  if (!email || !password) {\n    return res.status(400).json({ error: 'Email and password required' });\n  }\n\n  // TODO: Fix Bug #1 — Add rate limiting check here\n  // Check if this email/IP has exceeded MAX_ATTEMPTS\n  // If blocked, return 429 with a "Too many attempts" message\n\n  const user = await findUserByEmail(email);\n  if (!user) {\n    return res.status(401).json({ error: 'Invalid credentials' });\n  }\n\n  // TODO: Fix Bug #2 — Add password hash verification here\n  // Use bcrypt.compare(password, user.passwordHash)\n  // If password doesn't match, increment failed attempts and return 401\n\n  // Reset failed attempts on successful login\n  failedAttempts.delete(email);\n\n  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {\n    expiresIn: '24h',\n  });\n\n  return res.json({ token, user: { id: user.id, email: user.email } });\n}\n`;
    }
    if (taskId === 't3') {
      return `import { describe, it, expect, jest, beforeEach } from '@jest/globals';\nimport { loginHandler } from '../api/auth/login';\nimport bcrypt from 'bcrypt';\n\n// Mock dependencies\njest.mock('../services/userService', () => ({\n  findUserByEmail: jest.fn(),\n}));\n\nconst { findUserByEmail } = require('../services/userService');\n\nfunction mockReqRes(body: any) {\n  const req = { body } as any;\n  const res = {\n    status: jest.fn().mockReturnThis(),\n    json: jest.fn().mockReturnThis(),\n  } as any;\n  return { req, res };\n}\n\ndescribe('loginHandler', () => {\n  beforeEach(() => {\n    jest.clearAllMocks();\n  });\n\n  it('should return 401 when password is wrong', async () => {\n    // TODO: Setup mock user with a known passwordHash\n    // TODO: Call loginHandler with wrong password\n    // TODO: Assert res.status(401) was called\n    // TODO: Assert res.json({ error: 'Invalid credentials' })\n  });\n\n  it('should return token for valid credentials', async () => {\n    // TODO: Setup mock user\n    // TODO: Hash a known password with bcrypt\n    // TODO: Call loginHandler with correct password\n    // TODO: Assert res.json was called with { token, user }\n  });\n\n  it('should block after 5 failed attempts', async () => {\n    // TODO: Setup mock user\n    // TODO: Make 5 failed login attempts\n    // TODO: Assert 6th attempt returns 429\n    // TODO: Assert response includes rate limit message\n  });\n});\n`;
    }
    if (taskId === 't4') {
      return `## Pull Request: Fix login authentication bypass (Issue #247)\n\n### What\nTODO: Describe what you changed in the loginHandler\n\n### Why\nTODO: Explain the security vulnerability — what could an attacker do?\n\n### Changes\n- [ ] Added bcrypt password hash verification\n- [ ] Implemented rate limiting on failed login attempts\n- [ ] Added unit tests proving both bugs are fixed\n\n### How to Test\n1. TODO: Steps to verify password check works\n2. TODO: Steps to verify rate limiting works\n3. Run \`npm test -- tests/auth.test.ts\`\n\n### Risk Assessment\n- **Breaking changes**: None / TODO\n- **Rollback plan**: TODO\n\n### Checklist\n- [ ] Tests pass locally\n- [ ] No console errors\n- [ ] Reviewed by at least 1 teammate\n`;
    }
  }

  return '';
}
