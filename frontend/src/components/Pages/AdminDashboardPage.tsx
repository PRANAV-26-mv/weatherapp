import React from 'react';
import { ShieldAlert, Server, Activity, CheckCircle2, Clock } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const apiHealth = [
    { name: 'Open-Meteo Live Sensor API', status: 'Operational', latency: '42 ms', uptime: '99.98%' },
    { name: 'IMD Doppler Warning Stream', status: 'Operational', latency: '65 ms', uptime: '99.94%' },
    { name: 'AI Tool Calling Engine', status: 'Operational', latency: '120 ms', uptime: '99.90%' },
    { name: 'Emergency WebPush WebSocket', status: 'Operational', latency: '18 ms', uptime: '100.00%' },
    { name: 'Leaflet GIS Tile Provider', status: 'Operational', latency: '28 ms', uptime: '99.99%' },
  ];

  const auditLogs = [
    { time: '07:15:22 IST', event: 'IMD Verified Warning #ALT-IMD-2026-0901 ingested & broadcasted to Mumbai zone.' },
    { time: '06:45:10 IST', event: 'Open-Meteo 24-hour weather cache updated for 48 Indian urban nodes.' },
    { time: '05:30:00 IST', event: 'NDMA Heatwave Advisory #ALT-NDMA-2026-0902 dispatched to Rajasthan geofences.' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-red-600">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white font-heading">
              Admin & Emergency Operations Center
            </h2>
            <p className="text-xs text-gray-400">
              Role: Emergency Operator / System Administrator
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System Status: ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      {/* High Level Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="glass-card p-5 space-y-1">
          <span className="text-gray-400 font-medium">Active Disaster Events</span>
          <div className="text-3xl font-extrabold text-red-500 font-heading">2 Active</div>
          <span className="text-[10px] text-gray-400">1 Warning 🔴 • 1 Advisory 🟡</span>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-gray-400 font-medium">Monitored Users</span>
          <div className="text-3xl font-extrabold text-white font-heading">142,850</div>
          <span className="text-[10px] text-emerald-400">+12% growth this week</span>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-gray-400 font-medium">Alert Acknowledgement Rate</span>
          <div className="text-3xl font-extrabold text-saffron font-heading">88.4%</div>
          <span className="text-[10px] text-gray-300">Within 15 minutes of push</span>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-gray-400 font-medium">Avg API Response Latency</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-heading">45 ms</div>
          <span className="text-[10px] text-emerald-400">Redis Weather Cache Hit 94%</span>
        </div>
      </div>

      {/* API Health Monitor Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
          <Server className="w-5 h-5 text-saffron" />
          <span>API & Service Health Monitor</span>
        </h3>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider bg-white/5">
                <th className="py-3 px-4 w-5/12 rounded-tl-xl">Service Component</th>
                <th className="py-3 px-4 w-3/12">Operational Status</th>
                <th className="py-3 px-4 w-2/12">Latency</th>
                <th className="py-3 px-4 w-2/12 rounded-tr-xl">Uptime (30d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {apiHealth.map((srv, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{srv.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                      ● {srv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-300">{srv.latency}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-300">{srv.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="glass-card p-6 space-y-3">
        <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
          <Activity className="w-5 h-5 text-saffron" />
          <span>System Emergency Audit Log</span>
        </h3>
        <div className="space-y-2 text-xs font-mono">
          {auditLogs.map((log, i) => (
            <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 text-gray-300 flex items-start gap-3">
              <Clock className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
              <div>
                <span className="text-saffron font-bold mr-2">[{log.time}]</span>
                <span>{log.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
