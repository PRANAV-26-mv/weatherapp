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

  // 1. Try Browser SpeechSynthesis with explicit matchedVoice selection
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === locale.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langCode.toLowerCase()) ||
        v.lang.toLowerCase().includes(langCode.toLowerCase())
    );

    if (matchedVoice) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = locale;
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

  // 2. Universal Native Online Audio Voice Stream Fallback (Guarantees Tamil, Hindi, Telugu, Kannada, etc. output)
  try {
    const truncatedText = cleanText.length > 200 ? cleanText.slice(0, 200) : cleanText;
    const encodedQuery = encodeURIComponent(truncatedText);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodedQuery}`;
    
    const audio = new Audio(audioUrl);
    currentAudioInstance = audio;

    if (onStart) audio.onplay = onStart;
    if (onEnd) {
      audio.onended = onEnd;
      audio.onerror = onEnd;
    }

    audio.play().catch((err) => {
      console.warn('Native speech playback fallback:', err);
      // Final fallback attempt with browser synthesis if audio block occurs
      if ('speechSynthesis' in window) {
        const fallbackUtterance = new SpeechSynthesisUtterance(cleanText);
        fallbackUtterance.lang = locale;
        if (onStart) fallbackUtterance.onstart = onStart;
        if (onEnd) {
          fallbackUtterance.onend = onEnd;
          fallbackUtterance.onerror = onEnd;
        }
        window.speechSynthesis.speak(fallbackUtterance);
      } else if (onEnd) {
        onEnd();
      }
    });
  } catch (err) {
    console.error('Speech synthesis execution failed:', err);
    if (onEnd) onEnd();
  }
}
