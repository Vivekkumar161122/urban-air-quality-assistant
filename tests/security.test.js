/**
 * Unit Tests for Security Utilities.
 * Tests sanitization, XSS mitigation, rate limiting, and safe JSON parsing.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeString,
  sanitizeNumber,
  checkRateLimit,
  parseSafeJson,
  SECURITY_HEADERS
} from '../lib/security.js';

test('Security - sanitizeString neutralizes HTML and script tags', () => {
  const dirty = '<script>alert("XSS")</script>&<img src="x" onerror="steal()"/>';
  const clean = sanitizeString(dirty);

  assert.ok(!clean.includes('<script>'), 'Must escape opening script tags');
  assert.ok(!clean.includes('</script>'), 'Must escape closing script tags');
  assert.ok(clean.includes('&lt;script&gt;'), 'Must encode < and >');
  assert.ok(clean.includes('&amp;'), 'Must encode &');
});

test('Security - sanitizeNumber enforces bounds and fallbacks', () => {
  assert.equal(sanitizeNumber(25, 0, 100, 10), 25);
  assert.equal(sanitizeNumber(-50, 0, 100, 10), 0, 'Must clamp to min');
  assert.equal(sanitizeNumber(500, 0, 100, 10), 100, 'Must clamp to max');
  assert.equal(sanitizeNumber('invalid-string', 0, 100, 15), 15, 'Must return fallback for NaN');
  assert.equal(sanitizeNumber(null, 0, 100, 15), 0, 'Number(null) is 0 which is clamped');
});

test('Security - checkRateLimit throttles excessive requests', () => {
  const testIp = '192.168.1.99';
  let lastResult = null;

  // Simulate 60 allowed requests
  for (let i = 0; i < 60; i++) {
    lastResult = checkRateLimit(testIp);
    assert.equal(lastResult.allowed, true, `Request ${i+1} should be allowed`);
  }

  // 61st request should be rejected
  const throttledResult = checkRateLimit(testIp);
  assert.equal(throttledResult.allowed, false, '61st request in 1 minute window must be blocked');
  assert.equal(throttledResult.remaining, 0);
});

test('Security - parseSafeJson handles valid JSON and guards against overflows', () => {
  const valid = '{"message":"hello world","aqi":185}';
  const parsed = parseSafeJson(valid);
  assert.equal(parsed.message, 'hello world');
  assert.equal(parsed.aqi, 185);

  assert.throws(() => {
    parseSafeJson('{invalid:json}');
  }, /Invalid JSON format/);

  // Payload too large check
  const hugePayload = 'x'.repeat(1024 * 600); // 600KB > 512KB limit
  assert.throws(() => {
    parseSafeJson(hugePayload);
  }, /Payload too large/);
});

test('Security - SECURITY_HEADERS includes mandatory protection headers', () => {
  assert.ok(SECURITY_HEADERS['Content-Security-Policy'], 'Must include CSP header');
  assert.equal(SECURITY_HEADERS['X-Content-Type-Options'], 'nosniff');
  assert.equal(SECURITY_HEADERS['X-Frame-Options'], 'DENY');
  assert.equal(SECURITY_HEADERS['X-XSS-Protection'], '1; mode=block');
  assert.equal(SECURITY_HEADERS['Referrer-Policy'], 'strict-origin-when-cross-origin');
});
