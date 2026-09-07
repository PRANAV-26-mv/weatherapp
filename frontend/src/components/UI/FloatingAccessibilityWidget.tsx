import React, { useState, useEffect } from 'react';
import { Volume2, Type, Eye, HelpCircle, X, ChevronUp, Sparkles, Globe } from 'lucide-react';
import { VoiceButton } from './VoiceButton';

interface FloatingAccessibilityWidgetProps {
  currentLang: string;
  onOpenLanguageModal?: () => void;
  onOpenGuideModal?: () => void;
  weatherSpeechText?: string;
}

export const FloatingAccessibilityWidget: React.FC<FloatingAccessibilityWidgetProps> = ({
  currentLang,
  onOpenLanguageModal,
  onOpenGuideModal,
  weatherSpeechText = 'Welcome to WeatherGPT. Tap microphone to speak your question.'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('weathergpt_font_size') as any) || 'normal';
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('weathergpt_high_contrast') === 'true';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply font size class to body
  useEffect(() => {
    document.documentElement.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    document.documentElement.classList.add(`text-size-${fontSize}`);
    localStorage.setItem('weathergpt_font_size', fontSize);
  }, [fontSize]);

  // Apply high contrast class to body
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast-mode', highContrast);
    localStorage.setItem('weathergpt_high_contrast', String(highContrast));
  }, [highContrast]);

  const handleSpeakSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(weatherSpeechText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      
      {/* Expanded Quick Easy Action Menu */}
      {isOpen && (
        <div className="bg-slate-950/95 border border-saffron/40 p-4 rounded-2xl shadow-2xl backdrop-blur-xl w-72 text-white animate-in slide-in-from-bottom-5 duration-200">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron" />
              <span className="text-xs font-bold font-outfit text-white">Easy Access & Accessibility</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            
            {/* 1. Text Size Controller for Easy Reading */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Type className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reading Text Size (Large Fonts)</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    fontSize === 'normal'
                      ? 'bg-saffron text-black border-saffron font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    fontSize === 'large'
                      ? 'bg-saffron text-black border-saffron font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Large (A+)
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    fontSize === 'xlarge'
                      ? 'bg-saffron text-black border-saffron font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Extra (A++)
                </button>
              </div>
            </div>

            {/* 2. Outdoor High Contrast Mode for Sun Visibility */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Outdoor Outdoor High Contrast</span>
                </span>
                <span className="text-[10px] text-slate-400">{highContrast ? 'ON' : 'OFF'}</span>
              </label>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-full py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  highContrast
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                }`}
              >
                {highContrast ? '👁️ High Contrast Active' : '☀ Enable High Contrast'}
              </button>
            </div>

            {/* 3. Speak Out Weather Audio Summary */}
            <div>
              <button
                onClick={handleSpeakSummary}
                className={`w-full py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  isSpeaking
                    ? 'bg-red-500 text-white border-red-400 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-saffron text-black border-amber-400 hover:opacity-95'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? '⏹ Stop Audio Speech' : '🔊 Listen to Weather Voice'}</span>
              </button>
            </div>

            {/* 4. Quick Language & User Guide Links */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              {onOpenLanguageModal && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenLanguageModal();
                  }}
                  className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-medium text-slate-200 flex items-center justify-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Language</span>
                </button>
              )}
              {onOpenGuideModal && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenGuideModal();
                  }}
                  className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-medium text-slate-200 flex items-center justify-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-saffron" />
                  <span>Help Guide</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Floating Toggle Controls Bar */}
      <div className="flex items-center gap-2">
        {/* Floating Quick Microphone Speech Button */}
        <VoiceButton 
          langCode={currentLang}
        />

        {/* Floating Open Easy Accessibility Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 rounded-full bg-gradient-to-r from-slate-900 to-indigo-950 border border-saffron/40 text-saffron hover:text-white hover:bg-saffron shadow-2xl transition-all flex items-center justify-center group"
          title="Easy Access & Accessibility Settings"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
        </button>
      </div>

    </div>
  );
};
