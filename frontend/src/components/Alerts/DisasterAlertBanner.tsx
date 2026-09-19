import React, { useState } from 'react';
import type { DisasterAlertEvent } from '../../types';
import { sendWhatsAppAlert, sendSMSAlert } from '../../services/notificationService';
import { ShieldAlert, AlertTriangle, CheckCircle, ExternalLink, MapPin, Clock, MessageSquare, Share2 } from 'lucide-react';

interface DisasterAlertBannerProps {
  alert: DisasterAlertEvent;
  onAcknowledge?: (alertId: string) => void;
}

export const DisasterAlertBanner: React.FC<DisasterAlertBannerProps> = ({ alert, onAcknowledge }) => {
  const [acknowledged, setAcknowledged] = useState(alert.isAcknowledged || false);

  const handleAck = () => {
    setAcknowledged(true);
    if (onAcknowledge) onAcknowledge(alert.id);
  };

  const isEmergency = alert.severity === 'emergency' || alert.severity === 'warning';

  return (
    <div
      className={`p-6 rounded-2xl relative overflow-hidden transition-all shadow-2xl border ${
        isEmergency
          ? 'emergency-alert-banner text-white'
          : 'glass-card border-amber-500/40 bg-amber-950/20 text-gray-100'
      }`}
    >
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isEmergency ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
            {isEmergency ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                alert.severity === 'warning' || alert.severity === 'emergency'
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                🚨 {alert.severity.toUpperCase()} ALERT
              </span>
              <span className="text-xs text-gray-300 font-medium">
                ID: {alert.id}
              </span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight mt-1 font-heading text-white">
              {alert.hazardType}
            </h3>
          </div>
        </div>

        {/* Action Buttons: Acknowledge, WhatsApp, SMS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => sendWhatsAppAlert(alert)}
            className="px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Send Emergency Alert via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Alert</span>
          </button>

          <button
            onClick={() => sendSMSAlert(alert)}
            className="px-3 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Send Emergency Alert via SMS"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>SMS Alert</span>
          </button>

          <button
            onClick={handleAck}
            disabled={acknowledged}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              acknowledged
                ? 'bg-emerald-600/70 text-white cursor-default'
                : isEmergency
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{acknowledged ? 'Acknowledged' : 'Mark as Seen'}</span>
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs bg-black/25 p-3.5 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
          <div>
            <span className="text-gray-400 block text-[10px]">Affected Location:</span>
            <strong className="text-white text-sm">{alert.affectedLocation}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-400 shrink-0" />
          <div>
            <span className="text-gray-400 block text-[10px]">Validity / Expiration:</span>
            <strong className="text-white text-sm">{alert.expirationTime}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-red-400 shrink-0" />
          <div>
            <span className="text-gray-400 block text-[10px]">Official Warning Provider:</span>
            <a
              href={alert.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-300 underline hover:text-white font-bold text-sm flex items-center gap-1"
            >
              {alert.source}
            </a>
          </div>
        </div>
      </div>

      {/* Description & Official Guidance */}
      <div className="space-y-2 text-sm leading-relaxed">
        <p className="text-gray-200 font-normal">
          {alert.description}
        </p>

        <div className="p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-xs text-gray-300">
          <strong className="text-red-400 block mb-1 font-bold uppercase tracking-wider text-[11px]">
            Official Guidance & Instructions:
          </strong>
          {alert.officialGuidance}
        </div>
      </div>
    </div>
  );
};
