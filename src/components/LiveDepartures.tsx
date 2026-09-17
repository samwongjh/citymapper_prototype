import React, { useState, useEffect } from 'react';
import { 
  TRANSIT_STATIONS, 
  TRANSIT_LINES, 
  LIVE_DEPARTURES, 
  getLineName, 
  getLineColor 
} from '../data/transitData';
import { TransitStation, LiveDeparture, LineId } from '../types';
import { 
  Radio, 
  Clock, 
  Users, 
  RefreshCw, 
  Train, 
  Info, 
  ChevronRight, 
  AlertCircle,
  MapPin,
  Sparkles
} from 'lucide-react';

interface LiveDeparturesProps {
  currentStation?: TransitStation;
  onSelectStation?: (station: TransitStation) => void;
}

export const LiveDepartures: React.FC<LiveDeparturesProps> = ({
  currentStation,
  onSelectStation,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(
    currentStation?.id || 'dhoby_ghaut'
  );
  const [secondsToRefresh, setSecondsToRefresh] = useState<number>(15);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('ALL');

  const station = TRANSIT_STATIONS.find(s => s.id === selectedStationId) || TRANSIT_STATIONS[7];

  // Refresh countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh(prev => {
        if (prev <= 1) {
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selected if prop changes
  useEffect(() => {
    if (currentStation) {
      setSelectedStationId(currentStation.id);
    }
  }, [currentStation]);

  const departures = LIVE_DEPARTURES[station.id] || [
    {
      id: 'mock-1',
      stationId: station.id,
      lineId: station.lines[0] || 'NS',
      platform: 'Platform A',
      destination: 'Terminal Outbound',
      minUntilNext: 2,
      minUntilSubsequent: 5,
      carCrowdLevels: ['low', 'moderate', 'moderate', 'low', 'low', 'low'],
      trainLength: 6,
    },
    {
      id: 'mock-2',
      stationId: station.id,
      lineId: station.lines[1] || station.lines[0] || 'NS',
      platform: 'Platform B',
      destination: 'City Center Inbound',
      minUntilNext: 4,
      minUntilSubsequent: 8,
      carCrowdLevels: ['moderate', 'high', 'high', 'moderate', 'low', 'low'],
      trainLength: 6,
    },
  ];

  const filteredDepartures = activePlatformFilter === 'ALL'
    ? departures
    : departures.filter(d => d.platform.toLowerCase().includes(activePlatformFilter.toLowerCase()));

  const handleStationChange = (stnId: string) => {
    setSelectedStationId(stnId);
    setActivePlatformFilter('ALL');
    const stn = TRANSIT_STATIONS.find(s => s.id === stnId);
    if (stn && onSelectStation) {
      onSelectStation(stn);
    }
  };

  return (
    <div id="live-departures-container" className="w-full flex flex-col space-y-4">
      {/* Top Station Selection & Real-time status header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#151c27]">
                Station Platform Departures
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Live automated passenger info display with carriage crowd density
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-gray-400 font-mono flex items-center space-x-1">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>Updating in {secondsToRefresh}s</span>
            </span>
          </div>
        </div>

        {/* Station Select & Quick Station Chips */}
        <div className="mt-3.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Select Active Station
          </label>
          <div className="flex items-center bg-[#f9f9ff] border border-gray-200 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 text-[#006d3e] mr-2 shrink-0" />
            <select
              value={station.id}
              onChange={(e) => handleStationChange(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-gray-800 outline-hidden cursor-pointer"
            >
              {TRANSIT_STATIONS.map((s) => (
                <option key={`dep-stn-${s.id}`} value={s.id}>
                  {s.name} ({s.codes.join(' • ')}) - {s.zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Station Quick Chips */}
        <div className="flex items-center space-x-2 mt-3 overflow-x-auto scrollbar-none pb-1">
          {['dhoby_ghaut', 'orchard', 'raffles_place', 'bayfront', 'jurong_east', 'changi_airport'].map((id) => {
            const s = TRANSIT_STATIONS.find(item => item.id === id);
            if (!s) return null;
            const isCurrent = s.id === station.id;
            return (
              <button
                key={id}
                onClick={() => handleStationChange(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#006d3e] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modern High-Contrast Digital Platform Board */}
      <div className="bg-[#111827] text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-800">
        {/* Digital Board Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-emerald-400">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  {station.name}
                </h3>
                <span className="bg-gray-800 text-gray-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  {station.codes.join(' • ')}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Operating Hours: {station.firstTrain.northOrEast} – {station.lastTrain.southOrWest}
              </p>
            </div>
          </div>

          {/* Crowd legend */}
          <div className="hidden sm:flex items-center space-x-3 text-[11px] text-gray-400">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] inline-block" />
              <span>Low</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b] inline-block" />
              <span>Moderate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] inline-block" />
              <span>High</span>
            </span>
          </div>
        </div>

        {/* Departure rows */}
        <div className="mt-4 space-y-3">
          {filteredDepartures.map((dep) => {
            const line = TRANSIT_LINES.find(l => l.id === dep.lineId);
            const isArriving = dep.minUntilNext <= 1;

            return (
              <div 
                key={dep.id} 
                className="bg-gray-900/90 rounded-xl p-4 border border-gray-800/80 hover:border-gray-700 transition-all"
              >
                {/* Main line, platform, and destination */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span
                      style={{ backgroundColor: line?.color || '#006d3e', color: line?.textColor || '#fff' }}
                      className="px-2.5 py-1 rounded-lg text-xs font-black shadow-2xs font-mono shrink-0"
                    >
                      {dep.lineId}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-300">
                          {dep.platform}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm font-black text-white">
                          {dep.destination}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {line?.name} • Next train {dep.trainLength} cars
                      </span>
                    </div>
                  </div>

                  {/* Countdown timing digital display */}
                  <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="flex items-baseline space-x-1">
                        {isArriving ? (
                          <span className="text-emerald-400 font-black text-xl tracking-tight uppercase animate-pulse">
                            Arr
                          </span>
                        ) : (
                          <>
                            <span className="text-2xl font-black text-emerald-400 font-mono">
                              {dep.minUntilNext}
                            </span>
                            <span className="text-xs font-bold text-gray-400">min</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono block">
                        Then: {dep.minUntilSubsequent} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carriage Crowd Level Visualizer Bar */}
                <div className="mt-3 pt-3 border-t border-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[11px] font-bold text-gray-400">
                      Carriage Crowd Level:
                    </span>
                  </div>

                  {/* Car boxes */}
                  <div className="flex items-center space-x-1.5">
                    {dep.carCrowdLevels.map((lvl, carIdx) => {
                      const colorClass = 
                        lvl === 'low'
                          ? 'bg-[#10b981] border-[#10b981]/50 text-gray-950'
                          : lvl === 'moderate'
                          ? 'bg-[#f59e0b] border-[#f59e0b]/50 text-gray-950'
                          : 'bg-[#ef4444] border-[#ef4444]/50 text-white';

                      return (
                        <div
                          key={`car-${carIdx}`}
                          className={`w-7 h-5 rounded text-[9px] font-mono font-bold flex items-center justify-center border shadow-xs transition-transform hover:scale-110 cursor-help ${colorClass}`}
                          title={`Car ${carIdx + 1}: ${lvl} crowd`}
                        >
                          {carIdx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Station First/Last Train Info */}
        <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
              First Train (North/East)
            </span>
            <span className="text-white font-mono font-semibold">
              {station.firstTrain.northOrEast}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
              First Train (South/West)
            </span>
            <span className="text-white font-mono font-semibold">
              {station.firstTrain.southOrWest}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
              Last Train (North/East)
            </span>
            <span className="text-white font-mono font-semibold">
              {station.lastTrain.northOrEast}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
              Last Train (South/West)
            </span>
            <span className="text-white font-mono font-semibold">
              {station.lastTrain.southOrWest}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
