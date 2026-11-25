/**
 * Security and sanitization utilities for Urban Air Quality Assistant.
 * Provides CSP headers, input sanitization, rate limiting, and safe payload validation.
 */

// Basic in-memory rate limiter for serverless & local server
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 req/min per IP

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

/**
 * Strips dangerous HTML/script characters to prevent XSS attacks.
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Validates and constrains numeric inputs within bounds.
 * @param {any} val 
 * @param {number} min 
 * @param {number} max 
 * @param {number} fallback 
 * @returns {number}
 */
export function sanitizeNumber(val, min = 0, max = 10000, fallback = 0) {
  const num = Number(val);
  if (Number.isNaN(num) || !Number.isFinite(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}

/**
 * Standard Security Headers applied to all HTTP responses.
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * Checks if a client IP has exceeded the request threshold.
 * @param {string} ip 
 * @returns {{ allowed: boolean, remaining: number, resetInMs: number }}
 */
export function checkRateLimit(ip = 'anonymous') {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, startTime: now };

  if (now - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
    clientData.count = 1;
    clientData.startTime = now;
    rateLimitMap.set(ip, clientData);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInMs: RATE_LIMIT_WINDOW_MS };
  }

  clientData.count += 1;
  rateLimitMap.set(ip, clientData);

  const allowed = clientData.count <= MAX_REQUESTS_PER_WINDOW;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - clientData.count);
  const resetInMs = Math.max(0, RATE_LIMIT_WINDOW_MS - (now - clientData.startTime));

  // Periodic cleanup of stale IPs to prevent memory leaks
  if (rateLimitMap.size > 5000) {
    for (const [key, data] of rateLimitMap.entries()) {
      if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }

  return { allowed, remaining, resetInMs };
}

/**
 * Safely parses JSON body with size and structure guards.
 * @param {string} rawBody 
 * @param {number} maxBytes 
 * @returns {any}
 */
export function parseSafeJson(rawBody, maxBytes = 1024 * 512) {
  if (!rawBody) return {};
  if (typeof rawBody === 'object') return rawBody;
  if (typeof rawBody === 'string' && rawBody.length > maxBytes) {
    throw new Error('Payload too large: maximum size is 512KB');
  }
  try {
    return JSON.parse(rawBody);
  } catch (err) {
    throw new Error('Invalid JSON format');
  }
}
