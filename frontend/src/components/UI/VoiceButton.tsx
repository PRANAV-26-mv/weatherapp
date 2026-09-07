import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';
import { speakInLanguage, stopVoiceSpeech } from '../../services/voiceService';

interface VoiceButtonProps {
  onSpeechResult?: (text: string) => void;
  textToSpeak?: string;
  langCode?: string;
  mode?: 'input' | 'output';
}

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
  ur: 'ur-IN',
};

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onSpeechResult,
  textToSpeak,
  langCode = 'en',
  mode = 'input',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const targetLocale = LANGUAGE_LOCALE_MAP[langCode] || 'en-IN';

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Try Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = targetLocale;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (onSpeechResult && transcript) {
        onSpeechResult(transcript);
      }
    };

    recognition.start();
  };

  const speakText = () => {
    if (!textToSpeak) return;
    if (isSpeaking) {
      stopVoiceSpeech();
      setIsSpeaking(false);
      return;
    }

    speakInLanguage(
      textToSpeak,
      langCode,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  if (mode === 'output') {
    return (
      <button
        onClick={speakText}
        className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${
          isSpeaking
            ? 'bg-saffron text-black animate-pulse shadow-lg shadow-saffron/40'
            : 'bg-white/5 hover:bg-saffron/20 text-gray-300 hover:text-saffron border border-white/10'
        }`}
        title={`Read Aloud in ${langCode.toUpperCase()} (TTS)`}
      >
        {isSpeaking ? <Square className="w-3.5 h-3.5 fill-black" /> : <Volume2 className="w-3.5 h-3.5 text-saffron" />}
        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startListening}
      className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
        isListening
          ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50'
          : 'bg-saffron/20 hover:bg-saffron text-saffron hover:text-black border border-saffron/40'
      }`}
      title={`Speak in ${langCode.toUpperCase()} (${targetLocale})`}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
};
