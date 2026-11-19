/**
 * Serverless / Local API Endpoint: GET /api/aqi
 * Provides ambient AQI telemetry, meteorological boundary layer height, and hourly diurnal inversion curves.
 */

import { HOURLY_INVERSION_PROFILE, LOCATION_ARCHETYPES } from '../lib/routines-data.js';
import { sanitizeString, sanitizeNumber, SECURITY_HEADERS } from '../lib/security.js';

export default async function handler(req, res) {
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const url = new URL(req.url, 'http://localhost');
  const locationKey = sanitizeString(url.searchParams.get('location') || 'river_valley_basin');
  const customAqiParam = url.searchParams.get('aqi');

  const location = LOCATION_ARCHETYPES[locationKey] || LOCATION_ARCHETYPES.river_valley_basin;

  // Archetype default baseline winter AQI
  const defaultAqiMap = {
    river_valley_basin: 285, // Severe winter inversion
    urban_metro_canyon: 175, // Heavy traffic canyon
    coastal_basin: 125,      // Marine layer trap
    suburban_heating_belt: 160 // Wood burning smoke
  };

  const baselineAqi = customAqiParam
    ? sanitizeNumber(customAqiParam, 10, 999, 185)
    : (defaultAqiMap[locationKey] || 185);

  // Compute PM2.5 (µg/m³) from AQI approximation
  let basePm25 = baselineAqi * 0.72;
  if (baselineAqi > 200) basePm25 = 150 + ((baselineAqi - 200) * 0.88);

  // Map AQI category
  let category = 'Moderate';
  let color = '#f59e0b'; // Amber
  let healthSummary = 'Air quality is acceptable; however, sensitive groups may experience minor respiratory symptoms.';

  if (baselineAqi <= 50) {
    category = 'Good';
    color = '#10b981';
    healthSummary = 'Air quality is satisfactory and poses little or no risk.';
  } else if (baselineAqi <= 100) {
    category = 'Moderate';
    color = '#f59e0b';
    healthSummary = 'Acceptable quality. Sensitive individuals should monitor symptoms.';
  } else if (baselineAqi <= 150) {
    category = 'Unhealthy for Sensitive Groups';
    color = '#f97316';
    healthSummary = 'Children, seniors, and individuals with respiratory/heart conditions should limit prolonged outdoor exertion.';
  } else if (baselineAqi <= 200) {
    category = 'Unhealthy';
    color = '#ef4444';
    healthSummary = 'Everyone may begin to experience health effects; sensitive groups should avoid outdoor physical activity.';
  } else if (baselineAqi <= 300) {
    category = 'Very Unhealthy';
    color = '#8b5cf6';
    healthSummary = 'Health alert: risk of health effects is increased for everyone. Strictly avoid outdoor exercise.';
  } else {
    category = 'Hazardous (Severe Smog Crisis)';
    color = '#7f1d1d';
    healthSummary = 'Emergency warning: entire population is likely to be affected. Keep homes sealed and run air filtration continuously.';
  }

  // Calculate the 24-hour curve values
  const hourlyCurve = HOURLY_INVERSION_PROFILE.map(slot => {
    const hourlyPm = Math.round(basePm25 * slot.pmMultiplier);
    const hourlyAqi = Math.round(baselineAqi * (slot.pmMultiplier * 0.85 + 0.15));
    const isOptimalVentilation = slot.hour >= 13 && slot.hour <= 15;
    const isHazardousPeak = (slot.hour >= 6 && slot.hour <= 9) || (slot.hour >= 19 && slot.hour <= 23);

    return {
      hour: slot.hour,
      timeLabel: slot.timeLabel,
      pm25: hourlyPm,
      aqi: hourlyAqi,
      boundaryLayerMeters: slot.boundaryLayerMeters,
      riskLevel: slot.riskLevel,
      isOptimalVentilation,
      isHazardousPeak,
      advice: slot.advice
    };
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    location,
    baselineAqi,
    basePm25: Math.round(basePm25),
    category,
    color,
    healthSummary,
    optimalVentilationWindow: '1:00 PM - 3:30 PM (Solar Boundary Layer Mixing)',
    hazardousWindow: '6:00 AM - 9:30 AM & 7:00 PM - 11:00 PM (Nocturnal Thermal Inversion)',
    hourlyCurve
  }));
}
