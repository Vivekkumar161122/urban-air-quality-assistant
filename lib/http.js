/**
 * Shared HTTP utilities for API handlers and local server.
 * Centralizes security headers, CORS preflight handling, JSON responses,
 * client IP extraction, and size-bounded JSON body parsing.
 */

import { SECURITY_HEADERS, parseSafeJson } from './security.js';

const DEFAULT_MAX_BODY_BYTES = 1024 * 512; // 512KB

/**
 * Error with an associated HTTP status code for clean API error responses.
 */
export class HttpError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   */
  constructor(statusCode, message) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

/**
 * Applies standard security headers to an HTTP response.
 * @param {import('node:http').ServerResponse} res
 */
export function applySecurityHeaders(res) {
  for (const [key, val] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, val);
  }
}

/**
 * Sends a JSON response with the given HTTP status code.
 * @param {import('node:http').ServerResponse} res
 * @param {number} statusCode
 * @param {unknown} payload
 */
export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(payload));
}

/**
 * Handles CORS preflight (OPTIONS) requests. Returns true if handled.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {Object} [options]
 * @param {string} [options.methods='GET, POST, OPTIONS']
 * @param {string} [options.headers='Content-Type']
 * @returns {boolean}
 */
export function handleCorsPreflight(req, res, {
  methods = 'GET, POST, OPTIONS',
  headers = 'Content-Type'
} = {}) {
  if (req.method !== 'OPTIONS') return false;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', headers);
  res.statusCode = 204;
  res.end();
  return true;
}

/**
 * Sends a standardized 405 Method Not Allowed JSON response.
 * @param {import('node:http').ServerResponse} res
 * @param {string[]} allowedMethods
 */
export function sendMethodNotAllowed(res, allowedMethods) {
  res.setHeader('Allow', allowedMethods.join(', '));
  return sendJson(res, 405, {
    error: `Method Not Allowed. Use ${allowedMethods.join(' or ')}.`
  });
}

/**
 * Extracts the client IP address from request headers or socket.
 * @param {import('node:http').IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'local';
}

/**
 * Reads and parses a JSON request body from either a pre-parsed `req.body`
 * or a Node.js readable stream, enforcing a strict byte-size limit.
 * @param {import('node:http').IncomingMessage & { body?: unknown }} req
 * @param {number} [maxBytes=524288]
 * @returns {Promise<Record<string, any>>}
 */
export async function readJsonBody(req, maxBytes = DEFAULT_MAX_BODY_BYTES) {
  let raw = req.body;

  if (raw === undefined && req.readable) {
    const chunks = [];
    let totalBytes = 0;

    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      totalBytes += buf.length;
      if (totalBytes > maxBytes) {
        throw new HttpError(413, 'Payload too large: maximum size is 512KB');
      }
      chunks.push(buf);
    }

    raw = Buffer.concat(chunks).toString('utf-8');
  }

  try {
    const parsed = parseSafeJson(raw, maxBytes);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    const status = err.message.startsWith('Payload too large') ? 413 : 400;
    throw new HttpError(status, err.message);
  }
}
