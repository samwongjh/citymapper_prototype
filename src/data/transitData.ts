import { TransitLine, TransitStation, RouteOption, LiveDeparture, ServiceAlert, LineId } from '../types';

export const TRANSIT_LINES: TransitLine[] = [
  {
    id: 'NS',
    code: 'NS',
    name: 'North-South Line',
    color: '#D42E12',
    textColor: '#ffffff',
    status: 'normal',
    statusMessage: 'Normal service frequency 2–3 mins',
    peakHeadwayMin: 2,
    offPeakHeadwayMin: 4,
    stationsCount: 27,
    openedYear: 1987,
  },
  {
    id: 'EW',
    code: 'EW',
    name: 'East-West Line',
    color: '#009530',
    textColor: '#ffffff',
    status: 'normal',
    statusMessage: 'Normal service frequency 2–3 mins',
    peakHeadwayMin: 2,
    offPeakHeadwayMin: 5,
    stationsCount: 35,
    openedYear: 1987,
  },
  {
    id: 'NE',
    code: 'NE',
    name: 'North-East Line',
    color: '#9016B2',
    textColor: '#ffffff',
    status: 'normal',
    statusMessage: 'Normal service frequency 3 mins',
    peakHeadwayMin: 3,
    offPeakHeadwayMin: 5,
    stationsCount: 16,
    openedYear: 2003,
  },
  {
    id: 'CC',
    code: 'CC',
    name: 'Circle Line',
    color: '#FA9E0D',
    textColor: '#151c27',
    status: 'delay',
    statusMessage: 'Track inspection near Botanic Gardens (+6 mins)',
    peakHeadwayMin: 3.5,
    offPeakHeadwayMin: 6,
    stationsCount: 30,
    openedYear: 2009,
  },
  {
    id: 'DT',
    code: 'DT',
    name: 'Downtown Line',
    color: '#005EC4',
    textColor: '#ffffff',
    status: 'normal',
    statusMessage: 'Normal service frequency 3 mins',
    peakHeadwayMin: 2.5,
    offPeakHeadwayMin: 4.5,
    stationsCount: 34,
    openedYear: 2013,
  },
  {
    id: 'TE',
    code: 'TE',
    name: 'Thomson-East Coast Line',
    color: '#9D5B25',
    textColor: '#ffffff',
    status: 'normal',
    statusMessage: 'Normal service frequency 4 mins',
    peakHeadwayMin: 3,
    offPeakHeadwayMin: 5,
    stationsCount: 27,
    openedYear: 2020,
  },
];

export const TRANSIT_STATIONS: TransitStation[] = [
  {
    id: 'jurong_east',
    name: 'Jurong East',
    codes: ['NS1', 'EW24'],
    lines: ['NS', 'EW'],
    x: 180,
    y: 380,
    zone: 'West Region',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['Westgate', 'Ng Teng Fong General Hospital', 'Jurong East Bus Interchange'], hasLift: true, busInterchange: true },
      { exitCode: 'Exit B', destinations: ['Jem Shopping Mall', 'Perennial Business City'], hasLift: true },
      { exitCode: 'Exit C', destinations: ['IMM Building via J-Walk bridge'], hasLift: false },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Passenger Service Centre (Concourse Level)' },
      { type: 'lift', label: 'Wide-berth Wheelchair Elevators' },
      { type: 'restroom', label: 'Restrooms at Paid Area Concourse' },
      { type: 'atm', label: 'DBS/POSB, OCBC, UOB ATMs' },
      { type: 'bicycle', label: '140 Bicycle Parking Racks' },
      { type: 'nursing', label: 'Baby Care Room (Near Exit A)' },
    ],
    firstTrain: { northOrEast: '05:16 AM', southOrWest: '05:42 AM' },
    lastTrain: { northOrEast: '11:45 PM', southOrWest: '00:18 AM' },
  },
  {
    id: 'clementi',
    name: 'Clementi',
    codes: ['EW23'],
    lines: ['EW'],
    x: 270,
    y: 410,
    zone: 'West Region',
    isInterchange: false,
    exits: [
      { exitCode: 'Exit A', destinations: ['The Clementi Mall', 'Clementi Bus Interchange'], hasLift: true, busInterchange: true },
      { exitCode: 'Exit B', destinations: ['Commonwealth Avenue West', 'Clementi Town Secondary'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Station Control' },
      { type: 'lift', label: 'Platform to Concourse Lift' },
      { type: 'restroom', label: 'Unpaid Area Toilet' },
      { type: 'atm', label: 'POSB ATM' },
    ],
    firstTrain: { northOrEast: '05:22 AM', southOrWest: '05:54 AM' },
    lastTrain: { northOrEast: '11:51 PM', southOrWest: '00:24 AM' },
  },
  {
    id: 'buona_vista',
    name: 'Buona Vista',
    codes: ['EW21', 'CC22'],
    lines: ['EW', 'CC'],
    x: 350,
    y: 430,
    zone: 'South-West',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['The Star Vista', 'Rochester Mall'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['Metropolis', 'One-North Bio-hub shuttle'], hasLift: true },
      { exitCode: 'Exit C', destinations: ['Civil Service College', 'Ministry of Education'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Concourse Info' },
      { type: 'lift', label: 'Elevators all platforms' },
      { type: 'restroom', label: 'Wheelchair Accessible Toilet' },
      { type: 'bicycle', label: 'Sheltered Bike Station' },
    ],
    firstTrain: { northOrEast: '05:28 AM', southOrWest: '06:02 AM' },
    lastTrain: { northOrEast: '11:58 PM', southOrWest: '00:31 AM' },
  },
  {
    id: 'woodlands',
    name: 'Woodlands',
    codes: ['NS9', 'TE2'],
    lines: ['NS', 'TE'],
    x: 380,
    y: 110,
    zone: 'North Region',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit 1', destinations: ['Causeway Point', 'Woodlands Civic Centre'], hasLift: true },
      { exitCode: 'Exit 2', destinations: ['Woodlands Integrated Transport Hub'], hasLift: true, busInterchange: true },
      { exitCode: 'Exit 3', destinations: ['Woodlands Avenue 3', 'Republic Polytechnic'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Woodlands Passenger Centre' },
      { type: 'lift', label: 'Direct Underpass Lift' },
      { type: 'restroom', label: 'Modern Smart Restrooms' },
      { type: 'topup', label: 'SimplyGo Ticketing Kiosks' },
    ],
    firstTrain: { northOrEast: '05:27 AM', southOrWest: '05:48 AM' },
    lastTrain: { northOrEast: '11:32 PM', southOrWest: '00:15 AM' },
  },
  {
    id: 'bishan',
    name: 'Bishan',
    codes: ['NS17', 'CC15'],
    lines: ['NS', 'CC'],
    x: 470,
    y: 280,
    zone: 'Central Region',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['Junction 8 Shopping Centre'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['Bishan Bus Interchange', 'Bishan Community Club'], hasLift: true, busInterchange: true },
      { exitCode: 'Exit C', destinations: ['Bishan-Ang Mo Kio Park'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Interchange Passenger Service' },
      { type: 'lift', label: 'Elevators to NSL and CCL' },
      { type: 'restroom', label: 'Clean Restroom Facilities' },
      { type: 'atm', label: 'Multiple Bank ATMs' },
      { type: 'bicycle', label: 'Bike Parks A & B' },
    ],
    firstTrain: { northOrEast: '05:43 AM', southOrWest: '05:32 AM' },
    lastTrain: { northOrEast: '00:08 AM', southOrWest: '00:22 AM' },
  },
  {
    id: 'botanic_gardens',
    name: 'Botanic Gardens',
    codes: ['CC19', 'DT9'],
    lines: ['CC', 'DT'],
    x: 430,
    y: 360,
    zone: 'Central Region',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['Singapore Botanic Gardens (UNESCO Heritage Site)', 'Bukit Timah Gate'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['NUS Bukit Timah Campus', 'Cluny Court'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Eco-Station Hub' },
      { type: 'lift', label: 'Full Access High-Speed Elevators' },
      { type: 'restroom', label: 'Green Restrooms' },
      { type: 'bicycle', label: 'Heritage Trail Bike Lockers' },
    ],
    firstTrain: { northOrEast: '05:40 AM', southOrWest: '05:58 AM' },
    lastTrain: { northOrEast: '11:49 PM', southOrWest: '00:26 AM' },
  },
  {
    id: 'orchard',
    name: 'Orchard',
    codes: ['NS22', 'TE14'],
    lines: ['NS', 'TE'],
    x: 490,
    y: 430,
    zone: 'Downtown / Retail',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit 1', destinations: ['ION Orchard', 'Wheelock Place', 'Wisma Atria'], hasLift: true },
      { exitCode: 'Exit 2', destinations: ['Tang Plaza', 'Shaw House', 'Scotts Square'], hasLift: true },
      { exitCode: 'Exit 3', destinations: ['Ngee Ann City (Takashimaya)', 'Orchard Boulevard'], hasLift: true },
      { exitCode: 'Exit 4', destinations: ['Orchard Turn Pedestrian Underpass'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Premium Tourist & Transit Helpdesk' },
      { type: 'lift', label: 'Direct Underpass Elevator to ION' },
      { type: 'restroom', label: 'Restrooms Paid & Unpaid Concourses' },
      { type: 'nursing', label: 'Mother & Child Care Sanctuary' },
      { type: 'topup', label: 'SimplyGo & Tourist Pass Kiosks' },
    ],
    firstTrain: { northOrEast: '05:52 AM', southOrWest: '05:38 AM' },
    lastTrain: { northOrEast: '00:11 AM', southOrWest: '00:29 AM' },
  },
  {
    id: 'dhoby_ghaut',
    name: 'Dhoby Ghaut',
    codes: ['NS24', 'NE6', 'CC1'],
    lines: ['NS', 'NE', 'CC'],
    x: 550,
    y: 450,
    zone: 'Central Inter-Hub',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['Plaza Singapura Shopping Centre', 'The Cathay'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['Istana Park', 'MacDonald House'], hasLift: true },
      { exitCode: 'Exit C', destinations: ['SMU School of Social Sciences', 'Fort Canning Park'], hasLift: true },
      { exitCode: 'Exit E', destinations: ['Plaza Singapura Extension Underpass'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Central Inter-Line Service Command' },
      { type: 'lift', label: 'Travelators and Multi-Level Elevators' },
      { type: 'restroom', label: '3 Concourse Restroom Zones' },
      { type: 'atm', label: 'Full Banking Row' },
      { type: 'nursing', label: 'Baby Feeding Cabin' },
    ],
    firstTrain: { northOrEast: '05:50 AM', southOrWest: '05:35 AM' },
    lastTrain: { northOrEast: '00:15 AM', southOrWest: '00:32 AM' },
  },
  {
    id: 'bugis',
    name: 'Bugis',
    codes: ['EW12', 'DT14'],
    lines: ['EW', 'DT'],
    x: 620,
    y: 440,
    zone: 'Cultural / Commercial',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['Bugis Village', 'Queen Street Bus Terminal'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['Raffles Hospital', 'Victoria Street'], hasLift: true },
      { exitCode: 'Exit C', destinations: ['Bugis Junction Mall & InterContinental Hotel'], hasLift: true },
      { exitCode: 'Exit D', destinations: ['DUO Galleria', 'Andaz Singapore'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Bugis Station Control' },
      { type: 'lift', label: 'Direct Platform Transfer Lift' },
      { type: 'restroom', label: 'Paid Area Toilets' },
      { type: 'atm', label: 'Local & International ATM Hub' },
    ],
    firstTrain: { northOrEast: '05:54 AM', southOrWest: '05:40 AM' },
    lastTrain: { northOrEast: '00:19 AM', southOrWest: '00:35 AM' },
  },
  {
    id: 'city_hall',
    name: 'City Hall',
    codes: ['NS25', 'EW13'],
    lines: ['NS', 'EW'],
    x: 580,
    y: 490,
    zone: 'Civic District',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['National Gallery Singapore', 'St Andrew\'s Cathedral'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['Raffles City Shopping Centre', 'Swissotel The Stamford'], hasLift: true },
      { exitCode: 'Exit C', destinations: ['Capitol Piazza', 'Peninsula Plaza'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'City Hall Passenger Centre' },
      { type: 'lift', label: 'Cross-Platform Transfer Facilitator' },
      { type: 'restroom', label: 'Concourse Restrooms' },
      { type: 'topup', label: 'SimplyGo Top-Up' },
    ],
    firstTrain: { northOrEast: '05:55 AM', southOrWest: '05:33 AM' },
    lastTrain: { northOrEast: '00:18 AM', southOrWest: '00:36 AM' },
  },
  {
    id: 'raffles_place',
    name: 'Raffles Place',
    codes: ['NS26', 'EW14'],
    lines: ['NS', 'EW'],
    x: 590,
    y: 530,
    zone: 'Financial District (CBD)',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['One Raffles Place', 'UOB Plaza', 'Singapore River'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['Republic Plaza', 'OCBC Centre', 'Battery Road'], hasLift: true },
      { exitCode: 'Exit G', destinations: ['Ocean Financial Centre', 'Marina Bay Link Mall'], hasLift: true },
      { exitCode: 'Exit H', destinations: ['Fullerton Hotel', 'Victoria Theatre'], hasLift: false },
    ],
    amenities: [
      { type: 'passenger_service', label: 'CBD Executive Transit Service Hub' },
      { type: 'lift', label: 'High-Capacity Commuter Lifts' },
      { type: 'restroom', label: 'Restroom Suites Concourse' },
      { type: 'atm', label: 'Major Commercial Bank ATMs' },
    ],
    firstTrain: { northOrEast: '05:57 AM', southOrWest: '05:30 AM' },
    lastTrain: { northOrEast: '00:21 AM', southOrWest: '00:39 AM' },
  },
  {
    id: 'bayfront',
    name: 'Bayfront',
    codes: ['CE1', 'DT16'],
    lines: ['CC', 'DT'],
    x: 660,
    y: 540,
    zone: 'Marina Bay Waterfront',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit B', destinations: ['Gardens by the Bay (Supertrees & Domes)'], hasLift: true },
      { exitCode: 'Exit C', destinations: ['The Shoppes at Marina Bay Sands'], hasLift: true },
      { exitCode: 'Exit D', destinations: ['Sands Expo & Convention Centre'], hasLift: true },
      { exitCode: 'Exit E', destinations: ['ArtScience Museum', 'Helix Bridge'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Marina Tourist Centre' },
      { type: 'lift', label: 'Step-Free Tourist Elevators' },
      { type: 'restroom', label: 'Modern Spacious Restrooms' },
      { type: 'bicycle', label: 'Bayfront Loop Bike Hub' },
    ],
    firstTrain: { northOrEast: '06:02 AM', southOrWest: '05:44 AM' },
    lastTrain: { northOrEast: '00:25 AM', southOrWest: '00:44 AM' },
  },
  {
    id: 'marina_bay',
    name: 'Marina Bay',
    codes: ['NS27', 'CC1', 'TE20'],
    lines: ['NS', 'CC', 'TE'],
    x: 610,
    y: 580,
    zone: 'Marina South',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit 1', destinations: ['Marina Bay Financial Centre (MBFC)', 'Marina One'], hasLift: true },
      { exitCode: 'Exit 2', destinations: ['Central Boulevard', 'Marina Bay Suites'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Triple-Interchange Command' },
      { type: 'lift', label: 'Barrier-Free Underground Spines' },
      { type: 'restroom', label: 'Fully Accessible Restrooms' },
    ],
    firstTrain: { northOrEast: '06:01 AM', southOrWest: '05:36 AM' },
    lastTrain: { northOrEast: '00:24 AM', southOrWest: '00:40 AM' },
  },
  {
    id: 'harbourfront',
    name: 'HarbourFront',
    codes: ['NE1', 'CC29'],
    lines: ['NE', 'CC'],
    x: 440,
    y: 590,
    zone: 'Southern Waterfront',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['Telok Blangah Road', 'Bus Terminal'], hasLift: true, busInterchange: true },
      { exitCode: 'Exit B', destinations: ['HarbourFront Centre', 'Singapore Cruise Centre'], hasLift: true },
      { exitCode: 'Exit C', destinations: ['VivoCity Mall', 'Sentosa Express Monorail'], hasLift: true },
      { exitCode: 'Exit D', destinations: ['Singapore Cable Car to Mount Faber & Sentosa'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Harbour Cruise & Rail Helpdesk' },
      { type: 'lift', label: 'Direct VivoCity Lift Link' },
      { type: 'restroom', label: 'High-Volume Restrooms' },
      { type: 'nursing', label: 'Parent & Child Facilities' },
    ],
    firstTrain: { northOrEast: '05:30 AM', southOrWest: '05:30 AM' },
    lastTrain: { northOrEast: '11:50 PM', southOrWest: '11:50 PM' },
  },
  {
    id: 'paya_lebar',
    name: 'Paya Lebar',
    codes: ['EW8', 'CC9'],
    lines: ['EW', 'CC'],
    x: 740,
    y: 410,
    zone: 'East Hub',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['Paya Lebar Square', 'SingPost Centre'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['PLQ Mall (Paya Lebar Quarter)'], hasLift: true },
      { exitCode: 'Exit C', destinations: ['Geylang Serai Market', 'Tanjong Katong Complex'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Dual Concourse Helpdesk' },
      { type: 'lift', label: 'Sky-bridge and Underpass Lifts' },
      { type: 'restroom', label: 'Restrooms Paid Areas' },
      { type: 'bicycle', label: '200+ Sheltered Bike Slots' },
    ],
    firstTrain: { northOrEast: '05:44 AM', southOrWest: '05:48 AM' },
    lastTrain: { northOrEast: '00:10 AM', southOrWest: '00:26 AM' },
  },
  {
    id: 'changi_airport',
    name: 'Changi Airport',
    codes: ['CG2'],
    lines: ['EW'],
    x: 920,
    y: 380,
    zone: 'East / Aviation Gateway',
    isInterchange: false,
    exits: [
      { exitCode: 'Exit A', destinations: ['Changi Terminal 2', 'Jewel Changi Airport Link'], hasLift: true },
      { exitCode: 'Exit B', destinations: ['Changi Terminal 3', 'Skytrain to Terminal 1'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Changi Airport SMRT Tourist Concierge' },
      { type: 'lift', label: 'Luggage Trolley Compatible High-Capacity Lifts' },
      { type: 'restroom', label: 'World-Class Accessible Restrooms' },
      { type: 'atm', label: 'Foreign Currency & Multi-Currency ATMs' },
      { type: 'nursing', label: 'Full Baby Sanctuary' },
    ],
    firstTrain: { northOrEast: '05:31 AM', southOrWest: '05:31 AM' },
    lastTrain: { northOrEast: '00:06 AM', southOrWest: '00:06 AM' },
  },
  {
    id: 'serangoon',
    name: 'Serangoon',
    codes: ['NE12', 'CC13'],
    lines: ['NE', 'CC'],
    x: 600,
    y: 290,
    zone: 'North-East',
    isInterchange: true,
    exits: [
      { exitCode: 'Exit A', destinations: ['Serangoon Central', 'Bus Interchange'], hasLift: true, busInterchange: true },
      { exitCode: 'Exit B', destinations: ['NEX Mega Shopping Mall', 'Upper Serangoon Road'], hasLift: true },
    ],
    amenities: [
      { type: 'passenger_service', label: 'Underground Concourse Control' },
      { type: 'lift', label: 'Direct NEX Mall Elevators' },
      { type: 'restroom', label: 'Wheelchair Friendly Restrooms' },
    ],
    firstTrain: { northOrEast: '05:48 AM', southOrWest: '05:42 AM' },
    lastTrain: { northOrEast: '00:05 AM', southOrWest: '00:21 AM' },
  },
];

// SVG Network lines connecting the stations for realistic schematic visualization
export const NETWORK_TRACKS = [
  // NS Line (Red): Jurong East -> Woodlands -> Bishan -> Orchard -> Dhoby Ghaut -> City Hall -> Raffles Place -> Marina Bay
  {
    lineId: 'NS' as LineId,
    color: '#D42E12',
    path: 'M 180 380 Q 220 220 380 110 T 470 280 L 490 430 L 550 450 L 580 490 L 590 530 L 610 580',
    stationIds: ['jurong_east', 'woodlands', 'bishan', 'orchard', 'dhoby_ghaut', 'city_hall', 'raffles_place', 'marina_bay'],
  },
  // EW Line (Green): Jurong East -> Clementi -> Buona Vista -> City Hall -> Raffles Place -> Bugis -> Paya Lebar -> Changi Airport
  {
    lineId: 'EW' as LineId,
    color: '#009530',
    path: 'M 180 380 L 270 410 L 350 430 Q 460 480 580 490 L 590 530 Q 605 480 620 440 L 740 410 L 920 380',
    stationIds: ['jurong_east', 'clementi', 'buona_vista', 'city_hall', 'raffles_place', 'bugis', 'paya_lebar', 'changi_airport'],
  },
  // CC Line (Orange): Dhoby Ghaut -> Serangoon -> Bishan -> Botanic Gardens -> Buona Vista -> HarbourFront -> Marina Bay -> Bayfront
  {
    lineId: 'CC' as LineId,
    color: '#FA9E0D',
    path: 'M 550 450 Q 610 370 600 290 L 470 280 L 430 360 L 350 430 Q 380 560 440 590 Q 520 620 610 580 L 660 540',
    stationIds: ['dhoby_ghaut', 'serangoon', 'bishan', 'botanic_gardens', 'buona_vista', 'harbourfront', 'marina_bay', 'bayfront'],
  },
  // DT Line (Blue): Botanic Gardens -> Bugis -> Bayfront
  {
    lineId: 'DT' as LineId,
    color: '#005EC4',
    path: 'M 430 360 Q 520 400 620 440 L 660 540',
    stationIds: ['botanic_gardens', 'bugis', 'bayfront'],
  },
  // NE Line (Purple): HarbourFront -> Dhoby Ghaut -> Serangoon
  {
    lineId: 'NE' as LineId,
    color: '#9016B2',
    path: 'M 440 590 Q 480 510 550 450 L 600 290',
    stationIds: ['harbourfront', 'dhoby_ghaut', 'serangoon'],
  },
  // TE Line (Brown): Woodlands -> Orchard -> Marina Bay
  {
    lineId: 'TE' as LineId,
    color: '#9D5B25',
    path: 'M 380 110 Q 440 260 490 430 L 610 580',
    stationIds: ['woodlands', 'orchard', 'marina_bay'],
  },
];

export const LIVE_DEPARTURES: Record<string, LiveDeparture[]> = {
  dhoby_ghaut: [
    {
      id: 'dg-1',
      stationId: 'dhoby_ghaut',
      lineId: 'NS',
      platform: 'Platform A',
      destination: 'Marina South Pier',
      minUntilNext: 1,
      minUntilSubsequent: 4,
      carCrowdLevels: ['moderate', 'high', 'high', 'moderate', 'low', 'low'],
      trainLength: 6,
    },
    {
      id: 'dg-2',
      stationId: 'dhoby_ghaut',
      lineId: 'NS',
      platform: 'Platform B',
      destination: 'Jurong East via Woodlands',
      minUntilNext: 3,
      minUntilSubsequent: 7,
      carCrowdLevels: ['low', 'moderate', 'moderate', 'moderate', 'low', 'low'],
      trainLength: 6,
    },
    {
      id: 'dg-3',
      stationId: 'dhoby_ghaut',
      lineId: 'NE',
      platform: 'Platform C',
      destination: 'Punggol Coast',
      minUntilNext: 2,
      minUntilSubsequent: 5,
      carCrowdLevels: ['moderate', 'moderate', 'high', 'moderate', 'low', 'low'],
      trainLength: 6,
    },
    {
      id: 'dg-4',
      stationId: 'dhoby_ghaut',
      lineId: 'CC',
      platform: 'Platform D',
      destination: 'HarbourFront via Bishan',
      minUntilNext: 5,
      minUntilSubsequent: 9,
      carCrowdLevels: ['high', 'high', 'moderate'],
      trainLength: 3,
    },
  ],
  orchard: [
    {
      id: 'orc-1',
      stationId: 'orchard',
      lineId: 'NS',
      platform: 'Platform A',
      destination: 'Marina South Pier',
      minUntilNext: 2,
      minUntilSubsequent: 5,
      carCrowdLevels: ['high', 'high', 'high', 'moderate', 'low', 'low'],
      trainLength: 6,
    },
    {
      id: 'orc-2',
      stationId: 'orchard',
      lineId: 'TE',
      platform: 'Platform 3',
      destination: 'Bayshore via Maxwell',
      minUntilNext: 3,
      minUntilSubsequent: 8,
      carCrowdLevels: ['low', 'low', 'moderate', 'low'],
      trainLength: 4,
    },
  ],
  raffles_place: [
    {
      id: 'rp-1',
      stationId: 'raffles_place',
      lineId: 'EW',
      platform: 'Platform A (Cross-platform)',
      destination: 'Pasir Ris / Changi Airport',
      minUntilNext: 1,
      minUntilSubsequent: 3,
      carCrowdLevels: ['high', 'high', 'high', 'moderate', 'moderate', 'low'],
      trainLength: 6,
    },
    {
      id: 'rp-2',
      stationId: 'raffles_place',
      lineId: 'NS',
      platform: 'Platform B',
      destination: 'Jurong East via Bishan',
      minUntilNext: 2,
      minUntilSubsequent: 5,
      carCrowdLevels: ['moderate', 'high', 'moderate', 'low', 'low', 'low'],
      trainLength: 6,
    },
  ],
  bayfront: [
    {
      id: 'bf-1',
      stationId: 'bayfront',
      lineId: 'DT',
      platform: 'Platform A',
      destination: 'Bukit Panjang via Bugis',
      minUntilNext: 2,
      minUntilSubsequent: 6,
      carCrowdLevels: ['low', 'moderate', 'moderate'],
      trainLength: 3,
    },
    {
      id: 'bf-2',
      stationId: 'bayfront',
      lineId: 'CC',
      platform: 'Platform B',
      destination: 'Dhoby Ghaut / Marina Bay',
      minUntilNext: 4,
      minUntilSubsequent: 9,
      carCrowdLevels: ['low', 'low', 'low'],
      trainLength: 3,
    },
  ],
  jurong_east: [
    {
      id: 'je-1',
      stationId: 'jurong_east',
      lineId: 'EW',
      platform: 'Platform A',
      destination: 'Pasir Ris via Raffles Place',
      minUntilNext: 1,
      minUntilSubsequent: 4,
      carCrowdLevels: ['high', 'high', 'high', 'moderate', 'moderate', 'low'],
      trainLength: 6,
    },
    {
      id: 'je-2',
      stationId: 'jurong_east',
      lineId: 'NS',
      platform: 'Platform C',
      destination: 'Marina South Pier via Woodlands',
      minUntilNext: 3,
      minUntilSubsequent: 7,
      carCrowdLevels: ['moderate', 'moderate', 'low', 'low', 'low', 'low'],
      trainLength: 6,
    },
  ],
  changi_airport: [
    {
      id: 'ca-1',
      stationId: 'changi_airport',
      lineId: 'EW',
      platform: 'Platform 1',
      destination: 'Tanah Merah (Transfer to City)',
      minUntilNext: 4,
      minUntilSubsequent: 11,
      carCrowdLevels: ['low', 'moderate', 'moderate', 'low', 'low', 'low'],
      trainLength: 6,
    },
  ],
};

export const SERVICE_ALERTS: ServiceAlert[] = [
  {
    id: 'alert-1',
    lineId: 'CC',
    severity: 'delay',
    title: 'Circle Line Track Maintenance Advisory',
    description: 'Specialist maintenance work near Botanic Gardens station. Trains are travelling at restricted speeds between Caldecott and Botanic Gardens. Please factor in an additional 6 to 8 minutes travel time.',
    timeAgo: '14 mins ago',
    affectedStations: ['Botanic Gardens', 'Farrer Road', 'Caldecott'],
    freeBridgingBus: false,
    busShuttlePoints: 'Regular bus services 48, 855, and 93 are accepting free MRT contactless card taps between affected stations.',
  },
  {
    id: 'alert-2',
    lineId: 'NS',
    severity: 'info',
    title: 'North-South Line Evening Peak Headways',
    description: 'Additional high-capacity 6-car trains deployed on the North-South Line between Marina Bay and Yishun. High-frequency 100-second dispatch enabled at City Hall and Raffles Place.',
    timeAgo: '28 mins ago',
    affectedStations: ['City Hall', 'Raffles Place', 'Dhoby Ghaut', 'Bishan'],
    freeBridgingBus: false,
  },
  {
    id: 'alert-3',
    lineId: 'DT',
    severity: 'info',
    title: 'Downtown Line Extended Weekend Night Schedule',
    description: 'Last train services will be extended by 30 minutes this upcoming Friday and Saturday for the Marina Bay Waterfront Festival.',
    timeAgo: '2 hours ago',
    freeBridgingBus: false,
  },
];

// Helper to generate dynamic routes between any origin & destination
export function getRouteOptions(originId: string, destId: string): RouteOption[] {
  const origin = TRANSIT_STATIONS.find(s => s.id === originId) || TRANSIT_STATIONS[6]; // Orchard
  const dest = TRANSIT_STATIONS.find(s => s.id === destId) || TRANSIT_STATIONS[11]; // Bayfront

  if (origin.id === dest.id) {
    return [];
  }

  // Calculate approximate distance & time
  const dx = dest.x - origin.x;
  const dy = dest.y - origin.y;
  const pixelDist = Math.sqrt(dx * dx + dy * dy);
  const approxDistanceKm = Math.max(1.8, Math.round((pixelDist / 25) * 10) / 10);
  
  // Base fare calculation standard Singapore LTA formula (~$1.09 base + distance increment)
  const baseFare = Math.min(2.45, Math.max(1.19, Math.round((1.09 + approxDistanceKm * 0.08) * 100) / 100));

  // Option 1: Fastest MRT (Express / Main lines)
  const opt1Duration = Math.max(12, Math.round(approxDistanceKm * 2.3 + 4));
  const opt1Steps = buildDynamicSteps(origin, dest, 'fastest');

  // Option 2: Minimum Transfer / Direct Route
  const opt2Duration = opt1Duration + 5;
  const opt2Steps = buildDynamicSteps(origin, dest, 'fewest_transfers');

  // Option 3: Scenic / Alternate Transit (Bus + MRT or Downtown connection)
  const opt3Duration = opt1Duration + 11;
  const opt3Steps = buildDynamicSteps(origin, dest, 'bus_mrt');

  return [
    {
      id: 'route-fastest',
      title: 'Fastest Transit Journey',
      badgeText: 'RECOMMENDED',
      durationMinutes: opt1Duration,
      fareSGD: baseFare,
      transfers: opt1Steps.filter(s => s.type === 'transfer').length,
      walkingMeters: 280,
      co2SavedKg: Math.round(approxDistanceKm * 0.14 * 10) / 10,
      departureTime: '10:42 PM',
      arrivalTime: '11:08 PM',
      overallCrowd: 'moderate',
      linesUsed: Array.from(new Set(opt1Steps.filter(s => s.lineId).map(s => s.lineId as LineId))),
      steps: opt1Steps,
    },
    {
      id: 'route-fewest-transfers',
      title: 'Least Transfers',
      badgeText: 'SEAMLESS',
      durationMinutes: opt2Duration,
      fareSGD: baseFare,
      transfers: Math.max(0, opt2Steps.filter(s => s.type === 'transfer').length - 1),
      walkingMeters: 190,
      co2SavedKg: Math.round(approxDistanceKm * 0.14 * 10) / 10,
      departureTime: '10:44 PM',
      arrivalTime: '11:15 PM',
      overallCrowd: 'low',
      linesUsed: Array.from(new Set(opt2Steps.filter(s => s.lineId).map(s => s.lineId as LineId))),
      steps: opt2Steps,
    },
    {
      id: 'route-bus-active',
      title: 'Multimodal (Bus + MRT)',
      badgeText: 'AIR-CON BUS LINK',
      durationMinutes: opt3Duration,
      fareSGD: Math.round((baseFare + 0.15) * 100) / 100,
      transfers: 1,
      walkingMeters: 360,
      co2SavedKg: Math.round(approxDistanceKm * 0.12 * 10) / 10,
      departureTime: '10:41 PM',
      arrivalTime: '11:18 PM',
      overallCrowd: 'low',
      linesUsed: [origin.lines[0]],
      steps: opt3Steps,
    },
  ];
}

function buildDynamicSteps(origin: TransitStation, dest: TransitStation, preference: string): any[] {
  const sharedLine = origin.lines.find(l => dest.lines.includes(l));
  
  if (sharedLine) {
    // Direct single-line journey
    return [
      {
        id: 's1',
        type: 'walk',
        instruction: `Walk to ${origin.name} Station (${origin.exits[0]?.exitCode || 'Exit A'})`,
        detail: 'Enter via fare gates using contactless card or SimplyGo',
        durationMinutes: 3,
        distanceMeters: 180,
      },
      {
        id: 's2',
        type: 'train',
        instruction: `Board ${getLineName(sharedLine)} toward ${dest.name}`,
        detail: `Board at Platform 1. Recommended: Car 3 Door 2 for direct exit escalators at ${dest.name}`,
        lineId: sharedLine,
        lineCode: sharedLine,
        direction: `Toward ${dest.name}`,
        platform: 'Platform 1',
        carRecommendation: 'Car 3, Door 2',
        durationMinutes: 16,
        stopCount: 5,
        stops: ['Station A', 'Station B', 'Station C', 'Station D', dest.name],
        crowdLevel: 'moderate',
      },
      {
        id: 's3',
        type: 'walk',
        instruction: `Alight at ${dest.name} and exit through ${dest.exits[0]?.exitCode || 'Exit A'}`,
        detail: `Follow overhead signage toward ${dest.exits[0]?.destinations[0] || 'destination'}`,
        durationMinutes: 2,
        distanceMeters: 100,
      }
    ];
  }

  // Requires transfer
  const lineA = origin.lines[0];
  const lineB = dest.lines[0];
  const transferStation = TRANSIT_STATIONS.find(s => s.lines.includes(lineA) && s.lines.includes(lineB)) || TRANSIT_STATIONS[7]; // Dhoby Ghaut fallback

  return [
    {
      id: 'step-origin-walk',
      type: 'walk',
      instruction: `Walk to ${origin.name} Station`,
      detail: `Enter through ${origin.exits[0]?.exitCode || 'Exit A'}, tap SimplyGo at Concourse Level`,
      durationMinutes: 4,
      distanceMeters: 220,
    },
    {
      id: 'step-train-leg1',
      type: 'train',
      instruction: `Board ${getLineName(lineA)} toward ${transferStation.name}`,
      detail: `Board Platform 2. Board Car 2, Door 4 to be directly aligned with interchange underpass at ${transferStation.name}`,
      lineId: lineA,
      lineCode: lineA,
      direction: `Toward ${transferStation.name}`,
      platform: 'Platform 2',
      carRecommendation: 'Car 2, Door 4',
      durationMinutes: 11,
      stopCount: 3,
      stops: [origin.name, 'Express Waypoint', transferStation.name],
      crowdLevel: 'moderate',
    },
    {
      id: 'step-transfer',
      type: 'transfer',
      instruction: `Transfer at ${transferStation.name} to ${getLineName(lineB)}`,
      detail: 'Follow signs down travelator to Level B3. Estimated walk time: 3 mins',
      durationMinutes: 3,
      distanceMeters: 140,
    },
    {
      id: 'step-train-leg2',
      type: 'train',
      instruction: `Board ${getLineName(lineB)} toward ${dest.name}`,
      detail: `Platform B. Quick transit. Alight at ${dest.name}`,
      lineId: lineB,
      lineCode: lineB,
      direction: `Toward ${dest.name}`,
      platform: 'Platform B',
      carRecommendation: 'Car 1, Door 1',
      durationMinutes: 9,
      stopCount: 2,
      stops: [transferStation.name, dest.name],
      crowdLevel: 'low',
    },
    {
      id: 'step-dest-exit',
      type: 'walk',
      instruction: `Exit ${dest.name} via ${dest.exits[0]?.exitCode || 'Exit A'}`,
      detail: `Landmarks: ${dest.exits[0]?.destinations.slice(0, 2).join(', ') || 'Main Exit'}`,
      durationMinutes: 3,
      distanceMeters: 160,
    },
  ];
}

export function getLineName(id: LineId): string {
  const line = TRANSIT_LINES.find(l => l.id === id);
  return line ? line.name : id;
}

export function getLineColor(id: LineId): string {
  const line = TRANSIT_LINES.find(l => l.id === id);
  return line ? line.color : '#006d3e';
}
