import React, { useState, useEffect, useRef } from 'react';
import { 
  TRANSIT_LINES, 
  TRANSIT_STATIONS, 
} from '../data/transitData';
import { TransitStation, LineId } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Navigation, 
  ArrowRight, 
  Radio, 
  X,
  Compass,
  Search,
  CheckCircle2,
  Train
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

// Station code to official line color helper matching reference map
const getCodeBgColor = (code: string): string => {
  if (code.startsWith('NS')) return '#ef1c2a';
  if (code.startsWith('EW') || code.startsWith('CG')) return '#009e52';
  if (code.startsWith('NE')) return '#6b3394';
  if (code.startsWith('CC') || code.startsWith('CE')) return '#fcb02a';
  if (code.startsWith('DT')) return '#00509f';
  if (code.startsWith('TE')) return '#9d5b25';
  if (code.startsWith('BP') || code.startsWith('SK') || code.startsWith('PG')) return '#748477';
  return '#334155';
};

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
  const [showStationCodes, setShowStationCodes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Hover state for interactive tooltip
  const [hoveredStation, setHoveredStation] = useState<TransitStation | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Touch pan handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((z) => Math.min(4.0, Math.max(0.6, z * zoomFactor)));
  };

  const handleZoomIn = () => setZoom((z) => Math.min(4.0, z + 0.3));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHoveredStation(null);
  };

  // Center on selected station if clicked or navigated to
  useEffect(() => {
    if (selectedStation && !isDragging) {
      // The reference SVG viewBox is 0 0 11662 6527 (center at 5831, 3263.5)
      const container = containerRef.current;
      const width = container?.clientWidth || 1000;
      const height = container?.clientHeight || 600;
      const scale = Math.min(width / 11662, height / 6527);

      const dx = selectedStation.x - 5831;
      const dy = selectedStation.y - 3263.5;

      setPan({
        x: -dx * scale * zoom,
        y: -dy * scale * zoom,
      });
    }
  }, [selectedStation?.id]);

  // Filtered station search list
  const matchingStations = searchQuery.trim()
    ? TRANSIT_STATIONS.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.codes.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
          s.zone.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Filter stations based on active line filter
  const visibleStations = TRANSIT_STATIONS.filter((station) => {
    if (activeLineFilter === 'ALL') return true;
    return station.lines.includes(activeLineFilter);
  });

  return (
    <div 
      id="transit-map-container" 
      ref={containerRef}
      className={`relative w-full h-full flex flex-col overflow-hidden select-none ${
        mapTheme === 'clean' ? 'bg-[#c6ecff]' : 'bg-[#0b1220]'
      } rounded-2xl border border-gray-200/80 shadow-xs`}
    >
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Line Filter Tabs & Quick Search */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap max-w-full">
          {/* Line Filter Pills */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-sm border border-gray-200/80 flex items-center space-x-1 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveLineFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeLineFilter === 'ALL'
                  ? 'bg-[#151c27] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All MRT Lines
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
                  className={`px-2 py-1 text-xs font-bold rounded-lg flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap ${
                    !isSelected ? 'hover:bg-gray-100' : 'shadow-2xs'
                  }`}
                  title={line.name}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs" 
                    style={{ backgroundColor: isSelected ? line.textColor : line.color }} 
                  />
                  <span>{line.code}</span>
                </button>
              );
            })}
          </div>

          {/* Station Quick Search */}
          <div className="relative bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/80">
            <div className="flex items-center px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
              <input
                type="text"
                placeholder="Find station..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-24 sm:w-36 text-xs bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Auto-suggest dropdown */}
            {isSearchOpen && matchingStations.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
                {matchingStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => {
                      onSelectStation(station);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-gray-800">{station.name}</span>
                      <span className="block text-[10px] text-gray-400">{station.zone}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {station.codes.map((c) => (
                        <span
                          key={c}
                          style={{ backgroundColor: getCodeBgColor(c) }}
                          className="px-1 py-0.2 rounded text-[9px] font-black text-white font-mono"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zoom & Theme Controls */}
        <div className="pointer-events-auto flex items-center space-x-1 bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-sm border border-gray-200/80">
          <button
            onClick={() => setShowStationCodes(!showStationCodes)}
            className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
              showStationCodes ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Toggle station codes"
          >
            Codes
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={() => setMapTheme(mapTheme === 'clean' ? 'contrast' : 'clean')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              mapTheme === 'contrast' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Toggle high contrast dark mode"
          >
            <Compass className="w-4 h-4" />
          </button>
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

      {/* Main Interactive Map Viewport */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 11662 6527"
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: mapTheme === 'contrast' ? 'invert(0.9) hue-rotate(180deg) brightness(0.95)' : 'none',
          }}
        >
          <defs>
            {/* Glow filter for highlighted lines / active stations */}
            <filter id="mrt-route-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="25" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Soft drop shadow for station interchange nodes */}
            <filter id="mrt-node-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 1. Base Reference Vector Map: Complete authentic Singapore island coastline, nature reserves, lines, stations and CBD insert */}
          <image
            href="/singapore_mrt_network.svg"
            x="0"
            y="0"
            width="11662"
            height="6527"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* 2. Route Connection Overlay (if route planning is active) */}
          {highlightedStationIds && highlightedStationIds.length > 1 && (
            <g className="pointer-events-none">
              {(() => {
                const points = highlightedStationIds
                  .map((id) => TRANSIT_STATIONS.find((s) => s.id === id))
                  .filter(Boolean) as TransitStation[];
                if (points.length < 2) return null;
                const pathD = points.reduce((acc, curr, idx) => {
                  return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                }, '');
                return (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#006d3e"
                      strokeWidth="32"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.4"
                      filter="url(#mrt-route-glow)"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="16"
                      strokeDasharray="24 16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-pulse"
                    />
                  </>
                );
              })()}
            </g>
          )}

          {/* 3. Interactive Station Overlay: Station code capsules, highlight rings, and hit areas */}
          <g id="interactive-stations-layer">
            {TRANSIT_STATIONS.map((station) => {
              const isSelected = selectedStation?.id === station.id;
              const isHighlighted = highlightedStationIds?.includes(station.id);
              const isHovered = hoveredStation?.id === station.id;
              const isFilteredIn = activeLineFilter === 'ALL' || station.lines.includes(activeLineFilter);
              
              // Capsule positioning
              const capsuleWidth = station.codes.length * 80;
              const startX = station.x - capsuleWidth / 2;
              const startY = station.y - 75;

              return (
                <g 
                  key={station.id}
                  opacity={isFilteredIn ? 1 : 0.25}
                  className="transition-opacity duration-200"
                >
                  {/* Active Line Highlight Ring (when a specific line is selected) */}
                  {activeLineFilter !== 'ALL' && station.lines.includes(activeLineFilter) && (
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r="90"
                      fill="none"
                      stroke={TRANSIT_LINES.find((l) => l.id === activeLineFilter)?.color || '#ef1c2a'}
                      strokeWidth="14"
                      strokeDasharray="14 10"
                      className="animate-spin origin-center"
                      style={{ transformOrigin: `${station.x}px ${station.y}px`, animationDuration: '8s' }}
                    />
                  )}

                  {/* Route Plan Highlight Ring */}
                  {isHighlighted && !isSelected && (
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r="100"
                      fill="#006d3e"
                      fillOpacity="0.2"
                      stroke="#006d3e"
                      strokeWidth="12"
                      className="animate-pulse"
                    />
                  )}

                  {/* Selected Station Pulse & Center Marker */}
                  {isSelected && (
                    <g className="pointer-events-none">
                      <circle
                        cx={station.x}
                        cy={station.y}
                        r="160"
                        fill="none"
                        stroke="#006d3e"
                        strokeWidth="18"
                        className="animate-ping"
                        style={{ transformOrigin: `${station.x}px ${station.y}px` }}
                      />
                      <circle
                        cx={station.x}
                        cy={station.y}
                        r="110"
                        fill="#006d3e"
                        fillOpacity="0.3"
                        stroke="#ffffff"
                        strokeWidth="16"
                        filter="url(#mrt-node-shadow)"
                      />
                      <circle
                        cx={station.x}
                        cy={station.y}
                        r="45"
                        fill="#006d3e"
                        stroke="#ffffff"
                        strokeWidth="10"
                      />
                    </g>
                  )}

                  {/* Station Code Badges Capsule (Toggleable) */}
                  {showStationCodes && (
                    <g 
                      className="pointer-events-none transition-transform duration-150"
                      transform={isHovered ? `translate(0, -6)` : undefined}
                    >
                      <g filter="url(#mrt-node-shadow)">
                        {station.codes.map((code, idx) => (
                          <g key={code} transform={`translate(${startX + idx * 80}, ${startY})`}>
                            <rect
                              width="76"
                              height="38"
                              rx="8"
                              fill={getCodeBgColor(code)}
                              stroke="#ffffff"
                              strokeWidth="3"
                            />
                            <text
                              x="38"
                              y="25"
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="21"
                              fontWeight="900"
                              fontFamily="monospace, system-ui, sans-serif"
                            >
                              {code}
                            </text>
                          </g>
                        ))}
                      </g>
                    </g>
                  )}

                  {/* Station Interactive Hit Circle (Broad target for smooth clicks and hover) */}
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r="130"
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStation(station);
                    }}
                    onMouseEnter={(e) => {
                      setHoveredStation(station);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect = containerRef.current?.getBoundingClientRect();
                      if (parentRect) {
                        setHoverScreenPos({
                          x: rect.left + rect.width / 2 - parentRect.left,
                          y: rect.top - parentRect.top - 8,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredStation(null);
                      setHoverScreenPos(null);
                    }}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Interactive Station Hover Tooltip */}
      {hoveredStation && hoverScreenPos && (
        <div
          className="absolute z-40 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-gray-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-gray-700/80 backdrop-blur-md text-xs transition-opacity duration-150"
          style={{
            left: `${hoverScreenPos.x}px`,
            top: `${hoverScreenPos.y}px`,
          }}
        >
          <div className="font-extrabold text-sm flex items-center gap-1.5 whitespace-nowrap">
            <span>{hoveredStation.name}</span>
            {hoveredStation.isInterchange && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                Interchange
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {hoveredStation.codes.map((code) => (
              <span
                key={code}
                style={{ backgroundColor: getCodeBgColor(code) }}
                className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono shadow-xs text-white"
              >
                {code}
              </span>
            ))}
            <span className="text-gray-400 text-[11px] ml-1">{hoveredStation.zone}</span>
          </div>
        </div>
      )}

      {/* Floating Station Detail Card Popup (if station is selected) */}
      {selectedStation && (
        <div 
          id="station-detail-map-card"
          className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-30 bg-white/98 rounded-2xl shadow-2xl border border-gray-200/90 p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-start justify-between pb-2 border-b border-gray-100">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-extrabold text-[#151c27]">
                  {selectedStation.name}
                </h4>
                {selectedStation.isInterchange && (
                  <span className="bg-emerald-50 text-[#006d3e] text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                    MRT Interchange
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
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
          <div className="flex items-center space-x-1.5 my-2.5 flex-wrap gap-y-1">
            {selectedStation.codes.map((code) => (
              <span
                key={code}
                style={{ backgroundColor: getCodeBgColor(code) }}
                className="px-2 py-0.5 rounded text-xs font-black shadow-2xs font-mono text-white"
              >
                {code}
              </span>
            ))}
            <span className="text-xs text-gray-600 font-medium pl-1">
              {selectedStation.lines.map((l) => TRANSIT_LINES.find((t) => t.id === l)?.name).join(', ')}
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
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center space-x-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 text-[11px] font-semibold text-gray-600 shadow-2xs">
        <span className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-white border-2 border-gray-900 inline-block" />
          <span>Interchange</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006d3e] inline-block" />
          <span>MRT Station</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>Active Train</span>
        </span>
      </div>
    </div>
  );
};
