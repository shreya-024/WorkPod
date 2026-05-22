import { useState, useCallback } from 'react';
import { useVoice } from '../hooks/useVoice.js';

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
        width: 36, height: 36, borderRadius: 8, border: 'none',
        background: listening
          ? 'rgba(239,68,68,0.15)'
          : 'transparent',
        color: listening ? 'var(--brand-danger)' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', transition: 'all 0.2s',
        animation: listening ? 'pulse-ring 1.5s infinite' : 'none',
        flexShrink: 0,
      }}
      title={listening ? 'Stop recording' : 'Voice input'}
    >
      {listening ? '⏹' : '🎤'}
    </button>
  );
}
