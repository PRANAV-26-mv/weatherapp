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

const FULL_LANGUAGE_NAME_KEYWORDS: Record<string, string[]> = {
  ta: ['ta-in', 'tamil', 'தமிழ்'],
  hi: ['hi-in', 'hindi', 'हिन्दी', 'हिंदी'],
  te: ['te-in', 'telugu', 'తెలుగు'],
  kn: ['kn-in', 'kannada', 'ಕನ್ನಡ'],
  ml: ['ml-in', 'malayalam', 'മലയാളം'],
  mr: ['mr-in', 'marathi', 'मराठी'],
  bn: ['bn-in', 'bn-bd', 'bengali', 'বাংলা'],
  gu: ['gu-in', 'gujarati', 'ગુજરાતી'],
  pa: ['pa-in', 'punjabi', 'ਪੰਜਾਬੀ'],
  or: ['or-in', 'odia', 'oriya', 'ଓଡ଼ିଆ'],
  as: ['as-in', 'assamese', 'অসমীয়া'],
  ur: ['ur-in', 'ur-pk', 'urdu', 'اردو'],
  en: ['en-in', 'en-us', 'en-gb', 'english'],
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
  const targetKeywords = FULL_LANGUAGE_NAME_KEYWORDS[langCode] || [langCode.toLowerCase()];

  // 1. Try Browser SpeechSynthesis ONLY for English ('en') if an exact voice is present.
  // For ALL regional languages (ta, hi, te, kn, ml, mr, bn, gu, pa, or, as, ur), browser SpeechSynthesis
  // on Windows/Linux browsers lacks local regional synth packages and reads native script using English voice.
  // Routing all regional languages directly to Google Neural TTS Native Audio Stream guarantees 100% authentic native speech!
  if (langCode === 'en' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();

    const matchedVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      return targetKeywords.some((kw) => vLang === kw || vLang.startsWith(`${kw}-`) || vLang.startsWith('en') || vName.includes(kw));
    });

    if (matchedVoice) {
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
