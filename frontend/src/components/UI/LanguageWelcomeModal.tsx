import React, { useState } from 'react';
import { Volume2, CheckCircle2, Sparkles, Mic, ArrowRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/i18n';
import type { IndianLanguage } from '../../types';

interface LanguageWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onSelectLanguage: (code: string) => void;
}

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

export const VOICE_GREETINGS: Record<string, string> = {
  en: "Welcome to WeatherGPT AI Weather Intelligence Platform. Website and voice assistant are operating in English.",
  hi: "नमस्ते! वेदर-जीपीटी एआई मौसम बुद्धिमत्ता में आपका स्वागत है। पूरी वेबसाइट और वॉयस असिस्टेंट अब हिंदी में काम करेंगे।",
  ta: "வணக்கம்! WeatherGPT AI வானிலை தளத்திற்கு உங்களை வரவேற்கிறோம். இணையதளம் மற்றும் குரல் உதவி இப்போது தமிழில் செயல்படும்.",
  te: "నమస్కారం! WeatherGPT AI వాతావరణ వేదికకు స్వాగతం. వెబ్‌సైట్ మరియు వాయిస్ అసిస్టెంట్ ఇప్పుడు తెలుగులో పనిచేస్తాయి.",
  kn: "ನಮಸ್ಕಾರ! WeatherGPT AI ಹವಾಮಾನ ವೇದಿಕೆಗೆ ಸ್ವಾಗತ. ವೆಬ್‌ಸೈಟ್ ಮತ್ತು ಧ್ವನಿ ಸಹಾಯಕ ಈಗ ಕನ್ನಡದಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.",
  ml: "നമസ്കാരം! WeatherGPT AI കാലാവസ്ഥാ പ്ലാറ്റ്‌ഫോമിലേക്ക് സ്വാഗതം. വെബ്‌സൈറ്റും വോയ്‌സ് അസിസ്റ്റന്റും ഇപ്പോൾ മലയാളത്തിൽ പ്രവർത്തിക്കും.",
  mr: "नमस्कार! WeatherGPT AI हवामान प्लॅटफॉर्मवर तुमचे स्वागत आहे. वेबसाइट आणि व्हॉइस असिस्टंट आता मराठीत काम करतील.",
  bn: "নমস্কার! WeatherGPT AI আবহাওয়া প্ল্যাটফর্মে আপনাকে স্বাগতম। ওয়েবসাইট এবং ভয়েস অ্যাসিস্ট্যান্ট এখন বাংলায় কাজ করবে।",
  gu: "નમસ્તે! WeatherGPT AI માં આપનું સ્વાગત છે. વેબસાઇટ અને વોઇસ આસિસ્ટન્ટ હવે ગુજરાતીમાં કામ કરશે.",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! WeatherGPT AI ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਮੌਸਮ ਅਤੇ ਆਵਾਜ਼ ਸਹਾਇਕ ਹੁਣ ਪੰਜਾਬੀ ਵਿੱਚ ਕੰਮ ਕਰਨਗੇ।",
  or: "ନମସ୍କାର! WeatherGPT AI କୁ ସ୍ଵାଗତ। ପାଣିପାଗ ଏବଂ ଭଏସ୍ ସହାୟକ ଓଡ଼ିଆରେ କାମ କରିବେ।",
  as: "নমস্কাৰ! WeatherGPT AI লৈ স্বাগতম। বতৰ আৰু ভইચ সহায়ক এতিয়া অসমীয়াত কাম কৰিব।",
  ur: "خوش آمدید! ویڈر جی پی ٹی میں آپ کا استقبال ہے۔ ویب سائٹ اور وائس اسسٹنٹ اب اردو میں کام کریں گے۔"
};

export function speakLanguageGreeting(langCode: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const greeting = VOICE_GREETINGS[langCode] || VOICE_GREETINGS['en'];
    const locale = LANGUAGE_LOCALE_MAP[langCode] || 'en-IN';
    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.lang = locale;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.toLowerCase().includes(langCode) || v.lang.toLowerCase().includes(locale.toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}

export const LanguageWelcomeModal: React.FC<LanguageWelcomeModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLanguage,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(currentLang);
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlaySample = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    setPlayingCode(code);
    speakLanguageGreeting(code);
    setTimeout(() => setPlayingCode(null), 4000);
  };

  const handleConfirmChoice = () => {
    onSelectLanguage(selectedCode);
    localStorage.setItem('weathergpt_user_lang', selectedCode);
    localStorage.setItem('weathergpt_has_chosen_lang', 'true');
    speakLanguageGreeting(selectedCode);
    onClose();
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedCode) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fade-in">
      <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-3xl border border-saffron/50 max-w-2xl w-full space-y-4 md:space-y-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-saffron/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indiagreen/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/20 border border-saffron/40 text-saffron text-xs font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Website & Voice Assistant Language</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading tracking-tight">
            Choose Your Operating Language
          </h2>
          
          <p className="text-xs md:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
            अपनी भाषा चुनें • உங்கள் மொழியைத் தேர்ந்தெடுக்கவும் • మీ భాషను ఎంచుకోండి • ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ
          </p>
          <p className="text-[11px] text-saffron/90 font-semibold">
            🎙️ The website UI, AI Chat, and Voice Assistant (STT & TTS) will run in your chosen language.
          </p>
        </div>

        {/* Grid of Indian Languages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-saffron/30 relative z-10">
          {SUPPORTED_LANGUAGES.map((lang: IndianLanguage) => {
            const isSelected = selectedCode === lang.code;
            const isPlaying = playingCode === lang.code;

            return (
              <div
                key={lang.code}
                onClick={() => {
                  setSelectedCode(lang.code);
                  onSelectLanguage(lang.code);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 relative group ${
                  isSelected
                    ? 'bg-gradient-to-br from-saffron/30 via-saffron/10 to-transparent border-saffron shadow-lg shadow-saffron/20 scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                    {lang.name}
                  </span>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-saffron fill-saffron/20 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handlePlaySample(e, lang.code)}
                      className={`p-1 rounded-full transition-all ${
                        isPlaying
                          ? 'bg-saffron text-black animate-pulse'
                          : 'bg-white/10 hover:bg-saffron/30 text-gray-300 hover:text-saffron'
                      }`}
                      title={`Listen Voice Sample (${lang.name})`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <div className="text-base md:text-lg font-bold text-white font-heading">
                    {lang.nativeName}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Script: {lang.script}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Language Voice Guarantee Banner */}
        <div className="p-3 rounded-2xl bg-white/5 border border-saffron/30 flex items-center justify-between gap-3 relative z-10 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-saffron/20 text-saffron shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="text-gray-300">Selected Voice Target: </span>
              <strong className="text-saffron font-bold">{activeLangObj.nativeName} ({activeLangObj.name})</strong>
              <span className="text-[10px] text-gray-400 block font-mono">Locale Code: {LANGUAGE_LOCALE_MAP[activeLangObj.code] || 'en-IN'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => handlePlaySample(e, activeLangObj.code)}
            className="px-3 py-1.5 rounded-xl bg-saffron/20 hover:bg-saffron text-saffron hover:text-black border border-saffron/40 font-bold text-[11px] flex items-center gap-1.5 transition-all shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Voice</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-1 relative z-10">
          <button
            type="button"
            onClick={handleConfirmChoice}
            className="w-full saffron-gradient-btn py-3.5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-saffron/30 hover:scale-[1.01] transition-transform"
          >
            <span>Start Website in {activeLangObj.nativeName} ({activeLangObj.name})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
