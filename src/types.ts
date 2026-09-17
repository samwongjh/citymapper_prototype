export type LineId = 'NS' | 'EW' | 'NE' | 'CC' | 'DT' | 'TE';

export interface TransitLine {
  id: LineId;
  name: string;
  code: string;
  color: string;
  textColor: string;
  status: 'normal' | 'delay' | 'disruption';
  statusMessage?: string;
  peakHeadwayMin: number;
  offPeakHeadwayMin: number;
  stationsCount: number;
  openedYear: number;
}

export interface StationAmenity {
  type: 'lift' | 'restroom' | 'atm' | 'bicycle' | 'nursing' | 'topup' | 'passenger_service';
  label: string;
  location?: string;
}

export interface StationExit {
  exitCode: string;
  destinations: string[];
  hasLift: boolean;
  busInterchange?: boolean;
}

export interface TransitStation {
  id: string;
  name: string;
  codes: string[]; // e.g. ['NS24', 'NE6', 'CC1']
  lines: LineId[];
  x: number; // SVG map coordinates
  y: number;
  zone: string;
  exits: StationExit[];
  amenities: StationAmenity[];
  firstTrain: { northOrEast: string; southOrWest: string };
  lastTrain: { northOrEast: string; southOrWest: string };
  isInterchange?: boolean;
}

export interface JourneyStep {
  id: string;
  type: 'walk' | 'train' | 'bus' | 'transfer';
  instruction: string;
  detail?: string;
  lineId?: LineId;
  lineCode?: string;
  direction?: string;
  platform?: string;
  carRecommendation?: string; // e.g., "Car 3, Door 2"
  durationMinutes: number;
  distanceMeters?: number;
  stopCount?: number;
  stops?: string[];
  crowdLevel?: 'low' | 'moderate' | 'high';
}

export interface RouteOption {
  id: string;
  title: string;
  badgeText?: string;
  durationMinutes: number;
  fareSGD: number;
  transfers: number;
  walkingMeters: number;
  co2SavedKg: number;
  departureTime: string;
  arrivalTime: string;
  overallCrowd: 'low' | 'moderate' | 'high';
  linesUsed: LineId[];
  steps: JourneyStep[];
}

export interface LiveDeparture {
  id: string;
  stationId: string;
  lineId: LineId;
  platform: string;
  destination: string;
  minUntilNext: number;
  minUntilSubsequent: number;
  carCrowdLevels: ('low' | 'moderate' | 'high')[];
  trainLength: number; // e.g., 6 cars
}

export interface ServiceAlert {
  id: string;
  lineId: LineId | 'ALL';
  severity: 'disruption' | 'delay' | 'warning' | 'info';
  title: string;
  description: string;
  timeAgo: string;
  affectedStations?: string[];
  freeBridgingBus: boolean;
  busShuttlePoints?: string;
}

export interface LiveTrain {
  id: string;
  lineId: LineId;
  fromStationId: string;
  toStationId: string;
  progress: number; // 0 to 1
  carCount: number;
  crowdLevel: 'low' | 'moderate' | 'high';
}
