/**
 * Routines and Atmospheric Diurnal Data for Urban Air Quality Assistant.
 * Models diurnal thermal inversion curves, location archetypes, and lifestyle personas.
 */

// Diurnal hourly curve: PM2.5 index multiplier relative to daily average (1.0 = average)
// Models the classic winter radiation inversion: trapped stagnant air at dawn/night,
// boundary layer expansion & solar mixing around 13:00-15:00.
export const HOURLY_INVERSION_PROFILE = [
  { hour: 0, timeLabel: '12:00 AM', pmMultiplier: 1.35, boundaryLayerMeters: 80, riskLevel: 'Very High', advice: 'Keep bedroom air purifier running on low; keep all windows sealed.' },
  { hour: 1, timeLabel: '1:00 AM', pmMultiplier: 1.40, boundaryLayerMeters: 75, riskLevel: 'Very High', advice: 'Stagnant cold pool; minimum dispersion.' },
  { hour: 2, timeLabel: '2:00 AM', pmMultiplier: 1.45, boundaryLayerMeters: 70, riskLevel: 'Hazardous', advice: 'Ground cooling traps nighttime industrial & heating emissions.' },
  { hour: 3, timeLabel: '3:00 AM', pmMultiplier: 1.50, boundaryLayerMeters: 65, riskLevel: 'Hazardous', advice: 'Peak nocturnal inversion depth.' },
  { hour: 4, timeLabel: '4:00 AM', pmMultiplier: 1.55, boundaryLayerMeters: 60, riskLevel: 'Hazardous', advice: 'Deepest inversion lid; ultra-high particulate concentration.' },
  { hour: 5, timeLabel: '5:00 AM', pmMultiplier: 1.60, boundaryLayerMeters: 65, riskLevel: 'Hazardous', advice: 'Early truck/logistics traffic starts under closed boundary layer.' },
  { hour: 6, timeLabel: '6:00 AM', pmMultiplier: 1.75, boundaryLayerMeters: 70, riskLevel: 'Hazardous', advice: 'CRITICAL SMOG SPIKE: Do NOT jog, walk dogs, or air out home.' },
  { hour: 7, timeLabel: '7:00 AM', pmMultiplier: 1.80, boundaryLayerMeters: 90, riskLevel: 'Hazardous', advice: 'Peak rush hour cold-starts into freezing trapped surface layer.' },
  { hour: 8, timeLabel: '8:00 AM', pmMultiplier: 1.70, boundaryLayerMeters: 120, riskLevel: 'Hazardous', advice: 'School commute window: Wear fitted N95; recirculate car cabin air.' },
  { hour: 9, timeLabel: '9:00 AM', pmMultiplier: 1.50, boundaryLayerMeters: 180, riskLevel: 'Very High', advice: 'Inversion lid begins sluggish thermal erosion.' },
  { hour: 10, timeLabel: '10:00 AM', pmMultiplier: 1.25, boundaryLayerMeters: 300, riskLevel: 'High', advice: 'Solar heating starts mixing boundary layer; air slowly clears.' },
  { hour: 11, timeLabel: '11:00 AM', pmMultiplier: 1.05, boundaryLayerMeters: 450, riskLevel: 'Moderate-High', advice: 'Pollution levels dropping toward daily baseline.' },
  { hour: 12, timeLabel: '12:00 PM', pmMultiplier: 0.85, boundaryLayerMeters: 650, riskLevel: 'Moderate', advice: 'Thermal mixing active; boundary layer expanding.' },
  { hour: 13, timeLabel: '1:00 PM', pmMultiplier: 0.65, boundaryLayerMeters: 850, riskLevel: 'Lowest Daily Exposure', advice: 'OPTIMAL WINDOW: Safest time for quick outdoor chores & brief window flush.' },
  { hour: 14, timeLabel: '2:00 PM', pmMultiplier: 0.60, boundaryLayerMeters: 950, riskLevel: 'Lowest Daily Exposure', advice: 'PEAK DISPERSION: Safest hour for school pick-up and essential outdoor time.' },
  { hour: 15, timeLabel: '3:00 PM', pmMultiplier: 0.65, boundaryLayerMeters: 900, riskLevel: 'Lowest Daily Exposure', advice: 'Good atmospheric mixing; begin closing windows by 3:45 PM.' },
  { hour: 16, timeLabel: '4:00 PM', pmMultiplier: 0.80, boundaryLayerMeters: 700, riskLevel: 'Moderate', advice: 'Sun angle declines; boundary layer begins rapid compression.' },
  { hour: 17, timeLabel: '5:00 PM', pmMultiplier: 1.10, boundaryLayerMeters: 400, riskLevel: 'High', advice: 'Evening rush hour emissions begin trapping beneath reforming inversion.' },
  { hour: 18, timeLabel: '6:00 PM', pmMultiplier: 1.35, boundaryLayerMeters: 250, riskLevel: 'Very High', advice: 'Evening smog dome solidifies; avoid outdoor exercise.' },
  { hour: 19, timeLabel: '7:00 PM', pmMultiplier: 1.50, boundaryLayerMeters: 160, riskLevel: 'Hazardous', advice: 'Domestic heating and evening cooking fumes concentrate at ground.' },
  { hour: 20, timeLabel: '8:00 PM', pmMultiplier: 1.55, boundaryLayerMeters: 120, riskLevel: 'Hazardous', advice: 'Run Corsi-Rosenthal boxes on medium in family common areas.' },
  { hour: 21, timeLabel: '9:00 PM', pmMultiplier: 1.50, boundaryLayerMeters: 100, riskLevel: 'Hazardous', advice: 'Transition purifiers to quiet bedroom sanctuaries.' },
  { hour: 22, timeLabel: '10:00 PM', pmMultiplier: 1.45, boundaryLayerMeters: 90, riskLevel: 'Very High', advice: 'Ensure windows and balcony doors are latched tight for sleep.' },
  { hour: 23, timeLabel: '11:00 PM', pmMultiplier: 1.40, boundaryLayerMeters: 85, riskLevel: 'Very High', advice: 'Cold nocturnal pool locks in pollutants until tomorrow noon.' }
];

export const LOCATION_ARCHETYPES = {
  river_valley_basin: {
    id: 'river_valley_basin',
    name: 'River Valley / Topographic Basin',
    examples: 'Delhi-NCR, Indo-Gangetic Plains, Po Valley (Italy), Salt Lake Basin (UT)',
    meteorology: 'Severe radiation inversion lid, shallow boundary layer (<100m at dawn), trapped biomass/stubble smoke and vehicular soot.',
    primaryPollutants: ['PM2.5 (High)', 'PM10 (Dust)', 'NO2', 'CO'],
    keyAdvice: 'Strictly avoid mornings before 11 AM; utilize the 1:00 PM - 3:30 PM mixing window for ventilation; prioritize high-volume DIY air filtration.',
    suggestedCleanHeating: 'Electric heat pump or sealed infrared radiant panels; eliminate all open wood or dung fires.'
  },
  urban_metro_canyon: {
    id: 'urban_metro_canyon',
    name: 'Dense High-Rise Metro Canyon',
    examples: 'New York, London, Chicago, Tokyo, Seoul',
    meteorology: 'Street canyon aerodynamic vortices trapping diesel particulate matter (DPM), subway platform brake dust, and localized vehicle exhaust.',
    primaryPollutants: ['PM2.5 (Diesel Soot)', 'NO2 (High)', 'Ultrafine Particles (UFP)'],
    keyAdvice: 'Avoid walking along multi-lane street canyons during rush hours; walk on interior residential streets; wear fitted N95 inside underground transit stations.',
    suggestedCleanHeating: 'District steam / electrified hydronic heating; optimize apartment window gasket seals.'
  },
  coastal_basin: {
    id: 'coastal_basin',
    name: 'Coastal Marine Layer Basin',
    examples: 'Los Angeles Basin, San Francisco Bay, Mumbai, Athens',
    meteorology: 'Marine boundary layer inversion capping urban emissions, morning low cloud/fog, afternoon onshore sea breeze shifts.',
    primaryPollutants: ['Ozone (Afternoon)', 'PM2.5', 'NOx', 'Shipping/Port Particulates'],
    keyAdvice: 'Watch for afternoon photochemical smog transitions; exercise indoors when marine inversion traps morning commute exhaust.',
    suggestedCleanHeating: 'Solar-assisted mini-split heat pumps; avoid fireplace burns on "Spare the Air" alert days.'
  },
  suburban_heating_belt: {
    id: 'suburban_heating_belt',
    name: 'Cold Suburban Heating Belt',
    examples: 'Central & Eastern Europe, Pacific Northwest, New England valleys',
    meteorology: 'Cold-air drainage into local hollows, heavy domestic wood stove and pellet smoke, high vehicular cold-start penalties.',
    primaryPollutants: ['Wood Smoke PM2.5 (PAHs)', 'Carbon Monoxide', 'VOCs'],
    keyAdvice: 'Never burn unseasoned green wood; eliminate wood burning on calm inversion days; consolidate short car trips to avoid repeat cold-starts.',
    suggestedCleanHeating: 'Certified EPA pellet stove or cold-climate heat pump; community leaf composting instead of burning.'
  }
};

export const LIFESTYLE_PERSONAS = {
  family_young_children: {
    id: 'family_young_children',
    name: 'Family with Infants or Young Children',
    vulnerabilities: 'Children breathe 50% more air per pound of body weight than adults; stroller height (0.5m - 0.8m) sits directly in the highest concentration zone of tailpipe exhaust.',
    keyAdjustments: [
      'Reschedule outdoor playtime and park visits to 1:00 PM - 3:30 PM (cleanest window).',
      'Shield strollers with weather covers fitted with mini HEPA filters or avoid street-side stroller walks during peak smog.',
      'Organize walking school buses or carpools to eliminate 15-minute idling queues outside school gates.',
      'Create a sealed "Clean Air Playroom" using a Corsi-Rosenthal box running continuously on low.'
    ]
  },
  seniors_respiratory: {
    id: 'seniors_respiratory',
    name: 'Seniors / Respiratory or Cardiac Conditions (COPD, Asthma)',
    vulnerabilities: 'High susceptibility to acute bronchospasms, oxygen desaturation, and cardiovascular strain triggered by PM2.5 and ultrafine particles.',
    keyAdjustments: [
      'Shift traditional early morning walks to indoor walking or midday 1:30 PM.',
      'Keep a portable pulse oximeter and peak flow meter handy on Red/Purple AQI alert days.',
      'Seal the master bedroom as a "Clean Sanctuary" (aim for PM2.5 < 15 µg/m³ with filtration).',
      'Wear an authentic, fit-checked N95/FFP2 for any unavoidable clinic or grocery trips.'
    ]
  },
  commuter_transit: {
    id: 'commuter_transit',
    name: 'Daily Commuters & Outdoor Workers',
    vulnerabilities: 'Prolonged exposure to roadway exhaust plumes, diesel soot in transit corridors, and elevated heart rate during bike/scooter rides in smog.',
    keyAdjustments: [
      'If driving: Turn car HVAC to RECIRCULATION MODE before entering congested tunnels or highway jams (cuts in-cabin PM2.5 by 80%).',
      'If taking subway/bus: Put on an N95 respirator before entering the station platform (train braking produces high iron/particulate concentrations).',
      'If cycling/walking: Avoid arterial truck routes; divert 1-2 blocks onto tree-lined residential side streets to reduce direct exposure by 30-40%.',
      'Consolidate daily errands into a single trip when the engine is already warm, eliminating multiple polluting cold-starts.'
    ]
  },
  apartment_renter: {
    id: 'apartment_renter',
    name: 'Apartment Renters (Non-Destructive Solutions)',
    vulnerabilities: 'Cannot replace HVAC or windows; shared ventilation shafts and hallway smoke/smog infiltration.',
    keyAdjustments: [
      'Build a portable, low-cost Corsi-Rosenthal Box that can be moved between bedroom and living area.',
      'Use removable painter’s tape or temporary silicone door sweeps to block drafty entrance doors without damaging landlord paint.',
      'Cover exhaust vents with pre-cut carbon/MERV filter sheets to prevent reverse airflow backdrafts.',
      'Use a portable single-burner induction cooktop on the counter to avoid unvented gas burner pollution.'
    ]
  },
  suburban_homeowner: {
    id: 'suburban_homeowner',
    name: 'Suburban Homeowners & Community Leaders',
    vulnerabilities: 'Large heating footprint; yard waste accumulation; localized neighborhood wood-smoke emissions.',
    keyAdjustments: [
      'Cease all open fireplace burning; convert to clean radiant heating or heat pumps.',
      'Commit to municipal or backyard composting for autumn leaves rather than burning garden debris.',
      'Install MERV 13 filters directly in the central forced-air furnace unit (run fan in continuous "ON" mode).',
      'Coordinate a neighborhood bulk purchase of MERV 13 filters to distribute Corsi-Rosenthal kits to local schools.'
    ]
  }
};

/**
 * Generates a structured low-emission daily routine tailored to location, persona, and AQI.
 * @param {Object} options
 * @param {string} options.locationKey
 * @param {string} options.personaKey
 * @param {number} options.baselineAqi
 * @returns {Object}
 */
export function generateDailyRoutine({
  locationKey = 'river_valley_basin',
  personaKey = 'family_young_children',
  baselineAqi = 185
} = {}) {
  const location = LOCATION_ARCHETYPES[locationKey] || LOCATION_ARCHETYPES.river_valley_basin;
  const persona = LIFESTYLE_PERSONAS[personaKey] || LIFESTYLE_PERSONAS.family_young_children;
  const aqi = Math.max(10, Number(baselineAqi) || 185);

  // Derive estimated base PM2.5 from AQI (rough US-EPA conversion for winter smog)
  let basePm25 = aqi * 0.75;
  if (aqi > 200) basePm25 = 150 + ((aqi - 200) * 0.9);

  // Select key milestone routine slots
  const timeline = [
    {
      time: '06:30 - 08:30 AM',
      period: 'Morning Inversion Peak',
      smogSeverity: aqi > 150 ? 'Hazardous Ground Smog' : 'High Stagnation',
      hourlyEstimatedPm25: Math.round(basePm25 * 1.75),
      routineAction: personaKey === 'family_young_children'
        ? 'School commute: Pre-seal car cabin on Recirculation 5 mins prior; equip children with fitted KN95/N95. Strictly no outdoor assembly or field play.'
        : personaKey === 'seniors_respiratory'
        ? 'STAY INDOORS: Reschedule any outdoor exercise to 1:30 PM. Keep bedroom purifier on medium; drink warm fluids to soothe mucosal membranes.'
        : 'Transit commute: Wear fitted N95 respirator in bus stops and subway platforms. Consolidate passenger trips.',
      sustainableAlternative: 'Avoid vehicle cold-start idling (turn engine on and drive smoothly immediately after 30 seconds; eliminates heavy idle soot plume).',
      impactNote: 'Avoids ~140 µg/m³ of acute morning peak particulate exposure.'
    },
    {
      time: '08:30 - 11:30 AM',
      period: 'Sluggish Boundary Layer Lift',
      smogSeverity: 'Elevated Particulates',
      hourlyEstimatedPm25: Math.round(basePm25 * 1.30),
      routineAction: 'Keep all windows, balcony doors, and exterior dampers shut. Run Corsi-Rosenthal box or HEPA unit in work/study areas on quiet speed.',
      sustainableAlternative: 'Shift household heating to thermostat setback (68°F / 20°C); put on warm layered woolens rather than cranking high-emission boilers.',
      impactNote: 'Conserves 15-20% heating energy while keeping indoor PM2.5 under 25 µg/m³.'
    },
    {
      time: '12:00 - 01:00 PM',
      period: 'Clean Cooking Transition',
      smogSeverity: 'Moderate Solar Mixing',
      hourlyEstimatedPm25: Math.round(basePm25 * 0.85),
      routineAction: 'Lunch preparation: Cook on back burners with range hood on High 2 mins beforehand. Favor boiling, soup pots, or induction plate.',
      sustainableAlternative: 'Use countertop induction plate or electric pressure cooker instead of unvented gas flame to eliminate indoor NO2 emissions.',
      impactNote: 'Prevents 200+ µg/m³ peak kitchen aerosol burst and eliminates combustion nitrogen dioxide.'
    },
    {
      time: '01:00 - 03:30 PM',
      period: 'Peak Solar Mixing Window (Cleanest Air)',
      smogSeverity: 'Daily Air Quality Minimum',
      hourlyEstimatedPm25: Math.round(basePm25 * 0.60),
      routineAction: personaKey === 'family_young_children'
        ? 'SAFE OUTDOOR WINDOW: Ideal time for outdoor physical activity, playground visits, and school dismissal walks. Conduct 10-min whole-house flush ventilation.'
        : 'VENTILATION & ERRANDS: Safest hour for quick grocery shopping, exterior dog walking, and refreshing indoor air with open opposing windows for 15 minutes.',
      sustainableAlternative: 'Combine multiple errand destinations into a single warmed-up route or walk the neighborhood residential streets.',
      impactNote: 'Brings fresh oxygen into the home with 60% less particulate load than morning air.'
    },
    {
      time: '04:00 - 06:30 PM',
      period: 'Inversion Reformation & Sunset',
      smogSeverity: 'Rapid Compression',
      hourlyEstimatedPm25: Math.round(basePm25 * 1.10),
      routineAction: 'LATCH ALL WINDOWS TIGHT before sunset (3:45 PM). Re-engage door sweeps and draft blockers. Ensure filters are switched on.',
      sustainableAlternative: 'Coordinate neighborhood carpool pick-ups from afternoon activities to cut car trips in half.',
      impactNote: 'Traps the clean indoor air bubble before the cold nighttime inversion lid clamps down.'
    },
    {
      time: '07:00 - 10:30 PM',
      period: 'Nighttime Thermal Trap & Sleep Sanctuary',
      smogSeverity: 'High Nocturnal Stagnation',
      hourlyEstimatedPm25: Math.round(basePm25 * 1.50),
      routineAction: 'Bedrooms sealed: Place Corsi-Rosenthal box or HEPA unit in sleeping quarters on quiet mode (1.5 - 2 ACH). Maintain 40% relative humidity using distilled water.',
      sustainableAlternative: 'Strictly zero wood burning or fireplace logs; use programmable electric radiant heat.',
      impactNote: 'Secures 8 full hours of restorative sleep with clean lungs (equivalent to avoiding 1.5 - 2 cigarettes daily).'
    }
  ];

  return {
    location,
    persona,
    baselineAqi,
    basePm25: Math.round(basePm25),
    timeline,
    summaryAdvice: `Customized for ${persona.name} in a ${location.name}. During this winter smog episode (AQI ${aqi}), strictly avoid outdoor physical exertion between 6:00-9:30 AM and 6:30-10:00 PM. Concentrate essential outdoor tasks and home airing during the 1:00-3:30 PM solar mixing window.`
  };
}
