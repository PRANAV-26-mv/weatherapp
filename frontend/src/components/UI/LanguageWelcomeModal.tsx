import React, { useState } from 'react';
import { Volume2, CheckCircle2, Sparkles, ArrowRight, X, Square } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/i18n';
import { speakInLanguage, stopVoiceSpeech, LANGUAGE_LOCALE_MAP } from '../../services/voiceService';

interface LanguageWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onSelectLanguage: (code: string) => void;
}

export { LANGUAGE_LOCALE_MAP };

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
  as: "নমস্কাৰ! WeatherGPT AI লৈ স্বাগতম। বতৰ আৰু ভইচ সহায়ক এতিয়া অসমীয়াত কাম কৰিব।",
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
  const [speakingLangCode, setSpeakingLangCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestVoice = (langCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // If already speaking this language, stop it
    if (speakingLangCode === langCode) {
      stopVoiceSpeech();
      setSpeakingLangCode(null);
      return;
    }

    // Otherwise speak the greeting in this language
    setSpeakingLangCode(langCode);
    speakLanguageGreeting(
      langCode,
      () => setSpeakingLangCode(langCode),
      () => setSpeakingLangCode(null)
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
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5 text-white">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopVoiceSpeech();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Modal"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="text-center max-w-xl mx-auto mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
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
            const isSpeakingThis = speakingLangCode === lang.code;

            return (
              <div
                key={lang.code}
                onClick={() => {
                  setSelected(lang.code);
                  handleTestVoice(lang.code);
                }}
                className={`cursor-pointer relative p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-500/[0.09] border-sky-400/50 shadow-sm shadow-sky-500/10 ring-1 ring-sky-400/30 scale-[1.01]'
                    : 'bg-slate-900/40 border-white/5 hover:border-sky-500/30 hover:bg-slate-800/30'
                } ${isSpeakingThis ? 'ring-2 ring-amber-400 shadow-md shadow-amber-500/20' : ''}`}
              >
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 absolute top-2 right-2" />
                )}

                <div>
                  <div className={`text-sm sm:text-base font-bold mb-0.5 flex items-center justify-between ${isSelected ? 'text-sky-100' : 'text-white'}`}>
                    <span>{lang.nativeName}</span>
                    {isSpeakingThis && (
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{lang.name}</div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono border border-white/5">
                    {lang.script}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleTestVoice(lang.code, e)}
                    className={`p-1.5 rounded-full transition-colors flex items-center gap-1 text-[10px] ${
                      isSpeakingThis
                        ? 'bg-amber-400 text-black font-bold animate-pulse'
                        : isSelected
                        ? 'bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-black'
                        : 'bg-white/5 text-slate-400 hover:text-sky-300 hover:bg-white/10'
                    }`}
                    title={isSpeakingThis ? 'Stop voice sample' : `Listen to Voice Sample in ${lang.name}`}
                  >
                    {isSpeakingThis ? <Square className="w-3 h-3 fill-black" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sample Preview & Launch Button */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 text-left">
            <button
              onClick={() => handleTestVoice(selected)}
              className={`p-2.5 rounded-full border font-bold shrink-0 transition-transform ${
                speakingLangCode === selected
                  ? 'bg-amber-400 text-black border-amber-400 animate-pulse scale-110'
                  : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border-sky-500/30 hover:scale-105'
              }`}
              title={speakingLangCode === selected ? "Stop voice sample" : "Test Voice Sample"}
            >
              {speakingLangCode === selected ? <Square className="w-4 h-4 fill-black" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div>
              <div className="text-xs font-bold text-sky-400">
                Selected: {selectedLangObj.nativeName} ({selectedLangObj.name})
              </div>
              <div className="text-[11px] text-slate-300 italic line-clamp-1">
                "{VOICE_GREETINGS[selected]}"
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>Confirm & Launch App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
