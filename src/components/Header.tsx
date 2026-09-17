import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Radio, 
  AlertTriangle, 
  Layers, 
  Train, 
  Info,
  Search,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { TRANSIT_LINES } from '../data/transitData';

interface HeaderProps {
  activeTab: 'planner' | 'map' | 'departures' | 'alerts' | 'directory';
  setActiveTab: (tab: 'planner' | 'map' | 'departures' | 'alerts' | 'directory') => void;
  onSearchStation?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onSearchStation }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-SG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const disruptionCount = TRANSIT_LINES.filter(l => l.status !== 'normal').length;

  return (
    <header id="main-header" className="bg-[#ffffff] border-b border-[#e5e7eb] sticky top-0 z-40 shadow-xs">
      {/* Top micro-bar */}
      <div className="bg-[#151c27] text-white px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-[#45e08e] font-semibold tracking-wider text-[11px] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block mr-1.5 animate-pulse" />
            Live Network Feed
          </span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="text-gray-300 hidden sm:inline">
            Singapore Land Transport Authority (SMRT &amp; SBS Transit)
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-gray-300 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#00bf71]" />
            <span>{currentTime || '10:45:00 PM'} SGT</span>
          </div>
          <span className="text-gray-600">|</span>
          <div className="flex items-center text-xs">
            {disruptionCount === 0 ? (
              <span className="text-[#45e08e] flex items-center space-x-1 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All 6 Lines Normal</span>
              </span>
            ) : (
              <button 
                onClick={() => setActiveTab('alerts')}
                className="text-[#fbbf24] hover:text-[#f59e0b] flex items-center space-x-1 font-medium text-[11px] cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>1 Line Advisory</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
        {/* Logo & Identity */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('planner')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#006d3e] flex items-center justify-center text-white shadow-sm group-hover:bg-[#005a33] transition-colors">
              <Train className="w-5 h-5 text-[#67fea8]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-[#151c27]">
                  Urban Transit Navigator
                </span>
                <span className="bg-[#e7eefe] text-[#006d3e] text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide border border-[#bbcabc]/40">
                  MRT / LRT
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal">
                Mass Rapid Transit &amp; Multimodal Wayfinding
              </p>
            </div>
          </div>

          {/* Quick Line Color Pills */}
          <div className="hidden lg:flex items-center space-x-1 pl-4 border-l border-gray-200">
            {TRANSIT_LINES.map((line) => (
              <div 
                key={line.id} 
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shadow-2xs cursor-default"
                style={{ backgroundColor: line.color, color: line.textColor }}
                title={`${line.name} (${line.code})`}
              >
                {line.code}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="header-navigation-tabs" className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            id="tab-btn-planner"
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-[#006d3e] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Route Planner</span>
          </button>

          <button
            id="tab-btn-map"
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-[#006d3e] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Network Map</span>
          </button>

          <button
            id="tab-btn-departures"
            onClick={() => setActiveTab('departures')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'departures'
                ? 'bg-[#006d3e] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Departures</span>
          </button>

          <button
            id="tab-btn-alerts"
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#006d3e] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Line Status</span>
            {disruptionCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] ring-2 ring-white ml-0.5" />
            )}
          </button>

          <button
            id="tab-btn-directory"
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-[#006d3e] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Station Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
