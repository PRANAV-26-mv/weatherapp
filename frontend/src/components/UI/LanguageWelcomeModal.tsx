import React, { useState } from 'react';
import { Volume2, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/i18n';
import { speakInLanguage } from '../../services/voiceService';

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
  as: "নমস্কাৰ! WeatherGPT AI লৈ স্বাগতম। বতৰ আৰু ଭইચ সহায়ক এতিয়া অসমীয়াত কাম কৰিব।",
  ur: "خوش آمدید! ویڈر جی پی ٹی میں آپ کا استقبال ہے۔ ویب سائٹ اور وائس اسسٹنٹ اب اردو میں کام کریں گے۔"
};

export function speakLanguageGreeting(langCode: string, onStart?: () => void, onEnd?: () => void) {
  const greeting = VOICE_GREETINGS[langCode] || VOICE_GREETINGS['en'];
  speakInLanguage(greeting, langCode, onStart, onEnd);
}

export const LanguageWelcomeModal: React.FC<LanguageWelcomeModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLanguage
}) => {
  const [selected, setSelected] = useState<string>(currentLang);
  const [isPlayingSample, setIsPlayingSample] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestVoice = (langCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlayingSample(true);
    speakLanguageGreeting(
      langCode,
      () => setIsPlayingSample(true),
      () => setIsPlayingSample(false)
    );
  };

  const handleConfirm = () => {
    onSelectLanguage(selected);
    localStorage.setItem('weathergpt_user_lang', selected);
    localStorage.setItem('weathergpt_has_chosen_lang', 'true');
    handleTestVoice(selected);
    onClose();
  };

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selected) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-saffron/40 rounded-2xl shadow-2xl p-4 sm:p-5 text-white">
        
        {/* Header Badge & Title */}
        <div className="text-center max-w-xl mx-auto mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-saffron/20 text-saffron border border-saffron/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Select Operating Language</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold font-outfit text-white tracking-tight mb-1.5">
            Choose Your Preferred Language
          </h2>
          <p className="text-xs text-slate-300">
            WeatherGPT website interface, AI assistance, and voice output will speak natively in your language.
          </p>
        </div>

        {/* Language Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 mb-4">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => {
                  setSelected(lang.code);
                  handleTestVoice(lang.code);
                }}
                className={`cursor-pointer relative p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-saffron/25 to-amber-950/50 border-saffron shadow-lg shadow-saffron/15 ring-2 ring-saffron/40 scale-[1.01]'
                    : 'bg-slate-900/60 border-white/10 hover:border-saffron/40 hover:bg-slate-800/60'
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-saffron absolute top-2 right-2" />
                )}

                <div>
                  <div className="text-sm sm:text-base font-bold text-white mb-0.5">{lang.nativeName}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{lang.name}</div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                    {lang.script}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleTestVoice(lang.code, e)}
                    className="p-1 rounded-full bg-saffron/20 hover:bg-saffron text-saffron hover:text-black transition-colors"
                    title={`Listen to Voice Sample in ${lang.name}`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sample Preview & Launch Button */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-saffron/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <button
              onClick={() => handleTestVoice(selected)}
              className={`p-3 rounded-full bg-saffron text-black font-bold flex-shrink-0 transition-transform ${
                isPlayingSample ? 'animate-bounce scale-110' : 'hover:scale-105'
              }`}
              title="Test Voice Sample"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-bold text-saffron">
                Selected: {selectedLangObj.nativeName} ({selectedLangObj.name})
              </div>
              <div className="text-[11px] text-slate-300 italic line-clamp-1">
                "{VOICE_GREETINGS[selected]}"
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-saffron to-amber-500 hover:from-amber-500 hover:to-saffron text-black font-extrabold text-xs uppercase tracking-wider shadow-xl hover:shadow-saffron/25 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>Confirm & Launch App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
