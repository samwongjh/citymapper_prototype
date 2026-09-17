import React, { useState, useEffect, useRef } from 'react';
import { 
  TRANSIT_LINES, 
  TRANSIT_STATIONS, 
  NETWORK_TRACKS, 
  LIVE_DEPARTURES 
} from '../data/transitData';
import { TransitStation, LineId } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Navigation, 
  ArrowRight, 
  Radio, 
  Sparkles,
  Train,
  CheckCircle2,
  X,
  Compass,
  Maximize2
} from 'lucide-react';

interface TransitMapProps {
  selectedStation: TransitStation | null;
  onSelectStation: (station: TransitStation) => void;
  onSetOrigin?: (station: TransitStation) => void;
  onSetDestination?: (station: TransitStation) => void;
  onViewDepartures?: (station: TransitStation) => void;
  highlightedLineIds?: LineId[];
  highlightedStationIds?: string[];
  isCompact?: boolean;
}

export const TransitMap: React.FC<TransitMapProps> = ({
  selectedStation,
  onSelectStation,
  onSetOrigin,
  onSetDestination,
  onViewDepartures,
  highlightedLineIds,
  highlightedStationIds,
  isCompact = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeLineFilter, setActiveLineFilter] = useState<LineId | 'ALL'>('ALL');
  const [mapTheme, setMapTheme] = useState<'clean' | 'contrast'>('clean');

  // Simulated live trains along tracks
  const [trainProgress, setTrainProgress] = useState<{ [trainId: string]: number }>({
    'train-ns-1': 0.15,
    'train-ns-2': 0.65,
    'train-ew-1': 0.35,
    'train-ew-2': 0.85,
    'train-cc-1': 0.45,
    'train-dt-1': 0.25,
    'train-ne-1': 0.70,
    'train-te-1': 0.40,
  });

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Train animation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTrainProgress((prev) => {
        const next: { [trainId: string]: number } = {};
        Object.keys(prev).forEach((id) => {
          const speed = id.includes('ns') ? 0.003 : id.includes('ew') ? 0.0028 : 0.0025;
          next[id] = (prev[id] + speed) % 1;
        });
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Pan / drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const filteredTracks = NETWORK_TRACKS.filter((track) => {
    if (activeLineFilter === 'ALL') return true;
    return track.lineId === activeLineFilter;
  });

  return (
    <div 
      id="transit-map-container" 
      className={`relative w-full h-full flex flex-col overflow-hidden select-none ${
        mapTheme === 'clean' ? 'bg-[#f4f7fc]' : 'bg-[#0f172a]'
      } rounded-xl border border-[#e5e7eb] shadow-xs`}
    >
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Line Filter Tabs */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-sm border border-gray-200/80 flex items-center space-x-1">
          <button
            onClick={() => setActiveLineFilter('ALL')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeLineFilter === 'ALL'
                ? 'bg-[#151c27] text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            All Lines
          </button>
          {TRANSIT_LINES.map((line) => {
            const isSelected = activeLineFilter === line.id;
            return (
              <button
                key={line.id}
                onClick={() => setActiveLineFilter(line.id)}
                style={{
                  backgroundColor: isSelected ? line.color : 'transparent',
                  color: isSelected ? line.textColor : '#4b5563',
                  borderColor: isSelected ? line.color : 'transparent',
                }}
                className={`px-2 py-1 text-xs font-bold rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                  !isSelected ? 'hover:bg-gray-100' : 'shadow-2xs'
                }`}
                title={line.name}
              >
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: isSelected ? line.textColor : line.color }} 
                />
                <span>{line.code}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom & Theme Controls */}
        <div className="pointer-events-auto flex items-center space-x-1 bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-sm border border-gray-200/80">
          <button
            onClick={() => setMapTheme(mapTheme === 'clean' ? 'contrast' : 'clean')}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Toggle contrast mode"
          >
            <Compass className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main SVG Map Area */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox="100 60 880 580"
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Soft grid background */}
            <pattern id="transit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 40 0 L 0 0 0 40" 
                fill="none" 
                stroke={mapTheme === 'clean' ? '#e2e8f0' : '#1e293b'} 
                strokeWidth="0.8" 
                strokeOpacity="0.6"
              />
            </pattern>
            {/* Glow filters for highlighted routes */}
            <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect x="0" y="0" width="1100" height="700" fill="url(#transit-grid)" />

          {/* Waterway / Coastal Stylized Singapore Island outline */}
          <path
            d="M 140 370 C 180 430, 260 480, 420 590 C 520 640, 680 620, 840 450 C 960 410, 960 340, 880 280 C 760 220, 650 180, 480 130 C 320 100, 180 180, 140 370 Z"
            fill={mapTheme === 'clean' ? '#edf2f7' : '#131e32'}
            opacity="0.45"
            stroke={mapTheme === 'clean' ? '#cbd5e1' : '#334155'}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Marina Reservoir / Singapore River feature */}
          <path
            d="M 520 500 Q 560 480 590 530 T 660 540"
            fill="none"
            stroke={mapTheme === 'clean' ? '#93c5fd' : '#1e3a8a'}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Network Tracks */}
          {NETWORK_TRACKS.map((track) => {
            const isLineActive = activeLineFilter === 'ALL' || activeLineFilter === track.lineId;
            const isHighlighted = highlightedLineIds ? highlightedLineIds.includes(track.lineId) : false;
            const opacity = isLineActive ? (highlightedLineIds && !isHighlighted ? 0.25 : 1) : 0.12;

            return (
              <g key={`track-${track.lineId}`}>
                {/* Outline for track contrast */}
                <path
                  d={track.path}
                  fill="none"
                  stroke={mapTheme === 'clean' ? '#ffffff' : '#090d16'}
                  strokeWidth={isHighlighted ? '14' : '10'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                />
                {/* Main colored line */}
                <path
                  id={`path-${track.lineId}`}
                  d={track.path}
                  fill="none"
                  stroke={track.color}
                  strokeWidth={isHighlighted ? '9' : '6'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                  filter={isHighlighted ? 'url(#route-glow)' : undefined}
                />
              </g>
            );
          })}

          {/* Animated Trains along Tracks */}
          {activeLineFilter === 'ALL' && (
            <>
              {/* NS Train 1 */}
              <g transform="translate(480, 355)">
                <circle r="7" fill="#ffffff" stroke="#D42E12" strokeWidth="3" />
                <circle r="3" fill="#D42E12" className="animate-ping" />
              </g>
              {/* EW Train 1 */}
              <g transform="translate(350, 430)">
                <circle r="7" fill="#ffffff" stroke="#009530" strokeWidth="3" />
                <circle r="3" fill="#009530" />
              </g>
              {/* CC Train 1 */}
              <g transform="translate(430, 360)">
                <circle r="7" fill="#ffffff" stroke="#FA9E0D" strokeWidth="3" />
                <circle r="3" fill="#FA9E0D" />
              </g>
              {/* DT Train 1 */}
              <g transform="translate(620, 440)">
                <circle r="7" fill="#ffffff" stroke="#005EC4" strokeWidth="3" />
                <circle r="3" fill="#005EC4" />
              </g>
            </>
          )}

          {/* Station Nodes */}
          {TRANSIT_STATIONS.map((station) => {
            const isStationSelected = selectedStation?.id === station.id;
            const isStationInActiveLine = activeLineFilter === 'ALL' || station.lines.includes(activeLineFilter);
            const isHighlightedStation = highlightedStationIds?.includes(station.id);
            
            const stationOpacity = isStationInActiveLine 
              ? (highlightedStationIds && !isHighlightedStation ? 0.4 : 1) 
              : 0.15;

            return (
              <g
                key={`stn-${station.id}`}
                transform={`translate(${station.x}, ${station.y})`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStation(station);
                }}
                opacity={stationOpacity}
              >
                {/* Station Selection Pulse Aura */}
                {isStationSelected && (
                  <circle
                    r="18"
                    fill="none"
                    stroke="#00bf71"
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                )}

                {/* Interchange Outer Ring vs Standard Node */}
                {station.isInterchange ? (
                  <g>
                    <rect
                      x="-11"
                      y="-11"
                      width="22"
                      height="22"
                      rx="7"
                      fill={mapTheme === 'clean' ? '#ffffff' : '#1e293b'}
                      stroke={isStationSelected ? '#006d3e' : '#151c27'}
                      strokeWidth={isStationSelected ? '3.5' : '2.5'}
                      className="transition-transform group-hover:scale-125"
                    />
                    {/* Inner color pill dots for connecting lines */}
                    <circle r="4.5" fill={isStationSelected ? '#00bf71' : '#334155'} />
                  </g>
                ) : (
                  <g>
                    <circle
                      r="6.5"
                      fill={mapTheme === 'clean' ? '#ffffff' : '#1e293b'}
                      stroke={station.lines[0] ? TRANSIT_LINES.find(l => l.id === station.lines[0])?.color || '#333' : '#333'}
                      strokeWidth="3"
                      className="transition-transform group-hover:scale-130"
                    />
                  </g>
                )}

                {/* Station Label & Station Code */}
                <g 
                  transform={`translate(${station.x > 500 ? 14 : -14}, ${station.y > 450 ? 18 : -14})`}
                  textAnchor={station.x > 500 ? 'start' : 'end'}
                >
                  <text
                    className="text-[11px] font-extrabold tracking-tight fill-current"
                    fill={mapTheme === 'clean' ? (isStationSelected ? '#006d3e' : '#0f172a') : '#f8fafc'}
                    style={{ textShadow: mapTheme === 'clean' ? '0 1px 3px rgba(255,255,255,0.95)' : '0 1px 3px rgba(0,0,0,0.95)' }}
                  >
                    {station.name}
                  </text>
                  <text
                    y="11"
                    className="text-[9px] font-mono font-bold"
                    fill={mapTheme === 'clean' ? '#64748b' : '#94a3b8'}
                  >
                    {station.codes.join(' • ')}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Station Detail Card Popup (if station is selected) */}
      {selectedStation && (
        <div 
          id="station-detail-map-card"
          className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-30 bg-white rounded-2xl shadow-xl border border-gray-200/90 p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-start justify-between pb-2 border-b border-gray-100">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-extrabold text-[#151c27]">
                  {selectedStation.name}
                </h4>
                {selectedStation.isInterchange && (
                  <span className="bg-[#e7eefe] text-[#006d3e] text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Interchange
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {selectedStation.zone}
              </p>
            </div>
            <button
              onClick={() => onSelectStation(null as any)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Line badges */}
          <div className="flex items-center space-x-1.5 my-2.5">
            {selectedStation.codes.map((code) => {
              const lineId = code.replace(/[0-9]/g, '') as LineId;
              const line = TRANSIT_LINES.find(l => l.id === lineId);
              return (
                <span
                  key={code}
                  style={{ backgroundColor: line?.color || '#333', color: line?.textColor || '#fff' }}
                  className="px-2 py-0.5 rounded text-xs font-black shadow-2xs font-mono"
                >
                  {code}
                </span>
              );
            })}
            <span className="text-xs text-gray-500 font-medium pl-1">
              {selectedStation.lines.map(l => TRANSIT_LINES.find(t => t.id === l)?.name).join(', ')}
            </span>
          </div>

          {/* Station Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl my-2.5">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">First Train</span>
              <span className="font-semibold text-gray-800">{selectedStation.firstTrain.northOrEast}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Last Train</span>
              <span className="font-semibold text-gray-800">{selectedStation.lastTrain.southOrWest}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => onSetOrigin && onSetOrigin(selectedStation)}
              className="px-2 py-2 rounded-lg bg-[#f0f3ff] hover:bg-[#e7eefe] text-[#006d3e] text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 mb-0.5" />
              <span>Set Origin</span>
            </button>

            <button
              onClick={() => onSetDestination && onSetDestination(selectedStation)}
              className="px-2 py-2 rounded-lg bg-[#006d3e] hover:bg-[#00522d] text-white text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer shadow-xs"
            >
              <ArrowRight className="w-3.5 h-3.5 mb-0.5" />
              <span>Set Destination</span>
            </button>

            <button
              onClick={() => onViewDepartures && onViewDepartures(selectedStation)}
              className="px-2 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 mb-0.5 text-emerald-600" />
              <span>Departures</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Legend Indicator */}
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center space-x-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 text-[11px] font-semibold text-gray-600 shadow-2xs">
        <span className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-white border-2 border-gray-900 inline-block" />
          <span>Interchange</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006d3e] inline-block" />
          <span>Regular Station</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>Active Train</span>
        </span>
      </div>
    </div>
  );
};
