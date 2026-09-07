import React, { useState } from 'react';
import { Globe, ChevronDown, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/i18n';
import type { IndianLanguage } from '../../types';

interface LanguageSelectorProps {
  currentLang: string;
  onSelectLanguage: (code: string) => void;
  onOpenLanguageModal?: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelectLanguage,
  onOpenLanguageModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (onOpenLanguageModal) {
            onOpenLanguageModal();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="glass-pill px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:text-white hover:border-saffron/50 flex items-center gap-1.5 transition-all"
        title="Change Language & Voice / भाषा और आवाज बदलें"
      >
        <Globe className="w-3.5 h-3.5 text-saffron" />
        <span>{activeLang.nativeName}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {isOpen && !onOpenLanguageModal && (
        <div className="absolute right-0 mt-2 w-52 py-2 glass-panel rounded-2xl shadow-2xl z-50 border border-white/10 max-h-80 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-saffron border-b border-white/10 mb-1 flex items-center justify-between">
            <span>Select Language ({SUPPORTED_LANGUAGES.length})</span>
            <Sparkles className="w-3 h-3 text-saffron" />
          </div>
          {SUPPORTED_LANGUAGES.map((lang: IndianLanguage) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelectLanguage(lang.code);
                localStorage.setItem('weathergpt_user_lang', lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-saffron/20 transition-colors ${
                currentLang === lang.code ? 'text-saffron font-bold bg-saffron/10' : 'text-gray-300'
              }`}
            >
              <span>{lang.nativeName}</span>
              <span className="text-[10px] text-gray-500">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

