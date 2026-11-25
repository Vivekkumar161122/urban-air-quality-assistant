/**
 * Serverless / Local API Endpoint: GET / POST /api/hacks
 * Serves verified Indoor Air Quality hacks and calculates dynamic Corsi-Rosenthal room CADR.
 */

import { IAQ_HACKS, IAQ_CATEGORIES } from '../lib/iaq-knowledge.js';
import { calculateCorsiRosenthalPerformance } from '../lib/impact-engine.js';
import {
  HttpError,
  applySecurityHeaders,
  handleCorsPreflight,
  readJsonBody,
  sendJson,
  sendMethodNotAllowed
} from '../lib/http.js';
import { sanitizeNumber } from '../lib/security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (handleCorsPreflight(req, res, { methods: 'GET, POST, OPTIONS' })) {
    return;
  }

  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let filtered = [...IAQ_HACKS];

    if (category && category !== 'all') {
      filtered = filtered.filter((h) => h.category === category);
    }

    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((h) =>
        h.title.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        h.scientificImpact.toLowerCase().includes(q)
      );
    }

    return sendJson(res, 200, {
      categories: IAQ_CATEGORIES,
      count: filtered.length,
      hacks: filtered
    });
  }

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);

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

      return sendJson(res, 200, {
        inputs: { lengthFt, widthFt, heightFt, filterCount, fanSpeed },
        performance
      });
    } catch (err) {
      if (err instanceof HttpError) {
        return sendJson(res, err.statusCode, { error: err.message });
      }
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendMethodNotAllowed(res, ['GET', 'POST']);
}
