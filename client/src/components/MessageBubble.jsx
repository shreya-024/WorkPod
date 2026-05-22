/**
 * MessageBubble — renders one message.
 * AI messages are formatted as "**[Name]**: text".
 * Parses multiple members in one response (each on a new **[Name]** line).
 */

function parseAiMessage(content, memberMap) {
  // Split on **[Name]**: pattern
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
    regex.lastIndex = nextMatch ? nextMatch.index : content.length; // peek ahead
    const text = (nextMatch
      ? content.slice(nameStart, nextMatch.index)
      : content.slice(nameStart)
    ).trim();

    // Reset for next iteration if we peeked
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

export default function MessageBubble({ msg, memberMap, prevMsg }) {
  const isSystem = msg.senderType === 'system';
  const isUser = msg.senderType === 'user';
  const isAI = msg.senderType === 'ai';

  const time = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const sameSource = prevMsg &&
    prevMsg.senderType === msg.senderType &&
    prevMsg.sender === msg.sender;

  // ── System message
  if (isSystem) {
    return (
      <div style={{
        textAlign: 'center', margin: '8px 0', padding: '6px 16px',
        animation: 'fadeIn 0.3s both',
      }}>
        <span style={{
          fontSize: '0.78rem', color: msg.isEmergency ? 'var(--brand-danger)' : 'var(--text-muted)',
          background: msg.isEmergency ? 'rgba(239,68,68,0.08)' : 'var(--surface-hover)',
          borderRadius: 20, padding: '4px 14px',
          fontWeight: msg.isEmergency ? 600 : 400,
        }}>
          {msg.content}
        </span>
      </div>
    );
  }

  // ── User message
  if (isUser) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        marginTop: sameSource ? 2 : 12,
        animation: 'fadeIn 0.25s both',
      }}>
        <div style={{ maxWidth: '70%' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white',
            borderRadius: '16px 16px 4px 16px',
            padding: '10px 14px',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
          }}>
            {msg.content}
          </div>
          {!sameSource && (
            <div style={{ textAlign: 'right', marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {msg.sender} · {time}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── AI message — parse **[Name]**: format
  if (isAI) {
    const parts = parseAiMessage(msg.content, memberMap);

    return (
      <div style={{
        marginTop: sameSource ? 2 : 16,
        animation: 'fadeIn 0.3s both',
      }}>
        {parts.map((part, i) => {
          const member = part.name ? memberMap[part.name] : null;
          const color = member?.color || '#6366f1';
          const avatar = member?.avatar || (part.name ? part.name.slice(0, 2).toUpperCase() : 'AI');

          if (!part.text) return null;

          return (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              maxWidth: '75%',
              marginBottom: i < parts.length - 1 ? 10 : 0,
            }}>
              {/* Avatar */}
              <div className="avatar" style={{
                background: color, color: 'white',
                fontSize: '0.65rem', fontWeight: 700,
                flexShrink: 0,
                boxShadow: `0 0 12px ${color}50`,
              }}>
                {avatar}
              </div>
              <div>
                {part.name && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color, marginBottom: 4 }}>
                    {part.name}
                    {member?.role && (
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
                        {member.role}
                      </span>
                    )}
                    {i === 0 && (
                      <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{time}</span>
                    )}
                  </div>
                )}
                <div style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '10px 14px',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  borderLeft: `3px solid ${color}`,
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

  return null;
}
