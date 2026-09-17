import React, { useState, useEffect, useRef } from 'react';
import { 
  TRANSIT_LINES, 
  TRANSIT_STATIONS, 
  NETWORK_TRACKS, 
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
  MapPin,
  Layers,
  Sparkles,
  Info
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

// Station code to official line color helper
const getCodeBgColor = (code: string): string => {
  if (code.startsWith('NS')) return '#D42E12';
  if (code.startsWith('EW') || code.startsWith('CG')) return '#009530';
  if (code.startsWith('NE')) return '#9016B2';
  if (code.startsWith('CC') || code.startsWith('CE')) return '#FA9E0D';
  if (code.startsWith('DT')) return '#005EC4';
  if (code.startsWith('TE')) return '#9D5B25';
  if (code.startsWith('BP') || code.startsWith('SK') || code.startsWith('PG')) return '#74847B';
  return '#334155';
};

// Station label placement offsets to guarantee zero text collisions
const STATION_LABEL_CONFIG: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
  // East-West Line
  tuas_link: { dx: 14, dy: 4, anchor: 'start' },
  tuas_west_road: { dx: 14, dy: 4, anchor: 'start' },
  tuas_crescent: { dx: 14, dy: 4, anchor: 'start' },
  gul_circle: { dx: 14, dy: 4, anchor: 'start' },
  joo_koon: { dx: 0, dy: 16, anchor: 'middle' },
  pioneer: { dx: 0, dy: 16, anchor: 'middle' },
  boon_lay: { dx: 0, dy: -14, anchor: 'middle' },
  lakeside: { dx: 0, dy: 16, anchor: 'middle' },
  chinese_garden: { dx: 0, dy: 16, anchor: 'middle' },
  jurong_east: { dx: 16, dy: -14, anchor: 'start' },
  clementi: { dx: 0, dy: 18, anchor: 'middle' },
  dover: { dx: 0, dy: 18, anchor: 'middle' },
  buona_vista: { dx: -16, dy: -14, anchor: 'end' },
  commonwealth: { dx: -14, dy: 4, anchor: 'end' },
  queenstown: { dx: -14, dy: 4, anchor: 'end' },
  redhill: { dx: -14, dy: 4, anchor: 'end' },
  tiong_bahru: { dx: -14, dy: 4, anchor: 'end' },
  outram_park: { dx: 16, dy: 16, anchor: 'start' },
  tanjong_pagar: { dx: -16, dy: 14, anchor: 'end' },
  raffles_place: { dx: 16, dy: 14, anchor: 'start' },
  city_hall: { dx: 18, dy: -2, anchor: 'start' },
  bugis: { dx: 18, dy: -10, anchor: 'start' },
  lavender: { dx: 14, dy: -10, anchor: 'start' },
  kallang: { dx: 14, dy: -10, anchor: 'start' },
  aljunied: { dx: 14, dy: -10, anchor: 'start' },
  paya_lebar: { dx: 16, dy: -12, anchor: 'start' },
  eunos: { dx: 14, dy: -10, anchor: 'start' },
  kembangan: { dx: 14, dy: -10, anchor: 'start' },
  bedok: { dx: 0, dy: -16, anchor: 'middle' },
  tanah_merah: { dx: -16, dy: 16, anchor: 'end' },
  simei: { dx: 14, dy: 4, anchor: 'start' },
  tampines: { dx: 16, dy: -10, anchor: 'start' },
  pasir_ris: { dx: 16, dy: 4, anchor: 'start' },
  expo: { dx: 14, dy: 16, anchor: 'start' },
  changi_airport: { dx: 16, dy: 4, anchor: 'start' },

  // North-South Line
  bukit_batok: { dx: -14, dy: 4, anchor: 'end' },
  bukit_gombak: { dx: -14, dy: 4, anchor: 'end' },
  choa_chu_kang: { dx: -16, dy: 4, anchor: 'end' },
  yew_tee: { dx: -14, dy: 4, anchor: 'end' },
  kranji: { dx: -14, dy: 4, anchor: 'end' },
  marsiling: { dx: -14, dy: 4, anchor: 'end' },
  woodlands: { dx: 0, dy: -16, anchor: 'middle' },
  admiralty: { dx: 0, dy: -16, anchor: 'middle' },
  sembawang: { dx: 0, dy: -16, anchor: 'middle' },
  canberra: { dx: 0, dy: -16, anchor: 'middle' },
  yishun: { dx: 14, dy: -10, anchor: 'start' },
  khatib: { dx: 14, dy: 4, anchor: 'start' },
  yio_chu_kang: { dx: 14, dy: 4, anchor: 'start' },
  ang_mo_kio: { dx: 16, dy: 4, anchor: 'start' },
  bishan: { dx: -16, dy: -10, anchor: 'end' },
  braddell: { dx: 14, dy: 4, anchor: 'start' },
  toa_payoh: { dx: 14, dy: 4, anchor: 'start' },
  novena: { dx: 14, dy: 4, anchor: 'start' },
  newton: { dx: -16, dy: -6, anchor: 'end' },
  orchard: { dx: -16, dy: 4, anchor: 'end' },
  somerset: { dx: -14, dy: 4, anchor: 'end' },
  dhoby_ghaut: { dx: 20, dy: -10, anchor: 'start' },
  marina_bay: { dx: 18, dy: 4, anchor: 'start' },
  marina_south_pier: { dx: 18, dy: 4, anchor: 'start' },

  // Circle Line
  harbourfront: { dx: 0, dy: 22, anchor: 'middle' },
  telok_blangah: { dx: 0, dy: 18, anchor: 'middle' },
  labrador_park: { dx: -14, dy: 4, anchor: 'end' },
  pasir_panjang: { dx: -14, dy: 4, anchor: 'end' },
  haw_par_villa: { dx: -14, dy: 4, anchor: 'end' },
  kent_ridge: { dx: -14, dy: 4, anchor: 'end' },
  one_north: { dx: -14, dy: 4, anchor: 'end' },
  holland_village: { dx: -14, dy: 4, anchor: 'end' },
  farrer_road: { dx: -14, dy: 4, anchor: 'end' },
  botanic_gardens: { dx: -16, dy: -10, anchor: 'end' },
  caldecott: { dx: -16, dy: -10, anchor: 'end' },
  marymount: { dx: 0, dy: -16, anchor: 'middle' },
  lorong_chuan: { dx: 0, dy: -16, anchor: 'middle' },
  serangoon: { dx: 16, dy: -10, anchor: 'start' },
  bartley: { dx: 14, dy: 4, anchor: 'start' },
  tai_seng: { dx: 14, dy: 4, anchor: 'start' },
  macpherson: { dx: 16, dy: -10, anchor: 'start' },
  dakota: { dx: 14, dy: 4, anchor: 'start' },
  mountbatten: { dx: 14, dy: 4, anchor: 'start' },
  stadium: { dx: 16, dy: 8, anchor: 'start' },
  nicoll_highway: { dx: 16, dy: 4, anchor: 'start' },
  promenade: { dx: 16, dy: -8, anchor: 'start' },
  bayfront: { dx: 16, dy: 14, anchor: 'start' },
  esplanade: { dx: -16, dy: -8, anchor: 'end' },
  bras_basah: { dx: -16, dy: -8, anchor: 'end' },

  // Downtown Line
  bukit_panjang: { dx: -16, dy: -8, anchor: 'end' },
  cashew: { dx: -14, dy: 4, anchor: 'end' },
  hillview: { dx: -14, dy: 4, anchor: 'end' },
  beauty_world: { dx: -16, dy: 4, anchor: 'end' },
  king_albert_park: { dx: -16, dy: 4, anchor: 'end' },
  sixth_avenue: { dx: -16, dy: 4, anchor: 'end' },
  tan_kah_kee: { dx: 0, dy: -16, anchor: 'middle' },
  stevens: { dx: 0, dy: -16, anchor: 'middle' },
  rochor: { dx: 14, dy: 4, anchor: 'start' },
  downtown: { dx: -16, dy: 4, anchor: 'end' },
  telok_ayer: { dx: -14, dy: -8, anchor: 'end' },
  chinatown: { dx: -18, dy: -6, anchor: 'end' },
  jalan_besar: { dx: 14, dy: 4, anchor: 'start' },
  bendemeer: { dx: 14, dy: 4, anchor: 'start' },
  geylang_bahru: { dx: 14, dy: -10, anchor: 'start' },
  mattar: { dx: 14, dy: -10, anchor: 'start' },
  ubi: { dx: 14, dy: -10, anchor: 'start' },
  kaki_bukit: { dx: 14, dy: -10, anchor: 'start' },
  bedok_north: { dx: 14, dy: -10, anchor: 'start' },
  bedok_reservoir: { dx: 14, dy: -10, anchor: 'start' },
  tampines_west: { dx: 14, dy: 4, anchor: 'start' },
  tampines_east: { dx: 14, dy: 4, anchor: 'start' },
  upper_changi: { dx: 14, dy: 4, anchor: 'start' },

  // Thomson-East Coast Line
  woodlands_north: { dx: 0, dy: -18, anchor: 'middle' },
  woodlands_south: { dx: -14, dy: 4, anchor: 'end' },
  springleaf: { dx: -14, dy: 4, anchor: 'end' },
  lentor: { dx: -14, dy: 4, anchor: 'end' },
  mayflower: { dx: -14, dy: 4, anchor: 'end' },
  bright_hill: { dx: -14, dy: 4, anchor: 'end' },
  upper_thomson: { dx: -14, dy: 4, anchor: 'end' },
  mount_pleasant: { dx: -14, dy: 4, anchor: 'end' },
  napier: { dx: -14, dy: 4, anchor: 'end' },
  orchard_boulevard: { dx: -14, dy: 4, anchor: 'end' },
  great_world: { dx: -14, dy: 4, anchor: 'end' },
  havelock: { dx: -14, dy: 4, anchor: 'end' },
  maxwell: { dx: -14, dy: 4, anchor: 'end' },
  shenton_way: { dx: -14, dy: 4, anchor: 'end' },
  gardens_by_the_bay: { dx: 16, dy: 12, anchor: 'start' },
  tanjong_rhu: { dx: 16, dy: 8, anchor: 'start' },
  katong_park: { dx: 16, dy: 8, anchor: 'start' },
  tanjong_katong: { dx: 16, dy: 8, anchor: 'start' },
  marine_parade: { dx: 16, dy: 8, anchor: 'start' },
  marine_terrace: { dx: 16, dy: 8, anchor: 'start' },
  siglap: { dx: 16, dy: 8, anchor: 'start' },
  bayshore: { dx: 16, dy: 8, anchor: 'start' },

  // North-East Line
  clarke_quay: { dx: -14, dy: 4, anchor: 'end' },
  little_india: { dx: 16, dy: -10, anchor: 'start' },
  farrer_park: { dx: 14, dy: 4, anchor: 'start' },
  boon_keng: { dx: 14, dy: 4, anchor: 'start' },
  potong_pasir: { dx: 14, dy: 4, anchor: 'start' },
  woodleigh: { dx: 14, dy: 4, anchor: 'start' },
  kovan: { dx: 14, dy: 4, anchor: 'start' },
  hougang: { dx: 14, dy: 4, anchor: 'start' },
  buangkok: { dx: 14, dy: 4, anchor: 'start' },
  sengkang: { dx: 18, dy: 0, anchor: 'start' },
  punggol: { dx: 18, dy: 0, anchor: 'start' },

  // LRT Lines (BP, SK, PG)
  south_view: { dx: -12, dy: 4, anchor: 'end' },
  keat_hong: { dx: -12, dy: 4, anchor: 'end' },
  teck_whye: { dx: -12, dy: 4, anchor: 'end' },
  phoenix: { dx: -12, dy: 4, anchor: 'end' },
  senja: { dx: -12, dy: 4, anchor: 'end' },
  jelapang: { dx: -12, dy: 4, anchor: 'end' },
  fajar: { dx: 0, dy: -14, anchor: 'middle' },
  segar: { dx: 12, dy: 4, anchor: 'start' },
  compassvale: { dx: 12, dy: 4, anchor: 'start' },
  renjong: { dx: -12, dy: 4, anchor: 'end' },
  cove: { dx: 12, dy: 4, anchor: 'start' },
  soo_teck: { dx: -12, dy: 4, anchor: 'end' },
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

  // Train animation ticker
  const [trainTicks, setTrainTicks] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrainTicks((t) => (t + 1) % 1000);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Pan / drag handlers
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

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Center on selected station if clicked from another component
  useEffect(() => {
    if (selectedStation && !isDragging) {
      // Station coords are in viewBox 40 90 1100 680 (center ~ 590, 430)
      const targetPanX = (590 - selectedStation.x) * 0.35;
      const targetPanY = (430 - selectedStation.y) * 0.35;
      setPan({ x: targetPanX, y: targetPanY });
    }
  }, [selectedStation?.id]);

  const filteredTracks = NETWORK_TRACKS.filter((track) => {
    if (activeLineFilter === 'ALL') return true;
    return track.lineId === activeLineFilter;
  });

  return (
    <div 
      id="transit-map-container" 
      className={`relative w-full h-full flex flex-col overflow-hidden select-none ${
        mapTheme === 'clean' ? 'bg-[#f3f6fc]' : 'bg-[#0b1220]'
      } rounded-xl border border-[#e5e7eb] shadow-xs`}
    >
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Line Filter Tabs */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-sm border border-gray-200/80 flex items-center space-x-1 overflow-x-auto max-w-full">
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
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Toggle contrast mode"
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
          viewBox="40 90 1100 680"
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Subtle schematic grid background */}
            <pattern id="singapore-transit-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path 
                d="M 50 0 L 0 0 0 50" 
                fill="none" 
                stroke={mapTheme === 'clean' ? '#e1e8f2' : '#172236'} 
                strokeWidth="0.8" 
                strokeOpacity="0.7"
              />
            </pattern>
            {/* Glow filter for highlighted lines / active stations */}
            <filter id="mrt-route-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Soft drop shadow for station interchange nodes */}
            <filter id="mrt-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect x="0" y="0" width="1200" height="800" fill="url(#singapore-transit-grid)" />

          {/* Singapore Territorial Water Surroundings */}
          <rect x="0" y="0" width="1200" height="800" fill={mapTheme === 'clean' ? '#e9f1fa' : '#080f1d'} opacity="0.4" />

          {/* ============================================================== */}
          {/* ACCURATE SINGAPORE MAINLAND & ISLANDS GEOGRAPHIC SILHOUETTE */}
          {/* ============================================================== */}
          
          {/* Singapore Mainland Coastline Path */}
          <path
            d="M 60 490 
               C 50 510, 70 540, 110 530 
               C 140 520, 170 505, 210 505 
               C 260 510, 310 540, 360 570 
               C 400 600, 440 650, 470 720 
               C 480 735, 520 710, 560 670 
               C 610 660, 650 680, 680 690 
               C 730 695, 780 680, 830 650 
               C 890 620, 960 580, 1020 530 
               C 1070 490, 1130 470, 1135 440 
               C 1140 400, 1100 360, 1050 330 
               C 1000 310, 950 310, 900 300 
               C 850 250, 820 190, 770 170 
               C 720 160, 660 170, 610 150 
               C 560 140, 510 130, 460 130 
               C 400 135, 340 160, 290 190 
               C 240 220, 190 270, 160 330 
               C 130 380, 90 430, 60 490 Z"
            fill={mapTheme === 'clean' ? '#f8fafc' : '#111c30'}
            stroke={mapTheme === 'clean' ? '#cbd5e1' : '#23344f'}
            strokeWidth="2"
            opacity={mapTheme === 'clean' ? '0.9' : '0.75'}
          />

          {/* Sentosa Island */}
          <path
            d="M 430 750 C 450 740, 490 740, 520 755 C 505 770, 460 770, 430 750 Z"
            fill={mapTheme === 'clean' ? '#f1f5f9' : '#132238'}
            stroke={mapTheme === 'clean' ? '#94a3b8' : '#334155'}
            strokeWidth="1.5"
          />

          {/* Jurong Island */}
          <path
            d="M 180 570 C 230 560, 270 580, 275 620 C 250 645, 190 640, 175 605 Z"
            fill={mapTheme === 'clean' ? '#f1f5f9' : '#132238'}
            stroke={mapTheme === 'clean' ? '#94a3b8' : '#334155'}
            strokeWidth="1.5"
          />

          {/* Pulau Ubin & Pulau Tekong */}
          <path
            d="M 980 260 C 1020 250, 1060 260, 1055 285 C 1020 295, 980 285, 980 260 Z"
            fill={mapTheme === 'clean' ? '#f1f5f9' : '#132238'}
            stroke={mapTheme === 'clean' ? '#94a3b8' : '#334155'}
            strokeWidth="1.5"
          />

          {/* Central Catchment Nature Reserve (MacRitchie / Upper Peirce) */}
          <ellipse
            cx="480"
            cy="310"
            rx="45"
            ry="35"
            fill={mapTheme === 'clean' ? '#ecfdf5' : '#064e3b'}
            opacity="0.6"
            stroke={mapTheme === 'clean' ? '#a7f3d0' : '#047857'}
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text 
            x="480" 
            y="312" 
            textAnchor="middle" 
            className="text-[9px] font-bold fill-[#059669] opacity-70 select-none pointer-events-none"
          >
            Central Catchment
          </text>

          {/* Marina Bay & Kallang Basin Waterway Feature */}
          <path
            d="M 600 590 Q 640 580 670 630 T 730 630"
            fill="none"
            stroke={mapTheme === 'clean' ? '#bfdbfe' : '#1d3c6a'}
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* ============================================================== */}
          {/* OFFICIAL SINGAPORE TRAIN SYSTEM MAP BANNER & LEGEND */}
          {/* ============================================================== */}
          
          {/* Official System Map Title Header Block */}
          <g transform="translate(60, 115)" className="select-none pointer-events-none">
            <rect 
              x="0" 
              y="0" 
              width="330" 
              height="68" 
              rx="10" 
              fill={mapTheme === 'clean' ? '#ffffff' : '#0f172a'} 
              stroke={mapTheme === 'clean' ? '#e2e8f0' : '#1e293b'} 
              strokeWidth="1.5" 
              opacity="0.95" 
              filter="url(#mrt-node-shadow)"
            />
            {/* LTA Emblem Icon */}
            <g transform="translate(12, 14)">
              <rect x="0" y="0" width="40" height="40" rx="8" fill="#006d3e" />
              <path d="M 10 30 L 20 12 L 30 30 Z" fill="#ffffff" />
              <circle cx="20" cy="25" r="3" fill="#D42E12" />
            </g>
            <text 
              x="62" 
              y="26" 
              className="text-[12.5px] font-black tracking-tight" 
              fill={mapTheme === 'clean' ? '#0f172a' : '#ffffff'}
            >
              SINGAPORE TRAIN SYSTEM MAP
            </text>
            <text 
              x="62" 
              y="40" 
              className="text-[7.5px] font-semibold tracking-tight" 
              fill={mapTheme === 'clean' ? '#64748b' : '#94a3b8'}
            >
              SISTEM KERETA API SINGAPURA • 新加坡列车运行图 • சிங்கப்பூர் தொடருந்து வரைபடம்
            </text>
            <text 
              x="62" 
              y="53" 
              className="text-[8.5px] font-black uppercase tracking-wider" 
              fill="#006d3e"
            >
              Singapore Land Transport Authority
            </text>
          </g>

          {/* Official System Map Network Legend Box (bottom-left) */}
          <g transform="translate(60, 625)" className="select-none pointer-events-none hidden sm:block">
            <rect 
              x="0" 
              y="0" 
              width="270" 
              height="135" 
              rx="10" 
              fill={mapTheme === 'clean' ? '#ffffff' : '#0f172a'} 
              stroke={mapTheme === 'clean' ? '#e2e8f0' : '#1e293b'} 
              strokeWidth="1.5" 
              opacity="0.94" 
              filter="url(#mrt-node-shadow)"
            />
            <text x="12" y="18" className="text-[9.5px] font-black tracking-wider uppercase" fill={mapTheme === 'clean' ? '#1e293b' : '#f8fafc'}>
              System Legend / 线路图例
            </text>

            {/* Line items column 1 */}
            <g transform="translate(12, 28)">
              <rect width="18" height="9" rx="2.5" fill="#D42E12" />
              <text x="9" y="7" textAnchor="middle" className="text-[6.5px] font-black fill-white">NS</text>
              <text x="24" y="8" className="text-[8.5px] font-bold" fill={mapTheme === 'clean' ? '#334155' : '#cbd5e1'}>North-South Line</text>
            </g>

            <g transform="translate(12, 43)">
              <rect width="18" height="9" rx="2.5" fill="#009530" />
              <text x="9" y="7" textAnchor="middle" className="text-[6.5px] font-black fill-white">EW</text>
              <text x="24" y="8" className="text-[8.5px] font-bold" fill={mapTheme === 'clean' ? '#334155' : '#cbd5e1'}>East-West Line</text>
            </g>

            <g transform="translate(12, 58)">
              <rect width="18" height="9" rx="2.5" fill="#9016B2" />
              <text x="9" y="7" textAnchor="middle" className="text-[6.5px] font-black fill-white">NE</text>
              <text x="24" y="8" className="text-[8.5px] font-bold" fill={mapTheme === 'clean' ? '#334155' : '#cbd5e1'}>North East Line</text>
            </g>

            <g transform="translate(12, 73)">
              <rect width="18" height="9" rx="2.5" fill="#FA9E0D" />
              <text x="9" y="7" textAnchor="middle" className="text-[6.5px] font-black fill-white">CC</text>
              <text x="24" y="8" className="text-[8.5px] font-bold" fill={mapTheme === 'clean' ? '#334155' : '#cbd5e1'}>Circle Line</text>
            </g>

            {/* Line items column 2 */}
            <g transform="translate(138, 28)">
              <rect width="18" height="9" rx="2.5" fill="#005EC4" />
              <text x="9" y="7" textAnchor="middle" className="text-[6.5px] font-black fill-white">DT</text>
              <text x="24" y="8" className="text-[8.5px] font-bold" fill={mapTheme === 'clean' ? '#334155' : '#cbd5e1'}>Downtown Line</text>
            </g>

            <g transform="translate(138, 43)">
              <rect width="18" height="9" rx="2.5" fill="#9D5B25" />
              <text x="9" y="7" textAnchor="middle" className="text-[6.5px] font-black fill-white">TE</text>
              <text x="24" y="8" className="text-[8.5px] font-bold" fill={mapTheme === 'clean' ? '#334155' : '#cbd5e1'}>Thomson-East Coast</text>
            </g>

            <g transform="translate(138, 58)">
              <rect width="18" height="9" rx="2.5" fill="#74847B" />
              <text x="9" y="7" textAnchor="middle" className="text-[6.5px] font-black fill-white">LRT</text>
              <text x="24" y="8" className="text-[8.5px] font-bold" fill={mapTheme === 'clean' ? '#334155' : '#cbd5e1'}>Bukit Panjang / LRT</text>
            </g>

            {/* Special symbols row */}
            <g transform="translate(12, 94)">
              <rect x="0" y="0" width="16" height="12" rx="4" fill="#ffffff" stroke="#111827" strokeWidth="2" />
              <circle cx="8" cy="6" r="2.5" fill="#006d3e" />
              <text x="24" y="9" className="text-[8px] font-bold" fill={mapTheme === 'clean' ? '#475569' : '#94a3b8'}>Interchange Station</text>
            </g>

            <g transform="translate(138, 94)">
              <circle cx="8" cy="6" r="4.5" fill="#ffffff" stroke="#009530" strokeWidth="2" />
              <text x="24" y="9" className="text-[8px] font-bold" fill={mapTheme === 'clean' ? '#475569' : '#94a3b8'}>Standard Station</text>
            </g>

            <g transform="translate(12, 114)">
              <rect x="0" y="0" width="14" height="10" rx="2" fill="#006d3e" />
              <text x="7" y="8" textAnchor="middle" className="text-[6.5px] font-black fill-white">BUS</text>
              <text x="24" y="8" className="text-[8px] font-bold" fill={mapTheme === 'clean' ? '#475569' : '#94a3b8'}>Bus Interchange Link</text>
            </g>

            <g transform="translate(138, 114)">
              {/* Flight icon */}
              <circle cx="8" cy="5" r="5" fill="#0284c7" />
              <path d="M 6 5 L 10 5 M 8 3 L 8 7" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              <text x="24" y="8" className="text-[8px] font-bold" fill={mapTheme === 'clean' ? '#475569' : '#94a3b8'}>Airport Terminal</text>
            </g>
          </g>

          {/* RTS Link to Johor Bahru (Malaysia) at Woodlands North */}
          <g className="select-none pointer-events-none">
            <line 
              x1="380" 
              y1="170" 
              x2="380" 
              y2="105" 
              stroke="#0284c7" 
              strokeWidth="3.5" 
              strokeDasharray="4 4" 
            />
            <rect x="330" y="96" width="100" height="15" rx="3" fill="#0284c7" />
            <text x="380" y="107" textAnchor="middle" className="text-[7.5px] font-black fill-white">
              RTS LINK TO JOHOR BAHRU
            </text>
          </g>

          {/* Sentosa Express Monorail Route from HarbourFront */}
          <g className="select-none pointer-events-none">
            <line 
              x1="470" 
              y1="730" 
              x2="470" 
              y2="755" 
              stroke="#7c3aed" 
              strokeWidth="3" 
              strokeDasharray="3 3" 
            />
            <rect x="440" y="745" width="60" height="12" rx="3" fill="#7c3aed" />
            <text x="470" y="754" textAnchor="middle" className="text-[6.5px] font-black fill-white">
              SENTOSA EXPRESS
            </text>
          </g>

          {/* Changi Airport Terminal & Flight Indicator */}
          <g transform="translate(1040, 575)" className="select-none pointer-events-none">
            <g transform="translate(0, -32)">
              <rect x="-42" y="-12" width="84" height="24" rx="6" fill="#0284c7" />
              {/* Airplane silhouette */}
              <g transform="translate(-32, 0)">
                <circle r="6" fill="#ffffff" />
                <path d="M -3 0 L 3 0 M 0 -3 L 0 3" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              <text x="-6" y="-1" className="text-[7px] font-black fill-white">
                CHANGI AIRPORT
              </text>
              <text x="-6" y="7" className="text-[6px] font-bold fill-sky-100">
                Terminals 1 • 2 • 3 • 4
              </text>
            </g>
          </g>

          {/* Waterway / Regional Labels */}
          <g className="text-[10px] font-extrabold tracking-widest fill-gray-400/80 uppercase select-none pointer-events-none">
            <text x="560" y="112" textAnchor="middle">STRAITS OF JOHOR (MALAYSIA)</text>
            <text x="640" y="775" textAnchor="middle">SINGAPORE STRAIT</text>
            <text x="475" y="770" textAnchor="middle" className="text-[8px]">SENTOSA</text>
            <text x="220" y="605" textAnchor="middle" className="text-[8px]">JURONG ISLAND</text>
            <text x="1060" y="460" textAnchor="middle" className="text-[9px] fill-emerald-600 font-black">CHANGI</text>
          </g>

          {/* ============================================================== */}
          {/* NETWORK TRACKS: MAIN LINES & EXTENSIONS/BRANCHES */}
          {/* ============================================================== */}
          {filteredTracks.map((track) => {
            const isLineActive = activeLineFilter === 'ALL' || activeLineFilter === track.lineId;
            const isHighlighted = highlightedLineIds ? highlightedLineIds.includes(track.lineId) : false;
            const opacity = isLineActive ? (highlightedLineIds && !isHighlighted ? 0.25 : 1) : 0.12;

            return (
              <g key={`track-group-${track.lineId}`}>
                {/* 1. Track Bed Outline (White contrast halo) */}
                <path
                  d={track.path}
                  fill="none"
                  stroke={mapTheme === 'clean' ? '#ffffff' : '#070c16'}
                  strokeWidth={isHighlighted ? '14' : '10'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                />

                {/* Branch Path Bed Outline */}
                {track.branchPath && (
                  <path
                    d={track.branchPath}
                    fill="none"
                    stroke={mapTheme === 'clean' ? '#ffffff' : '#070c16'}
                    strokeWidth={isHighlighted ? '14' : '10'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={opacity}
                  />
                )}

                {/* 2. Main Color Track */}
                <path
                  id={`path-${track.lineId}`}
                  d={track.path}
                  fill="none"
                  stroke={track.color}
                  strokeWidth={isHighlighted ? '8' : '6'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                  filter={isHighlighted ? 'url(#mrt-route-glow)' : undefined}
                />

                {/* Branch Path Main Color Track */}
                {track.branchPath && (
                  <path
                    id={`branch-${track.lineId}`}
                    d={track.branchPath}
                    fill="none"
                    stroke={track.color}
                    strokeWidth={isHighlighted ? '8' : '6'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={opacity}
                    filter={isHighlighted ? 'url(#mrt-route-glow)' : undefined}
                  />
                )}
              </g>
            );
          })}

          {/* ============================================================== */}
          {/* ANIMATED ACTIVE TRAINS ALONG SINGAPORE MRT CORRIDORS */}
          {/* ============================================================== */}
          {activeLineFilter === 'ALL' && (
            <g className="pointer-events-none">
              {/* NS Line Train (Newton - Orchard stretch) */}
              <g transform="translate(560, 485)">
                <circle r="7" fill="#ffffff" stroke="#D42E12" strokeWidth="2.5" />
                <circle r="3.5" fill="#D42E12" className="animate-ping" />
              </g>
              {/* EW Line Train (Boon Lay - Jurong East stretch) */}
              <g transform="translate(230, 560)">
                <circle r="7" fill="#ffffff" stroke="#009530" strokeWidth="2.5" />
                <circle r="3.5" fill="#009530" />
              </g>
              {/* EW East Train (Bedok - Tampines) */}
              <g transform="translate(912, 470)">
                <circle r="7" fill="#ffffff" stroke="#009530" strokeWidth="2.5" />
                <circle r="3.5" fill="#009530" />
              </g>
              {/* CC Line Train (Bishan - Serangoon loop) */}
              <g transform="translate(647, 317)">
                <circle r="7" fill="#ffffff" stroke="#FA9E0D" strokeWidth="2.5" />
                <circle r="3.5" fill="#FA9E0D" />
              </g>
              {/* DT Line Train (Bukit Panjang - Beauty World) */}
              <g transform="translate(345, 365)">
                <circle r="7" fill="#ffffff" stroke="#005EC4" strokeWidth="2.5" />
                <circle r="3.5" fill="#005EC4" />
              </g>
              {/* NE Line Train (Little India - Serangoon) */}
              <g transform="translate(665, 437)">
                <circle r="7" fill="#ffffff" stroke="#9016B2" strokeWidth="2.5" />
                <circle r="3.5" fill="#9016B2" />
              </g>
              {/* TE Line Train (Woodlands - Caldecott) */}
              <g transform="translate(427, 282)">
                <circle r="7" fill="#ffffff" stroke="#9D5B25" strokeWidth="2.5" />
                <circle r="3.5" fill="#9D5B25" />
              </g>
            </g>
          )}

          {/* ============================================================== */}
          {/* STATION NODES: SCHEMATIC INTERCHANGES & REGULAR STOPS */}
          {/* ============================================================== */}
          {TRANSIT_STATIONS.map((station) => {
            const isStationSelected = selectedStation?.id === station.id;
            const isStationInActiveLine = activeLineFilter === 'ALL' || station.lines.includes(activeLineFilter);
            const isHighlightedStation = highlightedStationIds?.includes(station.id);
            
            const stationOpacity = isStationInActiveLine 
              ? (highlightedStationIds && !isHighlightedStation ? 0.35 : 1) 
              : 0.15;

            const labelConfig = STATION_LABEL_CONFIG[station.id] || {
              dx: station.x > 590 ? 14 : -14,
              dy: station.y > 450 ? 16 : -12,
              anchor: station.x > 590 ? 'start' : 'end',
            };

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
                {/* Selection Highlight Ring */}
                {isStationSelected && (
                  <circle
                    r="20"
                    fill="none"
                    stroke="#00bf71"
                    strokeWidth="3.5"
                    className="animate-pulse"
                  />
                )}

                {/* Node Shape: Multi-line Interchange vs Single Station */}
                {station.isInterchange ? (
                  <g filter="url(#mrt-node-shadow)">
                    {/* Outer white interchange pill */}
                    <rect
                      x="-13"
                      y="-13"
                      width="26"
                      height="26"
                      rx="8"
                      fill={mapTheme === 'clean' ? '#ffffff' : '#1e293b'}
                      stroke={isStationSelected ? '#006d3e' : '#151c27'}
                      strokeWidth={isStationSelected ? '3.5' : '2.5'}
                      className="transition-transform group-hover:scale-125"
                    />
                    {/* Colored concentric rings/dots representing intersecting MRT lines */}
                    <g transform="translate(0, 0)">
                      {station.lines.length >= 2 ? (
                        <g>
                          {station.lines.map((lineId, idx) => {
                            const line = TRANSIT_LINES.find(l => l.id === lineId);
                            const total = station.lines.length;
                            const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                            const r = 5.5;
                            const cx = Math.cos(angle) * r;
                            const cy = Math.sin(angle) * r;
                            return (
                              <circle
                                key={lineId}
                                cx={cx}
                                cy={cy}
                                r="3.2"
                                fill={line?.color || '#333'}
                              />
                            );
                          })}
                        </g>
                      ) : (
                        <circle r="4.5" fill={isStationSelected ? '#00bf71' : '#334155'} />
                      )}
                    </g>
                  </g>
                ) : (
                  <g filter="url(#mrt-node-shadow)">
                    {/* Regular station: High-contrast white disc with line-color rim */}
                    <circle
                      r="6"
                      fill={mapTheme === 'clean' ? '#ffffff' : '#1e293b'}
                      stroke={station.lines[0] ? TRANSIT_LINES.find(l => l.id === station.lines[0])?.color || '#333' : '#333'}
                      strokeWidth="3"
                      className="transition-transform group-hover:scale-130"
                    />
                  </g>
                )}

                {/* Station Label & Station Code */}
                <g 
                  transform={`translate(${labelConfig.dx}, ${labelConfig.dy})`}
                  textAnchor={labelConfig.anchor}
                >
                  <text
                    className="text-[11px] font-extrabold tracking-tight select-none"
                    fill={mapTheme === 'clean' ? (isStationSelected ? '#006d3e' : '#0f172a') : '#f8fafc'}
                    style={{ 
                      textShadow: mapTheme === 'clean' 
                        ? '0 1px 4px rgba(255,255,255,0.98), 0 0 2px rgba(255,255,255,0.95)' 
                        : '0 1px 4px rgba(0,0,0,0.98), 0 0 2px rgba(0,0,0,0.95)' 
                    }}
                  >
                    {station.name}
                  </text>
                  {showStationCodes && (
                    <g 
                      transform={`translate(${
                        labelConfig.anchor === 'end' 
                          ? -(station.codes.length * 28) 
                          : labelConfig.anchor === 'middle' 
                          ? -(station.codes.length * 14) 
                          : 0
                      }, 4)`}
                    >
                      {station.codes.map((code, cIdx) => (
                        <g key={code} transform={`translate(${cIdx * 27}, 0)`}>
                          <rect
                            x="0"
                            y="0"
                            width="25"
                            height="12"
                            rx="3"
                            fill={getCodeBgColor(code)}
                            stroke="#ffffff"
                            strokeWidth="0.75"
                          />
                          <text
                            x="12.5"
                            y="8.5"
                            textAnchor="middle"
                            className="text-[7px] font-mono font-black fill-white select-none"
                          >
                            {code}
                          </text>
                        </g>
                      ))}
                    </g>
                  )}
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
                    MRT Interchange
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
          <div className="flex items-center space-x-1.5 my-2.5 flex-wrap gap-y-1">
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

