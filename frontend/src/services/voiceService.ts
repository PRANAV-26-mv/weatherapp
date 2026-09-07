// Universal Multilingual Voice Speech Synthesis Service
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

let currentAudioInstance: HTMLAudioElement | null = null;

export function stopVoiceSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudioInstance) {
    currentAudioInstance.pause();
    currentAudioInstance = null;
  }
}

export function speakInLanguage(
  text: string,
  langCode: string = 'en',
  onStart?: () => void,
  onEnd?: () => void
): void {
  stopVoiceSpeech();

  if (!text) return;
  const cleanText = text.replace(/[*#_`]/g, '').trim();
  const locale = LANGUAGE_LOCALE_MAP[langCode] || 'en-IN';

  // 1. Try Browser SpeechSynthesis if an EXPLICIT MATCHED VOICE is installed in the browser
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();

    const matchedVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === locale.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langCode.toLowerCase()) ||
        v.lang.toLowerCase().includes(langCode.toLowerCase()) ||
        v.name.toLowerCase().includes(langCode.toLowerCase())
    );

    // ONLY use window.speechSynthesis if a true matched voice is found for non-English languages
    if (matchedVoice && (langCode === 'en' || matchedVoice.lang.toLowerCase().includes(langCode.toLowerCase()) || matchedVoice.name.toLowerCase().includes(langCode.toLowerCase()))) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = matchedVoice.lang || locale;
      utterance.voice = matchedVoice;
      utterance.rate = 0.95;

      if (onStart) utterance.onstart = onStart;
      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }
      window.speechSynthesis.speak(utterance);
      return;
    }
  }

  // 2. High Quality Native Audio Stream via Backend Proxy & Direct Google TTS (Guarantees Tamil, Hindi, Telugu, Kannada, Malayalam, etc. output)
  const truncatedText = cleanText.length > 280 ? cleanText.slice(0, 280) : cleanText;
  const encodedQuery = encodeURIComponent(truncatedText);
  
  // Try Backend Proxy first (bypasses CORS/Origin restriction on localhost), fallback to direct stream
  const backendProxyUrl = `http://localhost:8000/api/tts/speak?text=${encodedQuery}&lang=${langCode}`;
  const directGoogleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodedQuery}`;

  const audio = new Audio(backendProxyUrl);
  currentAudioInstance = audio;

  if (onStart) audio.onplay = onStart;
  if (onEnd) {
    audio.onended = onEnd;
    audio.onerror = () => {
      // Secondary attempt with direct Google TTS stream
      const fallbackAudio = new Audio(directGoogleUrl);
      currentAudioInstance = fallbackAudio;
      if (onStart) fallbackAudio.onplay = onStart;
      if (onEnd) {
        fallbackAudio.onended = onEnd;
        fallbackAudio.onerror = onEnd;
      }
      fallbackAudio.play().catch((err) => {
        console.warn('Native speech playback fallback:', err);
        if (onEnd) onEnd();
      });
    };
  }

  audio.play().catch(() => {
    // If backend proxy play is interrupted, fallback to direct stream
    const fallbackAudio = new Audio(directGoogleUrl);
    currentAudioInstance = fallbackAudio;
    if (onStart) fallbackAudio.onplay = onStart;
    if (onEnd) {
      fallbackAudio.onended = onEnd;
      fallbackAudio.onerror = onEnd;
    }
    fallbackAudio.play().catch((err) => {
      console.warn('Direct native TTS audio fallback:', err);
      if (onEnd) onEnd();
    });
  });
}
