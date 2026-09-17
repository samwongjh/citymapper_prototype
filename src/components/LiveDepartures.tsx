import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TRANSIT_STATIONS, 
  TRANSIT_LINES, 
  LIVE_DEPARTURES, 
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
  Sparkles,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Activity,
  Crosshair,
  Loader2
} from 'lucide-react';
import { findNearestStation } from '../utils/geolocation';

interface LiveDeparturesProps {
  currentStation?: TransitStation;
  onSelectStation?: (station: TransitStation) => void;
}

export type PanelState = 'loading' | 'ok' | 'empty' | 'refused' | 'busy' | 'unreachable' | 'my key not set';

const STATE_SENTENCES: Record<string, string> = {
  loading: 'Checking train times from LTA, usually under a second.',
  empty: 'LTA answered, but no timings are listed for this stop right now.',
  refused: 'We could not get train times, so nothing on this panel is current. Please tell us if this stays.',
  busy: 'The train service is busy. We will try again in 10 seconds.',
  unreachable: 'We could not reach LTA, so nothing on this panel has updated.',
};

export const LiveDepartures: React.FC<LiveDeparturesProps> = ({
  currentStation,
  onSelectStation,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(
    currentStation?.id || 'dhoby_ghaut'
  );
  const [secondsToRefresh, setSecondsToRefresh] = useState<number>(15);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('ALL');

  // Usability test simulation control: 'live' or specific simulated state
  const [simulationMode, setSimulationMode] = useState<string>('live');

  // Real-time API telemetry state
  const [panelState, setPanelState] = useState<PanelState>('loading');
  const [liveData, setLiveData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const retryTimerRef = useRef<any>(null);

  // Health check telemetry info
  const [healthInfo, setHealthInfo] = useState<{
    reachable: boolean | null;
    status: number | null;
    ms: number | null;
    keyConfigured: boolean | null;
  } | null>(null);
  const [showHealthModal, setShowHealthModal] = useState<boolean>(false);

  // User GPS Geolocation State (navigator.geolocation.getCurrentPosition)
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const station = TRANSIT_STATIONS.find(s => s.id === selectedStationId) || TRANSIT_STATIONS[7];

  /**
   * Invokes navigator.geolocation.getCurrentPosition to automatically switch
   * to the closest MRT station
   */
  const handleLocateNearestStation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoNotice('Acquiring GPS position via navigator.geolocation.getCurrentPosition...');

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = findNearestStation(latitude, longitude, TRANSIT_STATIONS);
        if (nearest) {
          handleStationChange(nearest.station.id);
          setGeoNotice(
            `Switched to nearest MRT: ${nearest.station.name} (${nearest.distanceFormatted} away, ±${Math.round(accuracy)}m)`
          );
        } else {
          setGeoNotice('No matching MRT station found.');
        }
      },
      (error: GeolocationPositionError) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoNotice('Location permission was denied in your browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoNotice('GPS position unavailable.');
        } else if (error.code === error.TIMEOUT) {
          setGeoNotice('Location request timed out.');
        } else {
          setGeoNotice(error.message || 'Unable to retrieve location.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  // Core fetch function for train departures
  const fetchTrainData = useCallback(async (forcedMode?: string) => {
    const mode = forcedMode ?? simulationMode;
    setPanelState('loading');
    setErrorMessage(null);

    try {
      const endpoint = mode === 'live' 
        ? '/api/train' 
        : `/api/train?simulate=${mode}`;

      const res = await fetch(endpoint);
      const statusCode = res.status;
      let body: any = null;

      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (statusCode === 200) {
        if (body?.state === 'empty' || (Array.isArray(body?.data) && body.data.length === 0 && mode !== 'live')) {
          setPanelState('empty');
          setLiveData([]);
        } else {
          setPanelState('ok');
          setLiveData(Array.isArray(body?.data) ? body.data : []);
        }
      } else if (statusCode === 502) {
        setPanelState('refused');
        setErrorMessage(body?.error || null);
      } else if (statusCode === 503) {
        if (body?.state === 'my key not set') {
          setPanelState('my key not set');
          setErrorMessage(body?.error || 'LTA_ACCOUNT_KEY is missing or blank');
        } else {
          setPanelState('busy');
          setErrorMessage(body?.error || null);
          // Start 10s countdown to auto-retry
          startRetryCountdown(10);
        }
      } else if (statusCode === 504) {
        setPanelState('unreachable');
        setErrorMessage(body?.error || null);
      } else {
        setPanelState('refused');
        setErrorMessage(body?.error || 'Unexpected status');
      }
    } catch {
      setPanelState('unreachable');
    }
  }, [simulationMode]);

  const startRetryCountdown = (seconds: number) => {
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    setRetryCountdown(seconds);
    retryTimerRef.current = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(retryTimerRef.current);
          fetchTrainData();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Fetch health check info
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthInfo({
        reachable: data?.lta?.reachable ?? data?.reachable ?? false,
        status: data?.lta?.status ?? data?.status ?? null,
        ms: data?.lta?.ms ?? data?.ms ?? null,
        keyConfigured: data?.keyConfigured ?? false,
      });
    } catch {
      setHealthInfo({
        reachable: false,
        status: null,
        ms: null,
        keyConfigured: false,
      });
    }
  };

  // Initial fetch and when simulationMode changes
  useEffect(() => {
    fetchTrainData();
    checkHealth();
    return () => {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    };
  }, [fetchTrainData]);

  // Refresh countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh(prev => {
        if (prev <= 1) {
          if (panelState !== 'busy') {
            fetchTrainData();
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [fetchTrainData, panelState]);

  // Update selected if prop changes
  useEffect(() => {
    if (currentStation) {
      setSelectedStationId(currentStation.id);
    }
  }, [currentStation]);

  // Compute live departures for the currently selected station
  const baseDepartures: LiveDeparture[] = LIVE_DEPARTURES[station.id] || [
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

  // Map live telemetry data if available from the live feed
  const activeDepartures: LiveDeparture[] = baseDepartures.map((dep, idx) => {
    if (panelState === 'ok' && liveData.length > 0) {
      // Find matching live record by station code or index
      const matchingLive = liveData.find(
        (item: any) =>
          station.codes.some(c => c.toLowerCase() === (item.stationCode || '').toLowerCase()) ||
          (item.stationName && station.name.toLowerCase().includes(item.stationName.toLowerCase()))
      ) || liveData[idx % liveData.length];

      if (matchingLive) {
        return {
          ...dep,
          minUntilNext: typeof matchingLive.minUntilNext === 'number' ? matchingLive.minUntilNext : dep.minUntilNext,
          minUntilSubsequent: typeof matchingLive.minUntilSubsequent === 'number' ? matchingLive.minUntilSubsequent : dep.minUntilSubsequent,
          destination: matchingLive.destination || dep.destination,
          platform: matchingLive.platform || dep.platform,
        };
      }
    }
    return dep;
  });

  const filteredDepartures = activePlatformFilter === 'ALL'
    ? activeDepartures
    : activeDepartures.filter(d => d.platform.toLowerCase().includes(activePlatformFilter.toLowerCase()));

  const handleStationChange = (stnId: string) => {
    setSelectedStationId(stnId);
    setActivePlatformFilter('ALL');
    const stn = TRANSIT_STATIONS.find(s => s.id === stnId);
    if (stn && onSelectStation) {
      onSelectStation(stn);
    }
  };

  const handleSimulationChange = (mode: string) => {
    setSimulationMode(mode);
    fetchTrainData(mode);
  };

  // Determine message for current state
  const currentSentence = 
    panelState === 'loading'
      ? STATE_SENTENCES.loading
      : panelState === 'empty'
      ? STATE_SENTENCES.empty
      : panelState === 'refused'
      ? STATE_SENTENCES.refused
      : panelState === 'busy'
      ? STATE_SENTENCES.busy
      : panelState === 'unreachable'
      ? STATE_SENTENCES.unreachable
      : panelState === 'my key not set'
      ? STATE_SENTENCES.refused
      : null;

  return (
    <div id="live-departures-container" className="w-full flex flex-col space-y-4">
      {/* Usability Testing State Simulator Toolbar */}
      <div className="bg-[#f0f4f8] border border-blue-200/80 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Usability Test State Controls:
            </span>
            <span className="text-[11px] text-gray-500 hidden md:inline">
              (Evaluate all 5 response states & sentences)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                checkHealth();
                setShowHealthModal(!showHealthModal);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-1 cursor-pointer"
              title="Inspect api/health serverless endpoint"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>API Health</span>
            </button>

            <button
              onClick={() => fetchTrainData()}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-1 cursor-pointer"
              title="Manual refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${panelState === 'loading' ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* State mode buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {[
            { id: 'live', label: 'Live LTA Feed', desc: 'Real serverless call' },
            { id: 'loading', label: 'Loading', desc: 'Checking train times' },
            { id: 'empty', label: 'Empty (200)', desc: 'No timings listed' },
            { id: 'refused', label: 'Refused (502)', desc: 'Could not get times' },
            { id: 'busy', label: 'Busy (503)', desc: 'Retry in 10s' },
            { id: 'unreachable', label: 'Unreachable (504)', desc: 'Could not reach LTA' },
          ].map((item) => {
            const isActive = simulationMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSimulationChange(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#151c27] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Health details dropdown */}
        {showHealthModal && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 text-xs text-gray-700 space-y-1">
            <div className="font-bold text-gray-900 flex items-center justify-between">
              <span>Serverless Health Report (/api/health):</span>
              <button 
                onClick={() => setShowHealthModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-gray-400 block">LTA Reachable:</span>
                <span className={healthInfo?.reachable ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                  {healthInfo?.reachable ? 'Yes (True)' : 'No (False)'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">LTA HTTP Status:</span>
                <span className="font-bold text-gray-800">
                  {healthInfo?.status !== null ? healthInfo?.status : 'None / Timeout'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Response Time:</span>
                <span className="font-bold text-gray-800">{healthInfo?.ms !== null ? `${healthInfo?.ms} ms` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Key Configured:</span>
                <span className={healthInfo?.keyConfigured ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {healthInfo?.keyConfigured ? 'Configured' : 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory State Banner when not OK or when Loading */}
      {currentSentence && (
        <div 
          className={`rounded-2xl p-4 border flex items-start space-x-3 transition-all ${
            panelState === 'loading'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : panelState === 'empty'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : panelState === 'refused' || panelState === 'my key not set'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : panelState === 'busy'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {panelState === 'loading' && (
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
          )}
          {panelState === 'empty' && (
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          {(panelState === 'refused' || panelState === 'my key not set') && (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          {panelState === 'busy' && (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          {panelState === 'unreachable' && (
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <p className="text-sm font-semibold leading-relaxed">
              {currentSentence}
            </p>
            {panelState === 'busy' && retryCountdown !== null && (
              <p className="text-xs text-amber-800 mt-1 font-mono font-medium">
                Auto-retrying in {retryCountdown} seconds...
              </p>
            )}
            {panelState === 'my key not set' && (
              <p className="text-xs text-rose-700 mt-1 font-mono">
                Notice: LTA_ACCOUNT_KEY is missing or blank in server environment.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Top Station Selection & Real-time status header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${panelState === 'ok' ? 'bg-[#10b981] animate-ping' : 'bg-gray-400'}`} />
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
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${panelState === 'loading' ? 'animate-spin' : ''}`} />
              <span>Updating in {secondsToRefresh}s</span>
            </span>
          </div>
        </div>

        {/* Station Select & Quick Station Chips */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Select Active Station
            </label>
            <button
              type="button"
              id="live-departures-locate-btn"
              onClick={handleLocateNearestStation}
              disabled={isLocating}
              className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#006d3e] hover:text-[#00522d] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              title="Locate closest MRT via navigator.geolocation.getCurrentPosition"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Locating GPS...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-3 h-3" />
                  <span>Nearest To Me</span>
                </>
              )}
            </button>
          </div>
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

          {/* GPS Notice Banner */}
          {geoNotice && (
            <div className="mt-2 text-xs bg-emerald-50/90 border border-emerald-200/80 text-emerald-900 rounded-xl px-3 py-1.5 flex items-center justify-between">
              <span className="font-medium text-[11px]">{geoNotice}</span>
              <button
                onClick={() => setGeoNotice(null)}
                className="text-emerald-600 hover:text-emerald-900 ml-2 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
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

        {/* Departure rows or Empty/Unreachable placeholder */}
        <div className="mt-4 space-y-3">
          {panelState === 'empty' ? (
            <div className="py-12 text-center bg-gray-900/60 rounded-xl border border-gray-800 p-6">
              <Train className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-300 font-semibold text-sm">
                {STATE_SENTENCES.empty}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please check back in a few moments or select another station.
              </p>
            </div>
          ) : panelState === 'refused' || panelState === 'my key not set' ? (
            <div className="py-10 text-center bg-gray-900/60 rounded-xl border border-rose-900/40 p-6">
              <AlertCircle className="w-10 h-10 text-rose-500/80 mx-auto mb-2" />
              <p className="text-rose-300 font-semibold text-sm">
                {STATE_SENTENCES.refused}
              </p>
              {errorMessage && (
                <p className="text-xs font-mono text-rose-400 mt-2 bg-rose-950/40 px-3 py-1 rounded inline-block">
                  {errorMessage}
                </p>
              )}
            </div>
          ) : panelState === 'unreachable' ? (
            <div className="py-10 text-center bg-gray-900/60 rounded-xl border border-red-900/40 p-6">
              <XCircle className="w-10 h-10 text-red-500/80 mx-auto mb-2" />
              <p className="text-red-300 font-semibold text-sm">
                {STATE_SENTENCES.unreachable}
              </p>
            </div>
          ) : (
            filteredDepartures.map((dep) => {
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
            })
          )}
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
