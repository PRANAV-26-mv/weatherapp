import React from 'react';
import { ShieldCheck, PhoneCall, Globe, Heart } from 'lucide-react';
import { ChakraLogo } from './ChakraLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-10 border-t border-white/10 glass-panel py-6 px-4 md:px-8 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-5">
        {/* Brand & Vision */}
        <div className="space-y-3">
          <ChakraLogo size="sm" />
          <p className="text-gray-400 text-xs leading-relaxed">
            AI-powered meteorological intelligence platform. Grounded real-time weather analytics, severe warning geofencing, satellite vision diagnostics, and Indian language decision support.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Open-Meteo & IMD Data Pipeline Operational</span>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-saffron" />
            <span>Emergency Support Helplines</span>
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>National Emergency Number:</span>
              <strong className="text-saffron">112</strong>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>NDMA Disaster Control Room:</span>
              <strong className="text-saffron">1078</strong>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>State Disaster Management:</span>
              <strong className="text-saffron">1070</strong>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>Coastal / Fisherman Helpline:</span>
              <strong className="text-saffron">1554</strong>
            </li>
          </ul>
        </div>

        {/* Official Meteorological Data Sources */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-saffron" />
            <span>Verified Data Sources</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-gray-300">
            <li>• India Meteorological Department (IMD)</li>
            <li>• Open-Meteo High Resolution Weather API</li>
            <li>• National Disaster Management Authority (NDMA)</li>
            <li>• INCOIS Indian Tsunami Early Warning Centre</li>
            <li>• Copernicus Atmosphere & Climate Change Service</li>
          </ul>
        </div>

        {/* Legal & Safety Disclosure */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">
            Safety & Accuracy Disclosure
          </h4>
          <p className="text-[11px] leading-relaxed text-gray-400">
            WeatherGPT provides decision-support analytics and AI explanations. Official severe weather evacuations and life-safety protocols must adhere strictly to verified NDMA/IMD bulletins.
          </p>
        </div>
      </div>

      {/* Footer Bottom Line */}
      <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-4">
        <div>
          © 2026 WeatherGPT Inc. All rights reserved. Designed for India & Global Weather Intelligence.
        </div>
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          <span>for Weather Safety</span>
        </div>
      </div>
    </footer>
  );
};
