/**
 * Serverless / Local API Endpoint: GET / POST /api/routine
 * Generates structured low-emission daily routines tailored to location and lifestyle.
 */

import { generateDailyRoutine, LOCATION_ARCHETYPES, LIFESTYLE_PERSONAS } from '../lib/routines-data.js';
import { sanitizeString, sanitizeNumber, SECURITY_HEADERS, parseSafeJson } from '../lib/security.js';

export default async function handler(req, res) {
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
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
    locationKey = body.locationKey || locationKey;
    personaKey = body.personaKey || personaKey;
    if (body.aqi !== undefined) {
      aqi = sanitizeNumber(body.aqi, 10, 999, 185);
    }
  } else {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const routine = generateDailyRoutine({
    locationKey: sanitizeString(locationKey),
    personaKey: sanitizeString(personaKey),
    baselineAqi: aqi
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    ...routine,
    availableLocations: Object.values(LOCATION_ARCHETYPES).map(l => ({ id: l.id, name: l.name })),
    availablePersonas: Object.values(LIFESTYLE_PERSONAS).map(p => ({ id: p.id, name: p.name }))
  }));
}
