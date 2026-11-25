/**
 * Impact Engine for Urban Air Quality Assistant.
 * Provides scientifically grounded calculations for PM2.5 exposure, equivalent cigarettes avoided,
 * personal emissions saved (CO2e, PM2.5, NOx), respiratory relief index, and community multipliers.
 */

// Berkeley Earth particulate-to-cigarette constant:
// 22 µg/m³ PM2.5 exposure for 24h = 528 µg/m³·hours ≈ 1 cigarette inhaled.
export const UG_M3_HOURS_PER_CIGARETTE = 528;

// Emission factors (based on EPA and EEA urban transport & residential heating benchmarks)
export const EMISSION_FACTORS = {
  carPerKm: {
    co2eGrams: 192,
    pm25Grams: 0.024,
    noxGrams: 0.38
  },
  coldStartAvoided: {
    co2eGrams: 150,
    pm25Grams: 0.09,
    noxGrams: 0.52
  },
  idlingPerMinute: {
    co2eGrams: 28,
    pm25Grams: 0.005,
    noxGrams: 0.045
  },
  woodStoveHourAvoided: {
    co2eGrams: 1850,
    pm25Grams: 4.8,
    noxGrams: 1.2
  },
  leafBurningBagAvoided: {
    co2eGrams: 4500,
    pm25Grams: 12.5,
    noxGrams: 2.1
  },
  gasStoveCookingHourAvoided: {
    co2eGrams: 210,
    pm25Grams: 0.015,
    noxGrams: 0.85
  }
};

/**
 * Calculates PM2.5 inhalation reduction and equivalent cigarettes avoided.
 * @param {Object} params
 * @param {number} params.outdoorPm25 - Outdoor ambient PM2.5 in µg/m³
 * @param {number} params.baselineIndoorPm25 - Unmitigated indoor PM2.5 (usually 60-80% of outdoor)
 * @param {number} params.mitigatedIndoorPm25 - Indoor PM2.5 after filtration/sealing (e.g. 15-25 µg/m³)
 * @param {number} params.hoursIndoors - Hours spent indoors benefiting from hacks (typically 12-18h)
 * @param {number} params.commuteMinutesAvoided - Minutes of peak outdoor smog commute shifted/eliminated
 * @param {boolean} params.n95Used - Whether a fitted N95/FFP2 mask was worn outdoors during unavoidable trips
 * @returns {Object}
 */
export function calculateExposureReduction({
  outdoorPm25 = 160,
  baselineIndoorPm25 = null,
  mitigatedIndoorPm25 = null,
  hoursIndoors = 14,
  commuteMinutesAvoided = 45,
  n95Used = true
} = {}) {
  const safeOutdoorPm = Math.max(5, Number(outdoorPm25) || 160);
  const unmitigatedIndoor = baselineIndoorPm25 ?? (safeOutdoorPm * 0.72);
  const cleanIndoor = mitigatedIndoorPm25 ?? Math.min(25, safeOutdoorPm * 0.18); // ~82% reduction with DIY purifier/sealing

  // Inhalation delta indoors: (unmitigated - clean) * hours
  const indoorExposureDelta = Math.max(0, (unmitigatedIndoor - cleanIndoor) * Number(hoursIndoors));

  // Commute avoidance / mask protection delta
  const commuteHours = Math.max(0, Number(commuteMinutesAvoided) / 60);
  let outdoorExposureDelta = 0;
  if (commuteHours > 0) {
    // If staying home or re-routing
    outdoorExposureDelta += safeOutdoorPm * commuteHours;
  }
  if (n95Used && commuteHours > 0) {
    // N95 filters ~95% of fine particulate when fitted
    outdoorExposureDelta += (safeOutdoorPm * 0.90) * commuteHours;
  }

  const totalUgHoursSaved = Math.round(indoorExposureDelta + outdoorExposureDelta);
  const cigarettesAvoided = Number((totalUgHoursSaved / UG_M3_HOURS_PER_CIGARETTE).toFixed(2));

  // Respiratory strain relief percentage (0 to 100)
  const baselineExposure = (unmitigatedIndoor * hoursIndoors) + (safeOutdoorPm * commuteHours);
  const reductionPercentage = baselineExposure > 0
    ? Math.min(95, Math.round((totalUgHoursSaved / baselineExposure) * 100))
    : 0;

  return {
    totalUgHoursSaved,
    cigarettesAvoided,
    reductionPercentage,
    cleanIndoorAchieved: Math.round(cleanIndoor),
    unmitigatedIndoor: Math.round(unmitigatedIndoor)
  };
}

/**
 * Calculates direct emission reductions from sustainable routine choices.
 * @param {Object} actions
 * @returns {Object}
 */
export function calculateEmissionsAvoided({
  carKmReplaced = 12,
  carColdStartsAvoided = 1,
  carIdlingMinutesAvoided = 15,
  woodBurningHoursAvoided = 2,
  leafBurningBagsComposted = 0,
  gasCookingSwappedHours = 0.5
} = {}) {
  const activities = [
    [carKmReplaced, EMISSION_FACTORS.carPerKm],
    [carColdStartsAvoided, EMISSION_FACTORS.coldStartAvoided],
    [carIdlingMinutesAvoided, EMISSION_FACTORS.idlingPerMinute],
    [woodBurningHoursAvoided, EMISSION_FACTORS.woodStoveHourAvoided],
    [leafBurningBagsComposted, EMISSION_FACTORS.leafBurningBagAvoided],
    [gasCookingSwappedHours, EMISSION_FACTORS.gasStoveCookingHourAvoided]
  ];

  let co2eGrams = 0;
  let pm25Grams = 0;
  let noxGrams = 0;

  for (const [amount, factor] of activities) {
    const qty = Number(amount);
    if (Number.isFinite(qty) && qty > 0) {
      co2eGrams += qty * factor.co2eGrams;
      pm25Grams += qty * factor.pm25Grams;
      noxGrams += qty * factor.noxGrams;
    }
  }

  return {
    co2eKg: Number((co2eGrams / 1000).toFixed(2)),
    pm25Grams: Number(pm25Grams.toFixed(2)),
    noxGrams: Number(noxGrams.toFixed(2)),
    totalGramsPollutionDirectlyPrevented: Number((pm25Grams + noxGrams).toFixed(2))
  };
}

/**
 * Calculates the Corsi-Rosenthal Box CADR and Air Changes per Hour (ACH) for a room.
 * @param {Object} roomParams
 * @param {number} roomParams.lengthFt - Room length in feet
 * @param {number} roomParams.widthFt - Room width in feet
 * @param {number} roomParams.heightFt - Ceiling height in feet (default 8)
 * @param {number} roomParams.filterCount - 4 or 5 MERV 13 filters
 * @param {number} roomParams.fanSpeed - 1 (low/quiet), 2 (medium), 3 (high)
 * @returns {Object}
 */
export function calculateCorsiRosenthalPerformance({
  lengthFt = 15,
  widthFt = 14,
  heightFt = 8,
  filterCount = 4,
  fanSpeed = 2
} = {}) {
  const roomVolumeCuFt = Math.max(100, lengthFt * widthFt * heightFt);
  
  // Base CADR (Clean Air Delivery Rate) estimates based on UC Davis / EPA testing:
  // 4-filter box fan on medium delivers ~450 CFM; high ~550 CFM; low ~300 CFM
  // 5-filter (Comparetto cube) adds ~10-15% more surface area and lower static pressure
  const baseSpeedCfm = {
    1: 310,
    2: 460,
    3: 560
  }[fanSpeed] || 460;

  const filterMultiplier = filterCount >= 5 ? 1.12 : 1.0;
  const estimatedCadrCfm = Math.round(baseSpeedCfm * filterMultiplier);

  // Air Changes per Hour (ACH) = (CADR * 60) / Room Volume
  const ach = Number(((estimatedCadrCfm * 60) / roomVolumeCuFt).toFixed(1));

  // Time to clear 90% of airborne particles (minutes):
  // Formula: -ln(1 - 0.90) / (ACH / 60) = 2.3026 * 60 / ACH
  const minutesTo90PercentClean = ach > 0 ? Math.round((138.15 / ach)) : 999;

  let rating = 'Standard';
  if (ach >= 5) rating = 'Hospital/Cleanroom Grade (5+ ACH)';
  else if (ach >= 3.5) rating = 'Excellent Residential Protection (3.5 - 5 ACH)';
  else if (ach >= 2) rating = 'Moderate Protection (2 - 3.5 ACH)';
  else rating = 'Under-sized for this room volume (< 2 ACH)';

  return {
    roomVolumeCuFt,
    estimatedCadrCfm,
    ach,
    minutesTo90PercentClean,
    rating,
    commercialEquivCostUSD: '$450 - $800',
    diyCostUSD: '$65 - $85',
    annualSavingsUSD: '$350+'
  };
}

/**
 * Calculates collective community scale impact.
 * @param {Object} singleHouseholdImpact
 * @param {number} participatingHouseholds
 * @returns {Object}
 */
export function calculateCommunityMultiplier(singleHouseholdImpact, participatingHouseholds = 1000) {
  const count = Math.max(1, Number(participatingHouseholds) || 1000);
  const cigsPerHouse = singleHouseholdImpact.cigarettesAvoided || 1.8;
  const pm25GramsPerHouse = singleHouseholdImpact.pm25Grams || 5.2;
  const co2eKgPerHouse = singleHouseholdImpact.co2eKg || 4.1;

  const totalCigarettesAvoided = Math.round(cigsPerHouse * count * 30); // 30-day winter smog wave
  const totalPm25KgPrevented = Number(((pm25GramsPerHouse * count * 30) / 1000).toFixed(1));
  const totalCo2MetricTons = Number(((co2eKgPerHouse * count * 30) / 1000).toFixed(1));

  // Epidemiological rule of thumb: ~2-3 pediatric asthma ER visits prevented per 100kg of PM2.5 curbed in urban basin
  const asthmaVisitsAvoided = Math.max(1, Math.round(totalPm25KgPrevented * 0.028));

  return {
    participatingHouseholds: count,
    timespanDays: 30,
    totalCigarettesAvoided,
    totalPm25KgPrevented,
    totalCo2MetricTons,
    asthmaVisitsAvoided
  };
}
