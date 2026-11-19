/**
 * Serverless / Local API Endpoint: GET / POST /api/hacks
 * Serves verified Indoor Air Quality hacks and calculates dynamic Corsi-Rosenthal room CADR.
 */

import { IAQ_HACKS, IAQ_CATEGORIES } from '../lib/iaq-knowledge.js';
import { calculateCorsiRosenthalPerformance } from '../lib/impact-engine.js';
import { sanitizeNumber, sanitizeString, SECURITY_HEADERS, parseSafeJson } from '../lib/security.js';

export default async function handler(req, res) {
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let filtered = [...IAQ_HACKS];

    if (category && category !== 'all') {
      filtered = filtered.filter(h => h.category === category);
    }

    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(h =>
        h.title.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        h.scientificImpact.toLowerCase().includes(q)
      );
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      categories: IAQ_CATEGORIES,
      count: filtered.length,
      hacks: filtered
    }));
  }

  if (req.method === 'POST') {
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

    const lengthFt = sanitizeNumber(body.lengthFt, 5, 80, 15);
    const widthFt = sanitizeNumber(body.widthFt, 5, 80, 14);
    const heightFt = sanitizeNumber(body.heightFt, 6, 25, 8);
    const filterCount = sanitizeNumber(body.filterCount, 4, 5, 4);
    const fanSpeed = sanitizeNumber(body.fanSpeed, 1, 3, 2);

    const performance = calculateCorsiRosenthalPerformance({
      lengthFt,
      widthFt,
      heightFt,
      filterCount,
      fanSpeed
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      inputs: { lengthFt, widthFt, heightFt, filterCount, fanSpeed },
      performance
    }));
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
