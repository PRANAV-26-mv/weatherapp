// Universal Multilingual Voice Speech Synthesis Service
// 3-Tier Resilient TTS Engine:
// 1. Native Browser SpeechSynthesis (Edge Natural Indian voices, Google Chrome Hindi/English)
// 2. High-Quality Backend Audio Proxy (Google Neural TTS audio stream via /api/tts/speak)
// 3. Resilient Web Speech Fallback (Locale-targeted utterance)

export const LANGUAGE_LOCALE_MAP: Record<string, string> = {
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

export const FULL_LANGUAGE_NAME_KEYWORDS: Record<string, string[]> = {
  ta: ['ta-in', 'tamil', 'தமிழ்', 'valluvar'],
  hi: ['hi-in', 'hindi', 'हिन्दी', 'हिंदी', 'swara', 'madhur', 'kalpana', 'hemant'],
  te: ['te-in', 'telugu', 'తెలుగు', 'mohan'],
  kn: ['kn-in', 'kannada', 'ಕನ್ನಡ', 'gagan', 'sapna'],
  ml: ['ml-in', 'malayalam', 'മലയാളം', 'midhun', 'sobhana'],
  mr: ['mr-in', 'marathi', 'मराठी', 'manohar', 'aarohi'],
  bn: ['bn-in', 'bn-bd', 'bengali', 'বাংলা', 'bashkar', 'tanishaa'],
  gu: ['gu-in', 'gujarati', 'ગુજરાતી', 'dhwani', 'niranjan'],
  pa: ['pa-in', 'punjabi', 'ਪੰਜਾਬੀ'],
  or: ['or-in', 'odia', 'oriya', 'ଓଡ଼ିଆ'],
  as: ['as-in', 'assamese', 'অসমীয়া'],
  ur: ['ur-in', 'ur-pk', 'urdu', 'اردو', 'gul', 'salman'],
  en: ['en-in', 'en-us', 'en-gb', 'english', 'neerja', 'prabhat', 'ravi', 'heera'],
};

// Global state tracking
let currentAudioInstance: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;
let activeAbortController: AbortController | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize & refresh voice cache
function refreshVoices(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    refreshVoices();
  };
}

/**
 * Finds a matching native browser voice for the requested language code.
 * Matches by BCP-47 tag (e.g. 'ta-in'), language prefix, or voice name.
 */
export function findMatchingBrowserVoice(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetLocale = (LANGUAGE_LOCALE_MAP[langCode] || 'en-IN').toLowerCase();
  const prefix = langCode.toLowerCase();
  const keywords = FULL_LANGUAGE_NAME_KEYWORDS[langCode] || [prefix];

  // 1. Exact locale match (e.g. 'ta-in', 'hi-in')
  let match = voices.find((v) => v.lang.toLowerCase() === targetLocale);
  if (match) return match;

  // 2. Language prefix match (e.g. 'ta-LK', 'hi-IN')
  match = voices.find((v) => {
    const vLang = v.lang.toLowerCase();
    return vLang.startsWith(`${prefix}-`) || vLang === prefix;
  });
  if (match) return match;

  // 3. Name keywords match (e.g. "Microsoft Valluvar", "Google हिन्दी")
  match = voices.find((v) => {
    const vName = v.name.toLowerCase();
    return keywords.some((kw) => vName.includes(kw));
  });
  if (match) return match;

  // For English only, allow general English voice
  if (prefix === 'en') {
    return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || null;
  }

  return null;
}

/**
 * Stops all ongoing speech immediately (both Web Speech API and HTML Audio streams).
 */
export function stopVoiceSpeech(): void {
  if (activeAbortController) {
    try {
      activeAbortController.abort();
    } catch (_) {}
    activeAbortController = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  if (currentAudioInstance) {
    try {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
      currentAudioInstance.onplay = null;
      currentAudioInstance.onended = null;
      currentAudioInstance.onerror = null;
    } catch (_) {}
    currentAudioInstance = null;
  }

  if (currentBlobUrl) {
    try {
      URL.revokeObjectURL(currentBlobUrl);
    } catch (_) {}
    currentBlobUrl = null;
  }
}

/**
 * Checks if voice is currently speaking.
 */
export function isVoiceSpeaking(): boolean {
  if (currentAudioInstance && !currentAudioInstance.paused) return true;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

/**
 * Universal Multilingual Speech Function.
 * Speaks the text in the chosen language using the best available engine.
 */
export async function speakInLanguage(
  text: string,
  langCode: string = 'en',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  stopVoiceSpeech();

  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  const cleanText = text.replace(/[*#_`]/g, '').trim();
  const locale = LANGUAGE_LOCALE_MAP[langCode] || 'en-IN';
  refreshVoices();

  // =========================================================================
  // TIER 1: Native Browser SpeechSynthesis Voice
  // If the user's browser has an authentic native voice for this language
  // (e.g. Edge Natural Tamil/Hindi/Telugu/Bengali or Chrome Google Hindi/English),
  // use it for instant, 0-latency playback!
  // =========================================================================
  const nativeVoice = findMatchingBrowserVoice(langCode);
  if (nativeVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = nativeVoice;
      utterance.lang = nativeVoice.lang || locale;
      utterance.rate = 0.95;

      // Keep utterance in memory to avoid Chrome GC bug
      (window as any).__currentUtterance = utterance;

      let hasFinished = false;
      const finish = () => {
        if (!hasFinished) {
          hasFinished = true;
          delete (window as any).__currentUtterance;
          if (onEnd) onEnd();
        }
      };

      utterance.onstart = () => {
        if (onStart) onStart();
      };
      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn('SpeechSynthesis tier 1 failed, trying backend proxy:', e);
    }
  }

  // =========================================================================
  // TIER 2: High Quality Neural TTS Audio Stream via Backend Proxy
  // For languages without local browser voice packs (e.g. Tamil on Chrome Windows),
  // the backend proxy streams Google Neural TTS audio without CORS/Referer blocks.
  // =========================================================================
  const truncatedText = cleanText.length > 280 ? cleanText.slice(0, 280) : cleanText;
  const encodedQuery = encodeURIComponent(truncatedText);

  // Try relative proxy URL first (via Vite proxy), then absolute backend port 8000
  const candidateUrls = [
    `/api/tts/speak?text=${encodedQuery}&lang=${langCode}`,
    `http://localhost:8000/api/tts/speak?text=${encodedQuery}&lang=${langCode}`,
  ];

  const controller = new AbortController();
  activeAbortController = controller;

  for (const proxyUrl of candidateUrls) {
    if (controller.signal.aborted) return;

    try {
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: { Accept: 'audio/mpeg, audio/*' },
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && (contentType.includes('audio') || contentType.includes('octet-stream'))) {
        const audioBlob = await response.blob();
        if (controller.signal.aborted) return;

        const blobUrl = URL.createObjectURL(audioBlob);
        currentBlobUrl = blobUrl;

        const audio = new Audio(blobUrl);
        currentAudioInstance = audio;

        let hasFinished = false;
        const finish = () => {
          if (!hasFinished) {
            hasFinished = true;
            if (currentBlobUrl === blobUrl) {
              URL.revokeObjectURL(blobUrl);
              currentBlobUrl = null;
            }
            if (currentAudioInstance === audio) {
              currentAudioInstance = null;
            }
            if (onEnd) onEnd();
          }
        };

        audio.onplay = () => {
          if (onStart) onStart();
        };
        audio.onended = finish;
        audio.onerror = finish;

        await audio.play();
        return; // Successfully playing!
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return; // Intentional stop/switch
      // Try next candidate URL
    }
  }

  // =========================================================================
  // TIER 3: Resilient Web Speech API Fallback
  // If backend is unreachable, trigger browser SpeechSynthesis with the locale tag.
  // =========================================================================
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const fallbackUtterance = new SpeechSynthesisUtterance(cleanText);
      fallbackUtterance.lang = locale;
      fallbackUtterance.rate = 0.95;

      (window as any).__currentUtterance = fallbackUtterance;

      let hasFinished = false;
      const finish = () => {
        if (!hasFinished) {
          hasFinished = true;
          delete (window as any).__currentUtterance;
          if (onEnd) onEnd();
        }
      };

      fallbackUtterance.onstart = () => {
        if (onStart) onStart();
      };
      fallbackUtterance.onend = finish;
      fallbackUtterance.onerror = finish;

      window.speechSynthesis.speak(fallbackUtterance);
      return;
    } catch (e) {
      console.warn('Tier 3 fallback utterance failed:', e);
    }
  }

  if (onEnd) onEnd();
}
