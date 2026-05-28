/**
 * MessageBubble — renders one message. Uses CSS vars for full dark/light support.
 * AI messages: "**[Name]**: text" format parsed into per-member bubbles.
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
  const colors = ['#5b6af0','#2ecc8a','#e05555','#f0a500','#8764b8','#00b4d8','#f7630c'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ color, initials, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size < 30 ? '0.55rem' : '0.65rem',
      fontWeight: 700, flexShrink: 0,
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
      <div style={{ textAlign: 'center', margin: '10px 0', padding: '0 16px', animation: 'fadeIn 0.3s both' }}>
        <span style={{
          fontSize: '0.72rem',
          color: msg.isEmergency ? 'var(--danger)' : 'var(--text-tertiary)',
          background: msg.isEmergency ? 'rgba(224,85,85,0.08)' : 'var(--bg-tertiary)',
          border: `1px solid ${msg.isEmergency ? 'rgba(224,85,85,0.2)' : 'var(--border)'}`,
          borderRadius: 20, padding: '5px 14px',
          fontWeight: msg.isEmergency ? 600 : 400,
          display: 'inline-block',
          letterSpacing: '0.01em',
        }}>
          {msg.content}
        </span>
      </div>
    );
  }

  // ── User message (right aligned) ──────────────────────────
  if (isUser) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        marginTop: sameSource ? 3 : 12,
        animation: 'fadeIn 0.2s both',
      }}>
        <div style={{ maxWidth: '62%' }}>
          <div style={{
            background: 'var(--accent-muted)',
            border: '1px solid var(--border)',
            borderRadius: '12px 0 12px 12px',
            padding: '9px 14px',
            fontSize: '0.9rem',
            lineHeight: 1.55,
            color: 'var(--text-primary)',
            wordWrap: 'break-word',
          }}>
            {msg.content}
          </div>
          {!sameSource && (
            <div style={{ textAlign: 'right', marginTop: 3, fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
              {time}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── AI message ────────────────────────────────────────────
  if (isAI) {
    const parts = parseAiMessage(msg.content);
    return (
      <div style={{ marginTop: sameSource ? 3 : 12, animation: 'fadeIn 0.3s both' }}>
        {parts.map((part, i) => {
          if (!part.text) return null;
          const member = part.name ? memberMap[part.name] : null;
          const color = member?.color || getColorFromName(part.name || 'AI');
          const initials = part.name
            ? part.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'AI';

          const showAvatar = !sameSource || i > 0;

          return (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              maxWidth: '76%',
              marginBottom: i < parts.length - 1 ? 6 : 0,
            }}>
              {showAvatar
                ? <Avatar color={color} initials={initials} />
                : <div style={{ width: 34, flexShrink: 0 }} />
              }

              <div style={{ flex: 1 }}>
                {part.name && showAvatar && (
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color, marginBottom: 3,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {part.name}
                    {member?.role && (
                      <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.68rem' }}>
                        {member.role}
                      </span>
                    )}
                  </div>
                )}
                <div style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0 12px 12px 12px',
                  padding: '9px 14px',
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                  wordWrap: 'break-word',
                }}>
                  {part.text}
                </div>
                {i === 0 && !sameSource && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 3, fontFamily: 'monospace' }}>
                    {time}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Mentor message ────────────────────────────────────────
  if (isMentor) {
    const mentorColor = 'var(--accent)';
    const mentorInitials = msg.sender
      ? msg.sender.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'TL';

    return (
      <div style={{ marginTop: sameSource ? 3 : 12, animation: 'fadeIn 0.25s both' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '76%' }}>
          {!sameSource
            ? <Avatar color={mentorColor} initials={mentorInitials} />
            : <div style={{ width: 34, flexShrink: 0 }} />
          }

          <div style={{ flex: 1 }}>
            {!sameSource && (
              <div style={{
                fontSize: '0.75rem', fontWeight: 600, color: mentorColor,
                marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {msg.sender || 'Mentor'}
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.68rem' }}>
                  Team Lead
                </span>
              </div>
            )}
            <div style={{
              background: 'var(--accent-muted)',
              border: '1px solid var(--border)',
              borderRadius: '0 12px 12px 12px',
              padding: '9px 14px',
              fontSize: '0.9rem',
              lineHeight: 1.55,
              color: 'var(--text-primary)',
              wordWrap: 'break-word',
            }}>
              {msg.content}
            </div>
            {!sameSource && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 3, fontFamily: 'monospace' }}>
                {time}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
