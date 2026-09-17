import React, { useState, useMemo } from 'react';
import { TRANSIT_STATIONS, TRANSIT_LINES, getLineColor, getLineName } from '../data/transitData';
import { TransitStation, StationExit, StationAmenity, LineId } from '../types';
import { 
  Search, 
  MapPin, 
  Accessibility, 
  Bus, 
  HelpCircle, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  Info,
  Layers,
  ChevronRight,
  ExternalLink,
  Filter
} from 'lucide-react';

interface StationDirectoryProps {
  onSelectStationForMap?: (station: TransitStation) => void;
  onPlanTripFromStation?: (station: TransitStation) => void;
}

export const StationDirectory: React.FC<StationDirectoryProps> = ({
  onSelectStationForMap,
  onPlanTripFromStation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationId, setSelectedStationId] = useState<string>('dhoby_ghaut');
  const [lineFilter, setLineFilter] = useState<LineId | 'ALL'>('ALL');
  const [concessionType, setConcessionType] = useState<'adult' | 'senior' | 'student' | 'workfare'>('adult');
  const [fareCalcDestId, setFareCalcDestId] = useState<string>('bayfront');

  // Filter stations based on search query and line filter
  const filteredStations = useMemo(() => {
    return TRANSIT_STATIONS.filter((station) => {
      const matchesSearch = 
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.codes.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        station.zone.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLine = lineFilter === 'ALL' || station.lines.includes(lineFilter);
      return matchesSearch && matchesLine;
    });
  }, [searchQuery, lineFilter]);

  const activeStation = TRANSIT_STATIONS.find(s => s.id === selectedStationId) || TRANSIT_STATIONS[0];
  const fareDestStation = TRANSIT_STATIONS.find(s => s.id === fareCalcDestId) || TRANSIT_STATIONS[11];

  // Calculated distance and fare
  const fareResult = useMemo(() => {
    if (activeStation.id === fareDestStation.id) {
      return { distKm: 0, fare: 0 };
    }
    const dx = fareDestStation.x - activeStation.x;
    const dy = fareDestStation.y - activeStation.y;
    const distKm = Math.max(1.8, Math.round((Math.sqrt(dx * dx + dy * dy) / 25) * 10) / 10);

    let baseRate = 1.09 + distKm * 0.08;
    if (concessionType === 'student') baseRate *= 0.45;
    if (concessionType === 'senior') baseRate *= 0.55;
    if (concessionType === 'workfare') baseRate *= 0.75;

    return {
      distKm,
      fare: Math.round(baseRate * 100) / 100,
    };
  }, [activeStation, fareDestStation, concessionType]);

  return (
    <div id="station-directory-container" className="w-full flex flex-col space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#151c27]">
              Station Directory &amp; Station Guide
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Exits, barrier-free accessibility, amenities, and fare calculator
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station or code (e.g. Orchard, NS24)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f9f9ff] border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-hidden focus:border-[#006d3e]"
            />
          </div>
        </div>

        {/* Line Filter Pills */}
        <div className="flex items-center space-x-1.5 mt-3 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setLineFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              lineFilter === 'ALL'
                ? 'bg-[#151c27] text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Lines ({TRANSIT_STATIONS.length})
          </button>
          {TRANSIT_LINES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLineFilter(l.id)}
              style={{
                backgroundColor: lineFilter === l.id ? l.color : '#f3f4f6',
                color: lineFilter === l.id ? l.textColor : '#374151',
              }}
              className="px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              {l.code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Station List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column: Station Quick Selector */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-3 border border-[#e5e7eb] shadow-xs max-h-[560px] overflow-y-auto space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Stations ({filteredStations.length})
          </div>

          {filteredStations.map((stn) => {
            const isSelected = stn.id === activeStation.id;
            return (
              <div
                key={stn.id}
                onClick={() => setSelectedStationId(stn.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-[#e7eefe]/50 border-[#006d3e] shadow-2xs'
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-extrabold text-[#151c27]">
                      {stn.name}
                    </h4>
                    {stn.isInterchange && (
                      <span className="bg-gray-100 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Interchange
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    {stn.codes.map((c) => {
                      const lineId = c.replace(/[0-9]/g, '') as LineId;
                      const line = TRANSIT_LINES.find(l => l.id === lineId);
                      return (
                        <span
                          key={c}
                          style={{ backgroundColor: line?.color || '#333', color: line?.textColor || '#fff' }}
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold"
                        >
                          {c}
                        </span>
                      );
                    })}
                    <span className="text-[11px] text-gray-400 pl-1">
                      {stn.zone}
                    </span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 transition-colors ${
                  isSelected ? 'text-[#006d3e]' : 'text-gray-300'
                }`} />
              </div>
            );
          })}
        </div>

        {/* Right column: Detailed Station Explorer View */}
        <div className="lg:col-span-7 space-y-4">
          {/* Station Overview Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-black tracking-tight text-[#151c27]">
                    {activeStation.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {activeStation.codes.map((c) => {
                      const lineId = c.replace(/[0-9]/g, '') as LineId;
                      const line = TRANSIT_LINES.find(l => l.id === lineId);
                      return (
                        <span
                          key={c}
                          style={{ backgroundColor: line?.color, color: line?.textColor }}
                          className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                        >
                          {c}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeStation.zone} • {activeStation.lines.map(l => getLineName(l)).join(' & ')}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {onSelectStationForMap && (
                  <button
                    onClick={() => onSelectStationForMap(activeStation)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    View on Map
                  </button>
                )}
                {onPlanTripFromStation && (
                  <button
                    onClick={() => onPlanTripFromStation(activeStation)}
                    className="px-3 py-1.5 rounded-xl bg-[#006d3e] hover:bg-[#00522d] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Plan Trip From Here
                  </button>
                )}
              </div>
            </div>

            {/* Operating Hours Bar */}
            <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-gray-50 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
                  First Train Services
                </span>
                <div className="mt-0.5 text-gray-800 font-semibold">
                  North/East: <strong>{activeStation.firstTrain.northOrEast}</strong> • South/West: <strong>{activeStation.firstTrain.southOrWest}</strong>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
                  Last Train Services
                </span>
                <div className="mt-0.5 text-gray-800 font-semibold">
                  North/East: <strong>{activeStation.lastTrain.northOrEast}</strong> • South/West: <strong>{activeStation.lastTrain.southOrWest}</strong>
                </div>
              </div>
            </div>

            {/* Exits Directory */}
            <div className="mt-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-600 mb-2">
                Station Exits &amp; Connected Destinations ({activeStation.exits.length})
              </h4>
              <div className="space-y-2">
                {activeStation.exits.map((exit) => (
                  <div
                    key={exit.exitCode}
                    className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/80 flex items-start space-x-3"
                  >
                    <span className="px-2 py-1 rounded-lg bg-[#151c27] text-white font-mono text-xs font-bold shrink-0">
                      {exit.exitCode}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-900 leading-snug">
                        {exit.destinations.join(' • ')}
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-[11px] text-gray-500 font-medium">
                        {exit.hasLift && (
                          <span className="flex items-center space-x-1 text-emerald-700">
                            <Accessibility className="w-3.5 h-3.5" />
                            <span>Barrier-free Lift</span>
                          </span>
                        )}
                        {exit.busInterchange && (
                          <span className="flex items-center space-x-1 text-blue-700">
                            <Bus className="w-3.5 h-3.5" />
                            <span>Bus Interchange</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Station Amenities */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-600 mb-2">
                Amenities &amp; Facilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeStation.amenities.map((amenity, idx) => (
                  <div 
                    key={`amenity-${idx}`}
                    className="flex items-center space-x-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#006d3e] shrink-0" />
                    <span>{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Fare Calculator */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-[#006d3e]" />
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#151c27]">
                  Transit Fare Calculator
                </h4>
              </div>
              <span className="text-[11px] text-gray-400">
                Official LTA Standard Distance Fares
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Destination Station
                </label>
                <select
                  value={fareCalcDestId}
                  onChange={(e) => setFareCalcDestId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-800 outline-hidden"
                >
                  {TRANSIT_STATIONS.map((s) => (
                    <option key={`fare-dest-${s.id}`} value={s.id}>
                      {s.name} ({s.codes.join('/')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Passenger Concession Type
                </label>
                <select
                  value={concessionType}
                  onChange={(e) => setConcessionType(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-800 outline-hidden"
                >
                  <option value="adult">Adult EZ-Link / SimplyGo</option>
                  <option value="student">Primary &amp; Secondary Student</option>
                  <option value="senior">Senior Citizen Concession</option>
                  <option value="workfare">Workfare Transport Concession</option>
                </select>
              </div>
            </div>

            {/* Fare Output Box */}
            <div className="mt-3 p-3.5 bg-[#f0f3ff] rounded-xl flex items-center justify-between border border-[#e2e8f8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Calculated Contactless Fare
                </span>
                <span className="text-2xl font-black text-[#006d3e]">
                  ${fareResult.fare.toFixed(2)} SGD
                </span>
              </div>
              <div className="text-right text-xs text-gray-600 font-medium">
                <div>Distance: <strong>{fareResult.distKm} km</strong></div>
                <div className="text-[11px] text-gray-400">Transfer rules apply within 45 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
