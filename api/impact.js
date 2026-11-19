/**
 * Serverless / Local API Endpoint: POST /api/impact
 * Quantifies personal exposure averted, direct emissions avoided, and community scale impacts.
 */

import { calculateExposureReduction, calculateEmissionsAvoided, calculateCommunityMultiplier, UG_M3_HOURS_PER_CIGARETTE } from '../lib/impact-engine.js';
import { sanitizeNumber, SECURITY_HEADERS, parseSafeJson } from '../lib/security.js';

export default async function handler(req, res) {
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = parseSafeJson(body);
    } else if (!body && req.readable) {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = parseSafeJson(Buffer.concat(buffers).toString('utf-8'));
    }
    body = body || {};

    const outdoorPm25 = sanitizeNumber(body.outdoorPm25, 5, 1000, 160);
    const hoursIndoors = sanitizeNumber(body.hoursIndoors, 1, 24, 14);
    const commuteMinutesAvoided = sanitizeNumber(body.commuteMinutesAvoided, 0, 300, 45);
    const n95Used = body.n95Used !== false;

    const carKmReplaced = sanitizeNumber(body.carKmReplaced, 0, 200, 12);
    const carColdStartsAvoided = sanitizeNumber(body.carColdStartsAvoided, 0, 10, 1);
    const carIdlingMinutesAvoided = sanitizeNumber(body.carIdlingMinutesAvoided, 0, 120, 15);
    const woodBurningHoursAvoided = sanitizeNumber(body.woodBurningHoursAvoided, 0, 24, 2);
    const leafBurningBagsComposted = sanitizeNumber(body.leafBurningBagsComposted, 0, 20, 0);
    const gasCookingSwappedHours = sanitizeNumber(body.gasCookingSwappedHours, 0, 10, 0.5);

    const participatingHouseholds = sanitizeNumber(body.participatingHouseholds, 1, 1000000, 1000);

    const exposure = calculateExposureReduction({
      outdoorPm25,
      hoursIndoors,
      commuteMinutesAvoided,
      n95Used
    });

    const emissions = calculateEmissionsAvoided({
      carKmReplaced,
      carColdStartsAvoided,
      carIdlingMinutesAvoided,
      woodBurningHoursAvoided,
      leafBurningBagsComposted,
      gasCookingSwappedHours
    });

    const community = calculateCommunityMultiplier({
      cigarettesAvoided: exposure.cigarettesAvoided,
      pm25Grams: emissions.pm25Grams,
      co2eKg: emissions.co2eKg
    }, participatingHouseholds);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      parameters: {
        outdoorPm25,
        hoursIndoors,
        commuteMinutesAvoided,
        n95Used,
        carKmReplaced,
        woodBurningHoursAvoided,
        participatingHouseholds
      },
      exposure,
      emissions,
      community,
      methodology: {
        citation: 'Berkeley Earth particulate-to-cigarette conversion: ~22 µg/m³ PM2.5 for 24h = 528 µg/m³·hours ≈ 1 cigarette equivalent inhaled.',
        indoorInfiltrationBaseline: 'Standard residential envelope infiltration is estimated at 72% of outdoor PM2.5; mitigated rooms with DIY/Corsi-Rosenthal air filtration achieve ~18% or lower.',
        pediatricHealthImpact: 'Epidemiological studies indicate ~2.8 pediatric asthma emergency visits prevented per 100 kg of PM2.5 curbed during winter thermal inversions.'
      }
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: err.message }));
  }
}
