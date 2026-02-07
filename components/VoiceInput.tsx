'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import styles from '@/styles/VoiceInput.module.css';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
  language?: string;
}

// Check if Web Speech API is available
const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export default function VoiceInput({ 
  onTranscript, 
  onListeningChange,
  disabled = false,
  language = 'en-US'
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language;

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      
      if (final) {
        onTranscript(final);
        setInterimTranscript('');
      }
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onListeningChange?.(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      onListeningChange?.(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.stop();
    };
  }, [isSupported, language, onTranscript, onListeningChange]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      onListeningChange?.(false);
    } else {
      recognition.start();
      setIsListening(true);
      onListeningChange?.(true);
    }
  }, [recognition, isListening, onListeningChange]);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className={styles.voiceInputContainer}>
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        title={isListening ? 'Stop listening' : 'Voice input'}
      >
        {isListening ? (
          <>
            <div className={styles.pulseRing} />
            <MicOff size={18} />
          </>
        ) : (
          <Mic size={18} />
        )}
      </button>
      
      {interimTranscript && (
        <div className={styles.interimTranscript}>
          <Loader2 size={14} className={styles.spinner} />
          <span>{interimTranscript}</span>
        </div>
      )}
    </div>
  );
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
