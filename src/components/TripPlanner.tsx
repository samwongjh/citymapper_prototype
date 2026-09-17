import React, { useState, useMemo } from 'react';
import { 
  TRANSIT_STATIONS, 
  TRANSIT_LINES, 
  getRouteOptions, 
  getLineName, 
  getLineColor 
} from '../data/transitData';
import { TransitStation, RouteOption, JourneyStep, LineId } from '../types';
import { 
  ArrowUpDown, 
  Clock, 
  Footprints, 
  Coins, 
  Leaf, 
  ChevronRight, 
  ChevronDown, 
  Navigation, 
  MapPin, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Train,
  AlertCircle,
  Play,
  RotateCcw,
  Crosshair,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { findNearestStation } from '../utils/geolocation';

interface TripPlannerProps {
  origin: TransitStation;
  destination: TransitStation;
  onChangeOrigin: (station: TransitStation) => void;
  onChangeDestination: (station: TransitStation) => void;
  onSelectRouteForMap?: (route: RouteOption) => void;
  onViewStationOnMap?: (station: TransitStation) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  origin,
  destination,
  onChangeOrigin,
  onChangeDestination,
  onSelectRouteForMap,
  onViewStationOnMap,
}) => {
  const [preference, setPreference] = useState<'all' | 'fastest' | 'transfers' | 'multimodal'>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-fastest');
  const [isNavigatingLive, setIsNavigatingLive] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [expandedStopsStepId, setExpandedStopsStepId] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoFeedback, setGeoFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  /**
   * Invokes browser navigator.geolocation.getCurrentPosition to find user GPS location
   * and automatically snaps origin to the closest Singapore MRT station
   */
  const handleGetCurrentPosition = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoFeedback({
        type: 'error',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setGeoLoading(true);
    setGeoFeedback({
      type: 'info',
      message: 'Calling navigator.geolocation.getCurrentPosition...',
    });

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        setGeoLoading(false);
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = findNearestStation(latitude, longitude, TRANSIT_STATIONS);
        if (nearest) {
          onChangeOrigin(nearest.station);
          setGeoFeedback({
            type: 'success',
            message: `Located nearest MRT: ${nearest.station.name} (${nearest.distanceFormatted})`,
            details: `GPS: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}° (±${Math.round(accuracy)}m)`,
          });
        } else {
          setGeoFeedback({
            type: 'error',
            message: 'Unable to match a nearby MRT station in Singapore.',
          });
        }
      },
      (error: GeolocationPositionError) => {
        setGeoLoading(false);
        let errorMsg = 'Could not acquire GPS position.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location unavailable. Please check your network or GPS.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS location request timed out.';
        }
        setGeoFeedback({
          type: 'error',
          message: errorMsg,
          details: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  };

  // Available routes
  const routes = useMemo(() => {
    return getRouteOptions(origin.id, destination.id);
  }, [origin.id, destination.id]);

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const handleSwapStations = () => {
    const temp = origin;
    onChangeOrigin(destination);
    onChangeDestination(temp);
  };

  const quickPresets = [
    { label: 'Marina Bay', originId: 'orchard', destId: 'bayfront' },
    { label: 'Changi Airport', originId: 'raffles_place', destId: 'changi_airport' },
    { label: 'Jurong East to Bugis', originId: 'jurong_east', destId: 'bugis' },
    { label: 'Sentosa / HarbourFront', originId: 'dhoby_ghaut', destId: 'harbourfront' },
  ];

  const handleSelectPreset = (p: typeof quickPresets[0]) => {
    const o = TRANSIT_STATIONS.find(s => s.id === p.originId);
    const d = TRANSIT_STATIONS.find(s => s.id === p.destId);
    if (o && d) {
      onChangeOrigin(o);
      onChangeDestination(d);
    }
  };

  const handleSelectRoute = (route: RouteOption) => {
    setSelectedRouteId(route.id);
    if (onSelectRouteForMap) {
      onSelectRouteForMap(route);
    }
  };

  return (
    <div id="trip-planner-component" className="w-full flex flex-col space-y-4">
      {/* Origin / Destination Search Form Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00bf71]" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#151c27]">
              Plan Transit Journey
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Contactless SimplyGo Fares
          </span>
        </div>

        {/* Inputs row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 relative">
          {/* Origin selector */}
          <div className="flex-1 relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Origin Station / Landmark
              </label>
              <button
                type="button"
                id="trip-planner-locate-origin-btn"
                onClick={handleGetCurrentPosition}
                disabled={geoLoading}
                className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#006d3e] hover:text-[#00522d] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                title="Detect current location via navigator.geolocation.getCurrentPosition"
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Locating GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3 h-3" />
                    <span>Use My Location (GPS)</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center bg-[#f9f9ff] border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#006d3e] focus-within:ring-1 focus-within:ring-[#006d3e] transition-all">
              <span className="w-3 h-3 rounded-full border-2 border-[#006d3e] bg-white mr-2.5 shrink-0" />
              <select
                value={origin.id}
                onChange={(e) => {
                  const stn = TRANSIT_STATIONS.find(s => s.id === e.target.value);
                  if (stn) onChangeOrigin(stn);
                }}
                className="w-full bg-transparent text-sm font-bold text-gray-800 outline-hidden cursor-pointer"
              >
                {TRANSIT_STATIONS.map((s) => (
                  <option key={`origin-${s.id}`} value={s.id}>
                    {s.name} ({s.codes.join('/')}) - {s.zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center sm:self-end sm:pb-1">
            <button
              onClick={handleSwapStations}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Destination selector */}
          <div className="flex-1 relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Destination Station / Landmark
            </label>
            <div className="flex items-center bg-[#f9f9ff] border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#006d3e] focus-within:ring-1 focus-within:ring-[#006d3e] transition-all">
              <MapPin className="w-4 h-4 text-[#ba1a1a] mr-2 shrink-0" />
              <select
                value={destination.id}
                onChange={(e) => {
                  const stn = TRANSIT_STATIONS.find(s => s.id === e.target.value);
                  if (stn) onChangeDestination(stn);
                }}
                className="w-full bg-transparent text-sm font-bold text-gray-800 outline-hidden cursor-pointer"
              >
                {TRANSIT_STATIONS.map((s) => (
                  <option key={`dest-${s.id}`} value={s.id}>
                    {s.name} ({s.codes.join('/')}) - {s.zone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Geolocation Feedback Banner (navigator.geolocation.getCurrentPosition result) */}
        {geoFeedback && (
          <div
            id="trip-planner-geo-banner"
            className={`mt-2.5 px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
              geoFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : geoFeedback.type === 'error'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {geoFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : geoFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              )}
              <div>
                <span className="font-bold">{geoFeedback.message}</span>
                {geoFeedback.details && (
                  <span className="text-gray-500 text-[11px] ml-1.5 font-mono">
                    {geoFeedback.details}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setGeoFeedback(null)}
              className="text-gray-400 hover:text-gray-600 ml-2 p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick presets pills */}
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-gray-400 text-[11px] font-medium shrink-0">Popular:</span>
          {quickPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shrink-0 transition-colors cursor-pointer text-[11px]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Navigation Mode Banner (if user triggers simulation) */}
      {isNavigatingLive && activeRoute && (
        <div className="bg-[#151c27] text-white rounded-2xl p-4 shadow-lg border border-[#00bf71]/40 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-xs font-bold text-[#45e08e] uppercase tracking-wider">
                Live Journey In Progress
              </span>
            </div>
            <button
              onClick={() => setIsNavigatingLive(false)}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 transition-colors cursor-pointer"
            >
              End Navigation
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-300 mb-1 font-medium">
              <span>Step {activeStepIndex + 1} of {activeRoute.steps.length}</span>
              <span>ETA {activeRoute.arrivalTime}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-[#00bf71] h-full transition-all duration-300"
                style={{ width: `${((activeStepIndex + 1) / activeRoute.steps.length) * 100}%` }}
              />
            </div>

            {/* Current Active Step */}
            <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700">
              <p className="text-sm font-bold text-white mb-1">
                {activeRoute.steps[activeStepIndex]?.instruction}
              </p>
              <p className="text-xs text-gray-300">
                {activeRoute.steps[activeStepIndex]?.detail}
              </p>
              {activeRoute.steps[activeStepIndex]?.carRecommendation && (
                <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-1 rounded-md bg-[#006d3e]/40 border border-[#00bf71]/50 text-[11px] text-[#67fea8] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Optimal Boarding: {activeRoute.steps[activeStepIndex].carRecommendation}</span>
                </div>
              )}
            </div>

            {/* Step forward/back controls */}
            <div className="flex items-center justify-between mt-3 pt-2">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs font-semibold cursor-pointer"
              >
                Previous Step
              </button>
              <button
                disabled={activeStepIndex === activeRoute.steps.length - 1}
                onClick={() => setActiveStepIndex(prev => Math.min(activeRoute.steps.length - 1, prev + 1))}
                className="px-4 py-1.5 rounded-lg bg-[#00bf71] hover:bg-[#00a863] text-gray-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Options Comparison Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Available Transit Routes ({routes.length})
          </span>
          <span className="text-xs text-emerald-700 font-semibold">
            All schedules live updated
          </span>
        </div>

        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <div
              key={route.id}
              onClick={() => handleSelectRoute(route)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#006d3e] ring-2 ring-[#006d3e]/20 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
              }`}
            >
              {/* Header row with duration and badges */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-[#151c27] tracking-tight">
                      {route.durationMinutes}
                    </span>
                    <span className="text-sm font-bold text-gray-500">min</span>

                    {route.badgeText && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        route.badgeText === 'RECOMMENDED'
                          ? 'bg-[#00bf71]/15 text-[#006d3e] border border-[#00bf71]/30'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {route.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Depart {route.departureTime} • Arrive {route.arrivalTime}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-[#151c27]">
                    ${route.fareSGD.toFixed(2)} SGD
                  </div>
                  <span className="text-[11px] text-gray-400">Adult Card Fare</span>
                </div>
              </div>

              {/* Transit Line Chips & Journey Path Visualizer */}
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {route.linesUsed.map((lineId, idx) => {
                    const line = TRANSIT_LINES.find(l => l.id === lineId);
                    return (
                      <React.Fragment key={`${route.id}-${lineId}-${idx}`}>
                        {idx > 0 && <span className="text-gray-300 text-xs">➔</span>}
                        <span
                          style={{ backgroundColor: line?.color, color: line?.textColor }}
                          className="px-2 py-0.5 rounded-md text-xs font-black shadow-2xs font-mono"
                        >
                          {line?.code}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="ml-auto flex items-center space-x-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center space-x-1">
                    <Footprints className="w-3.5 h-3.5 text-gray-400" />
                    <span>{route.walkingMeters}m walk</span>
                  </span>
                  <span>•</span>
                  <span>{route.transfers === 0 ? 'Direct' : `${route.transfers} transfer`}</span>
                </div>
              </div>

              {/* Environmental footprint badge */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center space-x-1 text-emerald-700">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saves {route.co2SavedKg}kg CO₂ vs private ride</span>
                </span>
                <span className="capitalize text-gray-400">
                  Crowd: <strong className="text-gray-700">{route.overallCrowd}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Step-by-Step Directions Breakdown for Selected Route */}
      {activeRoute && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e7eb] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#151c27]">
                Step-by-Step Wayfinding
              </h3>
              <p className="text-xs text-gray-500">
                Turn-by-turn platform guidance &amp; coach recommendations
              </p>
            </div>
            {!isNavigatingLive && (
              <button
                onClick={() => {
                  setIsNavigatingLive(true);
                  setActiveStepIndex(0);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#006d3e] hover:bg-[#00522d] text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Trip</span>
              </button>
            )}
          </div>

          {/* Timeline steps */}
          <div className="mt-4 space-y-4">
            {activeRoute.steps.map((step, idx) => {
              const isTrain = step.type === 'train';
              const isTransfer = step.type === 'transfer';
              const lineColor = step.lineId ? getLineColor(step.lineId) : '#94a3b8';
              const isExpanded = expandedStopsStepId === step.id;

              return (
                <div key={step.id} className="flex items-start space-x-3 relative group">
                  {/* Left Vertical timeline connector bar */}
                  {idx < activeRoute.steps.length - 1 && (
                    <div 
                      className="absolute left-[13px] top-7 bottom-[-16px] w-[2px]"
                      style={{ backgroundColor: isTrain ? lineColor : '#e2e8f0' }}
                    />
                  )}

                  {/* Step icon bullet */}
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white z-10 shadow-2xs font-bold text-xs"
                    style={{ backgroundColor: isTrain ? lineColor : isTransfer ? '#FA9E0D' : '#64748b' }}
                  >
                    {isTrain ? (
                      <Train className="w-3.5 h-3.5" />
                    ) : isTransfer ? (
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    ) : (
                      <Footprints className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#151c27]">
                        {step.instruction}
                      </h4>
                      <span className="text-xs font-mono font-bold text-gray-500 shrink-0 ml-2">
                        {step.durationMinutes} min
                      </span>
                    </div>

                    {step.detail && (
                      <p className="text-xs text-gray-600 mt-1 font-normal">
                        {step.detail}
                      </p>
                    )}

                    {/* Optimal Car/Door badge */}
                    {step.carRecommendation && (
                      <div className="mt-2.5 flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] text-emerald-800 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Fast-Exit Coach: <strong>{step.carRecommendation}</strong></span>
                      </div>
                    )}

                    {/* Intermediary stops expander */}
                    {step.stops && step.stops.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200/70">
                        <button
                          onClick={() => setExpandedStopsStepId(isExpanded ? null : step.id)}
                          className="text-[11px] font-bold text-gray-600 hover:text-gray-900 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{step.stopCount || step.stops.length} intermediate stops</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 pl-2 border-l-2 border-dashed border-gray-300 space-y-1 text-xs text-gray-600">
                            {step.stops.map((stopName, sIdx) => (
                              <div key={`${step.id}-stop-${sIdx}`} className="py-0.5">
                                • {stopName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
