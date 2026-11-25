/**
 * Serverless / Local API Endpoint: POST /api/chat
 * Handles conversational inquiries with Google Gemini and the Local Smog Engine.
 */

import { askGeminiOrLocalAssistant } from '../lib/gemini.js';
import {
  HttpError,
  applySecurityHeaders,
  getClientIp,
  handleCorsPreflight,
  readJsonBody,
  sendJson,
  sendMethodNotAllowed
} from '../lib/http.js';
import { sanitizeString, sanitizeNumber, checkRateLimit } from '../lib/security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (handleCorsPreflight(req, res, { methods: 'POST, OPTIONS', headers: 'Content-Type, x-gemini-api-key' })) {
    return;
  }

  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  const rate = checkRateLimit(getClientIp(req));
  if (!rate.allowed) {
    return sendJson(res, 429, {
      error: 'Rate limit exceeded. Please wait a moment before sending more queries.',
      retryAfterMs: rate.resetInMs
    });
  }

  try {
    const body = await readJsonBody(req);
    const rawMessage = body.message;

    if (typeof rawMessage !== 'string' || rawMessage.trim().length === 0) {
      return sendJson(res, 400, { error: 'Missing required field: "message"' });
    }

    const customApiKey = req.headers?.['x-gemini-api-key'] || body.apiKey || null;
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

    return sendJson(res, 200, response);
  } catch (err) {
    if (err instanceof HttpError) {
      return sendJson(res, err.statusCode, { error: err.message });
    }
    return sendJson(res, 500, {
      error: 'Internal processing error',
      details: err.message
    });
  }
}
