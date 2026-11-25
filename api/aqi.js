/**
 * Serverless / Local API Endpoint: GET /api/aqi
 * Provides ambient AQI telemetry, meteorological boundary layer height, and hourly diurnal inversion curves.
 */

import { HOURLY_INVERSION_PROFILE, LOCATION_ARCHETYPES } from '../lib/routines-data.js';
import { applySecurityHeaders, handleCorsPreflight, sendJson, sendMethodNotAllowed } from '../lib/http.js';
import { sanitizeString, sanitizeNumber } from '../lib/security.js';

const DEFAULT_AQI_BY_LOCATION = {
  river_valley_basin: 285,   // Severe winter inversion
  urban_metro_canyon: 175,   // Heavy traffic canyon
  coastal_basin: 125,        // Marine layer trap
  suburban_heating_belt: 160 // Wood burning smoke
};

const AQI_CATEGORY_BANDS = [
  {
    maxAqi: 50,
    category: 'Good',
    color: '#10b981',
    healthSummary: 'Air quality is satisfactory and poses little or no risk.'
  },
  {
    maxAqi: 100,
    category: 'Moderate',
    color: '#f59e0b',
    healthSummary: 'Acceptable quality. Sensitive individuals should monitor symptoms.'
  },
  {
    maxAqi: 150,
    category: 'Unhealthy for Sensitive Groups',
    color: '#f97316',
    healthSummary: 'Children, seniors, and individuals with respiratory/heart conditions should limit prolonged outdoor exertion.'
  },
  {
    maxAqi: 200,
    category: 'Unhealthy',
    color: '#ef4444',
    healthSummary: 'Everyone may begin to experience health effects; sensitive groups should avoid outdoor physical activity.'
  },
  {
    maxAqi: 300,
    category: 'Very Unhealthy',
    color: '#8b5cf6',
    healthSummary: 'Health alert: risk of health effects is increased for everyone. Strictly avoid outdoor exercise.'
  },
  {
    maxAqi: Infinity,
    category: 'Hazardous (Severe Smog Crisis)',
    color: '#7f1d1d',
    healthSummary: 'Emergency warning: entire population is likely to be affected. Keep homes sealed and run air filtration continuously.'
  }
];

/**
 * Maps a numeric AQI value to its EPA category band.
 * @param {number} aqi
 * @returns {{ maxAqi: number, category: string, color: string, healthSummary: string }}
 */
function classifyAqi(aqi) {
  return AQI_CATEGORY_BANDS.find((band) => aqi <= band.maxAqi) || AQI_CATEGORY_BANDS[AQI_CATEGORY_BANDS.length - 1];
}

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (handleCorsPreflight(req, res, { methods: 'GET, OPTIONS' })) {
    return;
  }

  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  const url = new URL(req.url, 'http://localhost');
  const locationKey = sanitizeString(url.searchParams.get('location') || 'river_valley_basin');
  const customAqiParam = url.searchParams.get('aqi');

  const location = LOCATION_ARCHETYPES[locationKey] || LOCATION_ARCHETYPES.river_valley_basin;
  const baselineAqi = customAqiParam
    ? sanitizeNumber(customAqiParam, 10, 999, 185)
    : (DEFAULT_AQI_BY_LOCATION[locationKey] || 185);

  const basePm25 = baselineAqi > 200
    ? 150 + ((baselineAqi - 200) * 0.88)
    : baselineAqi * 0.72;

  const { category, color, healthSummary } = classifyAqi(baselineAqi);

  const hourlyCurve = HOURLY_INVERSION_PROFILE.map((slot) => ({
    hour: slot.hour,
    timeLabel: slot.timeLabel,
    pm25: Math.round(basePm25 * slot.pmMultiplier),
    aqi: Math.round(baselineAqi * (slot.pmMultiplier * 0.85 + 0.15)),
    boundaryLayerMeters: slot.boundaryLayerMeters,
    riskLevel: slot.riskLevel,
    isOptimalVentilation: slot.hour >= 13 && slot.hour <= 15,
    isHazardousPeak: (slot.hour >= 6 && slot.hour <= 9) || (slot.hour >= 19 && slot.hour <= 23),
    advice: slot.advice
  }));

  return sendJson(res, 200, {
    location,
    baselineAqi,
    basePm25: Math.round(basePm25),
    category,
    color,
    healthSummary,
    optimalVentilationWindow: '1:00 PM - 3:30 PM (Solar Boundary Layer Mixing)',
    hazardousWindow: '6:00 AM - 9:30 AM & 7:00 PM - 11:00 PM (Nocturnal Thermal Inversion)',
    hourlyCurve
  });
}
