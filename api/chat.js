/**
 * Serverless / Local API Endpoint: POST /api/chat
 * Handles conversational inquiries with Google Gemini and the Local Smog Engine.
 */

import { askGeminiOrLocalAssistant } from '../lib/gemini.js';
import { sanitizeString, sanitizeNumber, checkRateLimit, SECURITY_HEADERS, parseSafeJson } from '../lib/security.js';

export default async function handler(req, res) {
  // Apply Security Headers
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local';
  const rate = checkRateLimit(clientIp);
  if (!rate.allowed) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'Rate limit exceeded. Please wait a moment before sending more queries.',
      retryAfterMs: rate.resetInMs
    }));
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = parseSafeJson(body);
    } else if (!body && req.readable) {
      // Stream reading if unparsed
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = parseSafeJson(Buffer.concat(buffers).toString('utf-8'));
    }

    body = body || {};

    const rawMessage = body.message || '';
    if (!rawMessage || typeof rawMessage !== 'string' || rawMessage.trim().length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Missing required field: "message"' }));
    }

    // Header or body key
    const customApiKey = req.headers['x-gemini-api-key'] || body.apiKey || null;

    const context = {
      locationKey: sanitizeString(body.context?.locationKey || 'river_valley_basin'),
      personaKey: sanitizeString(body.context?.personaKey || 'family_young_children'),
      aqi: sanitizeNumber(body.context?.aqi, 10, 999, 185)
    };

    const response = await askGeminiOrLocalAssistant({
      message: rawMessage.trim(),
      context,
      apiKey: customApiKey
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(response));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'Internal processing error',
      details: err.message
    }));
  }
}
