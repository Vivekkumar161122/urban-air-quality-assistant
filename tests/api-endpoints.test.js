/**
 * Integration Tests for API Handlers.
 * Verifies that all endpoints return proper HTTP statuses, JSON payloads, and security headers.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import aqiHandler from '../api/aqi.js';
import routineHandler from '../api/routine.js';
import hacksHandler from '../api/hacks.js';
import impactHandler from '../api/impact.js';
import chatHandler from '../api/chat.js';

// Mock helper for Node HTTP response
function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
    },
    end(data) {
      this.body = data || '';
      return this;
    }
  };
}

test('API /api/aqi - GET returns complete telemetry and diurnal curve', async () => {
  const req = {
    method: 'GET',
    url: '/api/aqi?location=river_valley_basin',
    headers: { host: 'localhost' }
  };
  const res = createMockResponse();

  await aqiHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.headers['content-security-policy'], 'Must attach CSP header');
  assert.equal(res.headers['content-type'], 'application/json');

  const json = JSON.parse(res.body);
  assert.ok(json.baselineAqi > 0, 'Must have positive baseline AQI');
  assert.ok(json.hourlyCurve && json.hourlyCurve.length === 24, 'Must have 24 hourly curve slots');
  assert.ok(json.optimalVentilationWindow.includes('1:00 PM'), 'Must state solar mixing window');
});

test('API /api/routine - POST returns structured 6-phase daily routine', async () => {
  const req = {
    method: 'POST',
    url: '/api/routine',
    headers: { host: 'localhost' },
    body: {
      locationKey: 'river_valley_basin',
      personaKey: 'family_young_children',
      aqi: 220
    }
  };
  const res = createMockResponse();

  await routineHandler(req, res);

  assert.equal(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.equal(json.persona.id, 'family_young_children');
  assert.equal(json.location.id, 'river_valley_basin');
  assert.ok(json.timeline.length >= 5, 'Must provide full day timeline phases');
  assert.ok(json.timeline[0].sustainableAlternative, 'Each phase must have sustainable alternative');
});

test('API /api/hacks - GET returns verified hacks and POST calculates CADR', async () => {
  // 1. GET hacks
  const reqGet = {
    method: 'GET',
    url: '/api/hacks?category=filtration',
    headers: { host: 'localhost' }
  };
  const resGet = createMockResponse();
  await hacksHandler(reqGet, resGet);

  assert.equal(resGet.statusCode, 200);
  const getJson = JSON.parse(resGet.body);
  assert.ok(getJson.hacks.length > 0);
  assert.equal(getJson.hacks[0].category, 'filtration');

  // 2. POST CADR calculation
  const reqPost = {
    method: 'POST',
    url: '/api/hacks',
    headers: { host: 'localhost' },
    body: {
      lengthFt: 18,
      widthFt: 15,
      heightFt: 9,
      filterCount: 5,
      fanSpeed: 3
    }
  };
  const resPost = createMockResponse();
  await hacksHandler(reqPost, resPost);

  assert.equal(resPost.statusCode, 200);
  const postJson = JSON.parse(resPost.body);
  assert.ok(postJson.performance.estimatedCadrCfm >= 500, '5-filter speed 3 CADR should be >= 500 CFM');
  assert.ok(postJson.performance.ach > 0);
});

test('API /api/impact - POST calculates exposure and community scale', async () => {
  const req = {
    method: 'POST',
    url: '/api/impact',
    headers: { host: 'localhost' },
    body: {
      outdoorPm25: 180,
      hoursIndoors: 16,
      commuteMinutesAvoided: 50,
      carKmReplaced: 15,
      participatingHouseholds: 2500
    }
  };
  const res = createMockResponse();
  await impactHandler(req, res);

  assert.equal(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.ok(json.exposure.cigarettesAvoided > 0);
  assert.ok(json.emissions.co2eKg > 0);
  assert.equal(json.community.participatingHouseholds, 2500);
  assert.ok(json.methodology.citation.includes('Berkeley Earth'));
});

test('API /api/chat - POST handles message and returns synthesis with suggestions', async () => {
  const req = {
    method: 'POST',
    url: '/api/chat',
    headers: { host: 'localhost', 'x-forwarded-for': '127.0.0.1' },
    body: {
      message: 'What is the best way to seal drafty balcony doors in winter?',
      context: { locationKey: 'river_valley_basin', personaKey: 'apartment_renter', aqi: 180 }
    }
  };
  const res = createMockResponse();
  await chatHandler(req, res);

  assert.equal(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.ok(json.reply && json.reply.length > 50);
  assert.ok(json.suggestions && json.suggestions.length > 0);
  assert.ok(json.source, 'Response must identify source engine');
});
