/**
 * MessageBubble — renders one message in Teams-style design.
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

// Generate color from name for consistency
function getColorFromName(name) {
  const colors = [
    '#0078d4', // Blue
    '#107c10', // Green
    '#e81123', // Red
    '#ffb900', // Gold
    '#8764b8', // Purple
    '#00a4ef', // Cyan
    '#f7630c', // Orange
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function MessageBubble({ msg, memberMap, prevMsg }) {
  const isSystem = msg.senderType === 'system';
  const isUser = msg.senderType === 'user';
  const isAI = msg.senderType === 'ai';
  const isMentor = msg.senderType === 'mentor';

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
        textAlign: 'center', margin: '12px 0', padding: '0px 16px',
        animation: 'fadeIn 0.3s both',
      }}>
        <span style={{
          fontSize: '0.75rem', color: msg.isEmergency ? '#e81123' : '#808080',
          background: msg.isEmergency ? 'rgba(232,17,35,0.08)' : '#f0f0f0',
          borderRadius: 16, padding: '6px 12px',
          fontWeight: msg.isEmergency ? 600 : 500,
          display: 'inline-block',
        }}>
          {msg.content}
        </span>
      </div>
    );
  }

  // ── User message (right side, blue)
  if (isUser) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        marginTop: sameSource ? 4 : 12,
        marginBottom: 0,
        animation: 'fadeIn 0.25s both',
        paddingRight: 0,
      }}>
        <div style={{ maxWidth: '60%' }}>
          <div style={{
            background: '#0078d4',
            color: 'white',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            wordWrap: 'break-word',
          }}>
            {msg.content}
          </div>
          {!sameSource && (
            <div style={{ textAlign: 'right', marginTop: 4, fontSize: '0.7rem', color: '#808080' }}>
              {time}
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
        marginTop: sameSource ? 4 : 12,
        marginBottom: 0,
        animation: 'fadeIn 0.3s both',
      }}>
        {parts.map((part, i) => {
          if (!part.text) return null;

          const member = part.name ? memberMap[part.name] : null;
          const color = member?.color || getColorFromName(part.name || 'AI');
          const initials = part.name 
            ? part.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'AI';

          return (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              maxWidth: '75%',
              marginBottom: i < parts.length - 1 ? 8 : 0,
            }}>
              {/* Avatar - only show on first message from this person or if name changed */}
              {(!sameSource || i > 0) && (
                <div className="avatar" style={{
                  background: color,
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  marginTop: part.name ? 0 : 0,
                }}>
                  {initials}
                </div>
              )}
              
              {/* Spacer when no avatar */}
              {(sameSource && i === 0) && (
                <div style={{ width: '36px', flexShrink: 0 }}></div>
              )}

              <div style={{ flex: 1 }}>
                {/* Name and role header - only show on first message or if name changed */}
                {part.name && (!sameSource || i > 0) && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {part.name}
                    {member?.role && (
                      <span style={{ color: '#808080', fontWeight: 400, fontSize: '0.7rem' }}>
                        {member.role}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Message bubble */}
                <div style={{
                  background: '#f0f0f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: '#2d2d2d',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  wordWrap: 'break-word',
                }}>
                  {part.text}
                </div>

                {/* Timestamp - only on first part of message */}
                {i === 0 && !sameSource && (
                  <div style={{ fontSize: '0.7rem', color: '#808080', marginTop: 4 }}>
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

  // ── Mentor message
  if (isMentor) {
    const mentorColor = '#0078d4';
    const mentorInitials = msg.sender ? msg.sender.split(' ').map(n => n[0]).join('').toUpperCase() : 'TL';

    return (
      <div style={{
        marginTop: sameSource ? 4 : 12,
        marginBottom: 0,
        animation: 'fadeIn 0.25s both',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: '75%' }}>
          {/* Avatar - only show on first message */}
          {!sameSource && (
            <div className="avatar" style={{
              background: mentorColor,
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 600,
              flexShrink: 0,
              width: '36px',
              height: '36px',
              minWidth: '36px',
            }}>
              {mentorInitials}
            </div>
          )}

          {/* Spacer when no avatar */}
          {sameSource && (
            <div style={{ width: '36px', flexShrink: 0 }}></div>
          )}

          <div style={{ flex: 1 }}>
            {/* Name header - only on first message */}
            {!sameSource && (
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: mentorColor, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                {msg.sender || 'Mentor'}
                <span style={{ color: '#808080', fontWeight: 400, fontSize: '0.7rem' }}>Coach</span>
              </div>
            )}

            {/* Message bubble */}
            <div style={{
              background: '#eef6fc',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              color: '#2d2d2d',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              wordWrap: 'break-word',
            }}>
              {msg.content}
            </div>

            {/* Timestamp - only on first message */}
            {!sameSource && (
              <div style={{ fontSize: '0.7rem', color: '#808080', marginTop: 4 }}>
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
