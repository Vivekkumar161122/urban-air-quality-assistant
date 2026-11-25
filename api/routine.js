/**
 * Serverless / Local API Endpoint: GET / POST /api/routine
 * Generates structured low-emission daily routines tailored to location and lifestyle.
 */

import { generateDailyRoutine, LOCATION_ARCHETYPES, LIFESTYLE_PERSONAS } from '../lib/routines-data.js';
import {
  HttpError,
  applySecurityHeaders,
  handleCorsPreflight,
  readJsonBody,
  sendJson,
  sendMethodNotAllowed
} from '../lib/http.js';
import { sanitizeString, sanitizeNumber } from '../lib/security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (handleCorsPreflight(req, res, { methods: 'GET, POST, OPTIONS' })) {
    return;
  }

  let locationKey = 'river_valley_basin';
  let personaKey = 'family_young_children';
  let aqi = 185;

  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    locationKey = url.searchParams.get('location') || locationKey;
    personaKey = url.searchParams.get('persona') || personaKey;
    if (url.searchParams.get('aqi')) {
      aqi = sanitizeNumber(url.searchParams.get('aqi'), 10, 999, 185);
    }
  } else if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      locationKey = body.locationKey || locationKey;
      personaKey = body.personaKey || personaKey;
      if (body.aqi !== undefined) {
        aqi = sanitizeNumber(body.aqi, 10, 999, 185);
      }
    } catch (err) {
      if (err instanceof HttpError) {
        return sendJson(res, err.statusCode, { error: err.message });
      }
      return sendJson(res, 500, { error: err.message });
    }
  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST']);
  }

  const routine = generateDailyRoutine({
    locationKey: sanitizeString(locationKey),
    personaKey: sanitizeString(personaKey),
    baselineAqi: aqi
  });

  return sendJson(res, 200, {
    ...routine,
    availableLocations: Object.values(LOCATION_ARCHETYPES).map((l) => ({ id: l.id, name: l.name })),
    availablePersonas: Object.values(LIFESTYLE_PERSONAS).map((p) => ({ id: p.id, name: p.name }))
  });
}
