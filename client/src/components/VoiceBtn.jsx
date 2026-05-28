import { useState, useCallback } from 'react';
import { useVoice } from '../hooks/useVoice.js';

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

export default function VoiceBtn({ onResult }) {
  const [listening, setListening] = useState(false);

  const handleResult = useCallback((transcript) => {
    setListening(false);
    onResult(transcript);
  }, [onResult]);

  const { start, stop, isSupported } = useVoice(handleResult);

  if (!isSupported) return null;

  const handleClick = () => {
    if (listening) {
      stop();
      setListening(false);
    } else {
      start();
      setListening(true);
    }
  };

  return (
    <button
      id="voice-input-btn"
      onClick={handleClick}
      data-tooltip={listening ? 'Stop listening' : 'Voice input (Chrome)'}
      style={{
        width: 34, height: 34, borderRadius: 8, border: 'none',
        background: listening ? 'rgba(224,85,85,0.12)' : 'transparent',
        color: listening ? 'var(--danger)' : 'var(--text-tertiary)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        animation: listening ? 'pulse-ring 1.5s infinite' : 'none',
        flexShrink: 0,
      }}
      title={listening ? 'Stop recording' : 'Voice input'}
    >
      {listening ? <StopIcon /> : <MicIcon />}
    </button>
  );
}
