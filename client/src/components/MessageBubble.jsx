/**
 * MessageBubble — Teams-density styling.
 * AI:   bg #f3f2f1 (light) / #2d2d2d (dark), no border, radius 0 8px 8px 8px
 * User: bg #e8f0fb (light) / #1e3a5f (dark), no border, radius 8px 8px 0 8px, right-aligned
 * Sender name: 13px bold in member color, timestamp 11px same line
 * Avatar: 32px circle (50% border-radius)
 */

function parseAiMessage(content) {
  const regex = /\*\*\[([^\]]+)\]\*\*:/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) parts.push({ name: null, text });
    }
    const nameStart = match.index + match[0].length;
    const nextMatch = regex.exec(content);
    regex.lastIndex = nextMatch ? nextMatch.index : content.length;
    const text = (nextMatch
      ? content.slice(nameStart, nextMatch.index)
      : content.slice(nameStart)
    ).trim();
    if (nextMatch) regex.lastIndex = nextMatch.index;
    parts.push({ name: match[1], text });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim();
    if (text) parts.push({ name: null, text });
  }

  return parts.length > 0 ? parts : [{ name: null, text: content }];
}

function getColorFromName(name) {
  // Keep member colours distinct; first slot is now LinkedIn blue
  const colors = ['#0a66c2','#2ecc8a','#e05555','#f0a500','#8764b8','#00b4d8','#f7630c'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ color, initials, size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',      // always circular — like Teams
      background: color,
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.6rem',
      fontWeight: 700,
      flexShrink: 0,
      minWidth: size,
    }}>
      {initials}
    </div>
  );
}

export default function MessageBubble({ msg, memberMap, prevMsg }) {
  const isSystem = msg.senderType === 'system';
  const isUser   = msg.senderType === 'user';
  const isAI     = msg.senderType === 'ai';
  const isMentor = msg.senderType === 'mentor';

  const time = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const sameSource = prevMsg &&
    prevMsg.senderType === msg.senderType &&
    prevMsg.sender === msg.sender;

  // ── System message ────────────────────────────────────────
  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', margin: '8px 0', padding: '0 16px', animation: 'fadeIn 0.3s both' }}>
        <span style={{
          fontSize: '0.7rem',
          color: msg.isEmergency ? 'var(--danger)' : 'var(--text-tertiary)',
          background: msg.isEmergency ? 'rgba(224,85,85,0.08)' : 'transparent',
          border: msg.isEmergency ? '1px solid rgba(224,85,85,0.2)' : 'none',
          borderRadius: 20, padding: msg.isEmergency ? '4px 12px' : '0',
          fontWeight: msg.isEmergency ? 600 : 400,
          display: 'inline-block',
        }}>
          {msg.content}
        </span>
      </div>
    );
  }

  // ── User message (right-aligned, no border) ───────────────
  if (isUser) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        marginTop: sameSource ? 2 : 10,
        padding: '0 16px',
        animation: 'fadeIn 0.2s both',
      }}>
        <div style={{ maxWidth: '62%' }}>
          {!sameSource && (
            <div style={{
              textAlign: 'right',
              marginBottom: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                {time}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0a66c2' }}>
                You
              </span>
            </div>
          )}
          <div style={{
            /* light: #e8f0fb  dark: #1e3a5f  — no border */
            background: 'var(--user-bubble, #e8f0fb)',
            borderRadius: '8px 8px 0 8px',
            padding: '8px 12px',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            wordWrap: 'break-word',
          }}>
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  // ── AI message (left-aligned, no border) ──────────────────
  if (isAI) {
    const parts = parseAiMessage(msg.content);
    return (
      <div style={{ marginTop: sameSource ? 2 : 10, padding: '0 16px', animation: 'fadeIn 0.3s both' }}>
        {parts.map((part, i) => {
          if (!part.text) return null;
          const member = part.name ? memberMap[part.name] : null;
          const color = member?.color || getColorFromName(part.name || 'AI');
          const initials = part.name
            ? part.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'AI';

          const showHeader = !sameSource || i > 0;

          return (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              maxWidth: '76%',
              marginBottom: i < parts.length - 1 ? 4 : 0,
            }}>
              {/* Avatar column — always 32px wide to keep bubbles aligned */}
              {showHeader
                ? <Avatar color={color} initials={initials} />
                : <div style={{ width: 32, flexShrink: 0 }} />
              }

              <div style={{ flex: 1 }}>
                {showHeader && (
                  <div style={{
                    marginBottom: 2,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 700, color,
                    }}>
                      {part.name || 'AI Teammate'}
                    </span>
                    {member?.role && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                        {member.role}
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', marginLeft: 2 }}>
                      {time}
                    </span>
                  </div>
                )}
                <div style={{
                  /* light: #f3f2f1  dark: #2d2d2d  — no border */
                  background: 'var(--ai-bubble, #f3f2f1)',
                  borderRadius: '0 8px 8px 8px',
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  wordWrap: 'break-word',
                }}>
                  {part.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Mentor message ────────────────────────────────────────
  if (isMentor) {
    const mentorColor = '#0a66c2';
    const mentorInitials = msg.sender
      ? msg.sender.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'TL';

    return (
      <div style={{ marginTop: sameSource ? 2 : 10, padding: '0 16px', animation: 'fadeIn 0.25s both' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: '76%' }}>
          {!sameSource
            ? <Avatar color={mentorColor} initials={mentorInitials} />
            : <div style={{ width: 32, flexShrink: 0 }} />
          }

          <div style={{ flex: 1 }}>
            {!sameSource && (
              <div style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: mentorColor }}>
                  {msg.sender || 'Mentor'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                  Team Lead
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', marginLeft: 2 }}>
                  {time}
                </span>
              </div>
            )}
            <div style={{
              background: 'var(--ai-bubble, #f3f2f1)',
              borderRadius: '0 8px 8px 8px',
              padding: '8px 12px',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              wordWrap: 'break-word',
            }}>
              {msg.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
