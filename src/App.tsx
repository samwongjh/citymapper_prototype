import React, { useState } from 'react';
import { Header } from './components/Header';
import { TripPlanner } from './components/TripPlanner';
import { TransitMap } from './components/TransitMap';
import { LiveDepartures } from './components/LiveDepartures';
import { ServiceAlerts } from './components/ServiceAlerts';
import { StationDirectory } from './components/StationDirectory';
import { FeedbackFooter } from './components/FeedbackFooter';
import { TRANSIT_STATIONS } from './data/transitData';
import { TransitStation, RouteOption, LineId } from './types';
import { 
  Navigation, 
  Layers, 
  Radio, 
  AlertTriangle, 
  Info,
  Maximize2,
  Minimize2,
  Sliders,
  CheckCircle2,
  MapPin
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'departures' | 'alerts' | 'directory'>('planner');
  
  // Origin & Destination state
  const [originStation, setOriginStation] = useState<TransitStation>(
    TRANSIT_STATIONS.find(s => s.id === 'orchard') || TRANSIT_STATIONS[6]
  );
  const [destinationStation, setDestinationStation] = useState<TransitStation>(
    TRANSIT_STATIONS.find(s => s.id === 'bayfront') || TRANSIT_STATIONS[11]
  );

  // Map state
  const [selectedStationOnMap, setSelectedStationOnMap] = useState<TransitStation | null>(null);
  const [highlightedLineIds, setHighlightedLineIds] = useState<LineId[]>(['NS', 'DT']);
  const [highlightedStationIds, setHighlightedStationIds] = useState<string[]>(['orchard', 'dhoby_ghaut', 'bayfront']);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);

  // Handle route selection in Trip Planner
  const handleSelectRouteForMap = (route: RouteOption) => {
    setHighlightedLineIds(route.linesUsed);
    const stationIds = [originStation.id, destinationStation.id];
    route.steps.forEach(s => {
      if (s.stops) {
        // Collect station IDs if matches exist
        TRANSIT_STATIONS.forEach(stn => {
          if (s.stops?.includes(stn.name)) {
            stationIds.push(stn.id);
          }
        });
      }
    });
    setHighlightedStationIds(Array.from(new Set(stationIds)));
  };

  const handleSetOriginFromMap = (station: TransitStation) => {
    setOriginStation(station);
    setSelectedStationOnMap(null);
    setActiveTab('planner');
  };

  const handleSetDestinationFromMap = (station: TransitStation) => {
    setDestinationStation(station);
    setSelectedStationOnMap(null);
    setActiveTab('planner');
  };

  const handleViewDeparturesFromStation = (station: TransitStation) => {
    setSelectedStationOnMap(station);
    setActiveTab('departures');
  };

  return (
    <div id="urban-transit-app" className="min-h-screen flex flex-col bg-[#f9f9ff] text-[#151c27]">
      {/* Universal Transit Navigation Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 pb-20 md:pb-6">
        {/* VIEW 1: ROUTE PLANNER (Split-Screen on Desktop, Stacked on Mobile) */}
        {activeTab === 'planner' && (
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Side: Route Form & Results */}
            <div className={`w-full ${isMapExpanded ? 'hidden lg:block lg:w-1/3' : 'lg:w-1/2'} transition-all`}>
              <TripPlanner
                origin={originStation}
                destination={destinationStation}
                onChangeOrigin={(stn) => {
                  setOriginStation(stn);
                  setHighlightedStationIds([stn.id, destinationStation.id]);
                }}
                onChangeDestination={(stn) => {
                  setDestinationStation(stn);
                  setHighlightedStationIds([originStation.id, stn.id]);
                }}
                onSelectRouteForMap={handleSelectRouteForMap}
              />
            </div>

            {/* Right Side: Interactive Live Transit Map */}
            <div className={`w-full ${isMapExpanded ? 'lg:w-full' : 'lg:w-1/2'} h-[500px] lg:h-[760px] sticky top-20`}>
              <div className="relative w-full h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                      Interactive Schematic Map
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <button
                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                    className="hidden lg:flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    {isMapExpanded ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Split View</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Expand Map</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 h-full min-h-[460px]">
                  <TransitMap
                    selectedStation={selectedStationOnMap}
                    onSelectStation={setSelectedStationOnMap}
                    onSetOrigin={handleSetOriginFromMap}
                    onSetDestination={handleSetDestinationFromMap}
                    onViewDepartures={handleViewDeparturesFromStation}
                    highlightedLineIds={highlightedLineIds}
                    highlightedStationIds={highlightedStationIds}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: LIVE DEPARTURES PID BOARD */}
        {activeTab === 'departures' && (
          <div className="max-w-4xl mx-auto">
            <LiveDepartures 
              currentStation={selectedStationOnMap || originStation}
              onSelectStation={(stn) => setSelectedStationOnMap(stn)}
            />
          </div>
        )}

        {/* VIEW 3: SERVICE ALERTS & LINE STATUS */}
        {activeTab === 'alerts' && (
          <div className="max-w-5xl mx-auto">
            <ServiceAlerts />
          </div>
        )}

        {/* VIEW 4: STATION GUIDE & FARE CALCULATOR */}
        {activeTab === 'directory' && (
          <div className="max-w-6xl mx-auto">
            <StationDirectory
              onSelectStationForMap={(stn) => {
                setSelectedStationOnMap(stn);
                setHighlightedStationIds([stn.id]);
                setHighlightedLineIds(stn.lines);
                setActiveTab('planner');
              }}
              onPlanTripFromStation={(stn) => {
                setOriginStation(stn);
                setActiveTab('planner');
              }}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex flex-col items-center justify-center text-[10px] font-bold p-1 transition-colors cursor-pointer ${
            activeTab === 'planner' ? 'text-[#006d3e]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Navigation className="w-5 h-5 mb-0.5" />
          <span>Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('departures')}
          className={`flex flex-col items-center justify-center text-[10px] font-bold p-1 transition-colors cursor-pointer ${
            activeTab === 'departures' ? 'text-[#006d3e]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Radio className="w-5 h-5 mb-0.5" />
          <span>Departures</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center justify-center text-[10px] font-bold p-1 transition-colors cursor-pointer relative ${
            activeTab === 'alerts' ? 'text-[#006d3e]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <AlertTriangle className="w-5 h-5 mb-0.5" />
          <span>Status</span>
          <span className="w-2 h-2 rounded-full bg-[#f59e0b] absolute top-1 right-2" />
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center justify-center text-[10px] font-bold p-1 transition-colors cursor-pointer ${
            activeTab === 'directory' ? 'text-[#006d3e]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Info className="w-5 h-5 mb-0.5" />
          <span>Guide</span>
        </button>
      </div>

      {/* Disqus Feedback & Community Discussions Footer */}
      <FeedbackFooter currentTab={activeTab} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Singapore MRT Transit Navigator</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Live Telemetry</span>
          </div>
          <p className="text-[11px] text-gray-500 max-w-3xl leading-relaxed">
            Contains information from LTA DataMall and data.gov.sg, accessed{' '}
            {new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            , made available under the terms of the Singapore Open Data Licence version 1.0.
          </p>
        </div>
      </footer>
    </div>
  );
}
