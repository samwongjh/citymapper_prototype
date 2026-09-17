import React, { useState } from 'react';
import { TRANSIT_LINES, SERVICE_ALERTS } from '../data/transitData';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Bus, 
  Bell, 
  Clock, 
  Send, 
  ExternalLink,
  ShieldAlert,
  Flame,
  Check
} from 'lucide-react';
import { LineId } from '../types';

export const ServiceAlerts: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeContact, setSubscribeContact] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportLine, setReportLine] = useState<LineId>('CC');
  const [reportText, setReportText] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeContact.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setSubscribeContact('');
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalOpen(false);
      setReportText('');
    }, 2000);
  };

  return (
    <div id="service-alerts-container" className="w-full flex flex-col space-y-4">
      {/* Network Overview Summary Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-pulse" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#151c27]">
                Rapid Transit Network Status
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Live monitoring of 6 MRT lines &amp; 160+ passenger interchanges
            </p>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Report Crowd or Delay</span>
          </button>
        </div>

        {/* 6 Line Health Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          {TRANSIT_LINES.map((line) => {
            const isNormal = line.status === 'normal';
            return (
              <div
                key={line.id}
                className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/70 flex flex-col justify-between hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span
                      style={{ backgroundColor: line.color, color: line.textColor }}
                      className="px-2.5 py-1 rounded-lg text-xs font-black shadow-2xs font-mono"
                    >
                      {line.code}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#151c27]">
                        {line.name}
                      </h4>
                      <span className="text-[10px] text-gray-500">
                        {line.stationsCount} Stations
                      </span>
                    </div>
                  </div>

                  {isNormal ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Normal</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Advisory</span>
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>Freq: <strong>{line.peakHeadwayMin}m</strong> peak / <strong>{line.offPeakHeadwayMin}m</strong> off-peak</span>
                  <span className="text-gray-400 font-mono text-[10px]">99.9% Punctual</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Service Advisories Feed */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006d3e]" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#151c27]">
              Active Advisories &amp; Travel Notices
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Official SMRT / SBST Dispatch
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          {SERVICE_ALERTS.map((alert) => {
            const line = TRANSIT_LINES.find(l => l.id === alert.lineId);
            const isWarning = alert.severity === 'delay' || alert.severity === 'disruption';

            return (
              <div
                key={alert.id}
                className={`rounded-xl p-4 border transition-all ${
                  isWarning
                    ? 'bg-amber-50/50 border-amber-200 text-gray-900'
                    : 'bg-gray-50/80 border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {line && (
                      <span
                        style={{ backgroundColor: line.color, color: line.textColor }}
                        className="px-2 py-0.5 rounded text-[10px] font-black shadow-2xs font-mono"
                      >
                        {line.code}
                      </span>
                    )}
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#151c27]">
                      {alert.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 shrink-0">
                    {alert.timeAgo}
                  </span>
                </div>

                <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                  {alert.description}
                </p>

                {/* Affected Stations */}
                {alert.affectedStations && (
                  <div className="mt-2.5 flex items-center space-x-2 text-[11px]">
                    <span className="text-gray-500 font-bold uppercase tracking-wide text-[10px]">
                      Affected:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {alert.affectedStations.map((stnName) => (
                        <span key={stnName} className="bg-white/80 px-2 py-0.5 rounded border border-gray-200 font-semibold text-gray-800">
                          {stnName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bridging Bus Details */}
                {alert.busShuttlePoints && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-white/90 border border-amber-200/80 flex items-start space-x-2 text-xs text-amber-900">
                    <Bus className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Alternative Bridging Transit:</strong>
                      <span>{alert.busShuttlePoints}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-[#151c27] text-white rounded-2xl p-4 sm:p-5 border border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[#45e08e]">
              <Bell className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Instant Travel Disruption Push Alerts
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Get notified immediately via Telegram or SMS if your daily commuting line experiences delays.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter mobile or Telegram handle..."
              value={subscribeContact}
              onChange={(e) => setSubscribeContact(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-hidden focus:border-[#00bf71] w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00bf71] hover:bg-[#00a863] text-gray-950 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Subscribe
            </button>
          </form>
        </div>

        {subscribed && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#006d3e]/40 border border-[#00bf71]/50 text-xs text-[#67fea8] flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Success! You are now subscribed to automated Singapore MRT line advisories.</span>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-[#151c27]">
                Report Transit Crowd or Delay
              </h3>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReport} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Select Affected Line
                </label>
                <select
                  value={reportLine}
                  onChange={(e) => setReportLine(e.target.value as LineId)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800 outline-hidden"
                >
                  {TRANSIT_LINES.map(l => (
                    <option key={`rep-${l.id}`} value={l.id}>
                      {l.code} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Observation / Issue
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Train held at platform for 5 mins, platform queue extending to escalators..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 outline-hidden focus:border-[#006d3e]"
                />
              </div>

              {reportSuccess ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Report submitted! Thank you for contributing to crowd intelligence.</span>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#006d3e] text-white text-xs font-bold hover:bg-[#00522d] transition-all"
                  >
                    Submit Report
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
