import { useCallback, useRef } from 'react';

export function useVoice(onResult) {
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  const isSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!isSupported || listeningRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      listeningRef.current = false;
    };

    recognition.onend = () => {
      listeningRef.current = false;
    };

    recognition.start();
    recognitionRef.current = recognition;
    listeningRef.current = true;
  }, [isSupported, onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    listeningRef.current = false;
  }, []);

  return { start, stop, isSupported };
}
