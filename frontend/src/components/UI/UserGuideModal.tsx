import React from 'react';
import { X, Mic, MapPin, ShieldAlert, Waves, Database, Sparkles, Globe } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLanguageModal?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenLanguageModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-saffron/30 rounded-2xl shadow-2xl p-4 sm:p-5 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-saffron to-amber-500 text-black font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-outfit text-white">WeatherGPT Quick User Guide</h2>
              <p className="text-[11px] text-slate-400">Everything you need to know about navigating & using the AI platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Guide Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          
          {/* Card 1: Multilingual Voice Intelligence */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-white/10 hover:border-saffron/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-saffron/20 text-saffron">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-saffron text-sm">1. Voice Query in 12 Indian Languages</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Click the orange microphone button to speak naturally. WeatherGPT auto-detects your language and speaks back the response in native voice.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenLanguageModal) onOpenLanguageModal();
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-saffron/20 hover:bg-saffron text-saffron hover:text-black font-medium transition-colors flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                Change Language Settings
              </button>
            </div>
          </div>

          {/* Card 2: Permanent Home Location */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-white/10 hover:border-cyan-400/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-cyan-400 text-sm">2. Pin Permanent Home Location</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Search any micro-location (e.g. <em>Sathyamangalam, Annur, Mettupalayam</em>) and click <strong>"Pin as Home"</strong> to save your coordinates permanently into PostgreSQL.
            </p>
          </div>

          {/* Card 3: Real-Time IMD Disaster Warning */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-white/10 hover:border-red-400/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-red-400 text-sm">3. Live Disaster Warnings & IMD Radar</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time Doppler radar broadcasts push warnings for flash floods, severe thunderstorms, and cyclones with official IMD guidance instructions.
            </p>
          </div>

          {/* Card 4: Marine & Air Quality Intelligence */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-white/10 hover:border-emerald-400/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Waves className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-emerald-400 text-sm">4. Air Quality & Marine Tides</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Switch to Marine tab for wave heights, sea temperature, swell period, or Air Quality tab for PM2.5, PM10, and health safety advice.
            </p>
          </div>

        </div>

        {/* Footer Database Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800 to-indigo-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-indigo-300">PostgreSQL Main Database Connected</h4>
              <p className="text-xs text-slate-400">10 relational tables automatically persist chat logs, voice transcriptions, & alert records.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-saffron text-black font-semibold text-xs hover:bg-amber-400 transition-all shadow-lg"
          >
            Got It! Explore App
          </button>
        </div>

      </div>
    </div>
  );
};
