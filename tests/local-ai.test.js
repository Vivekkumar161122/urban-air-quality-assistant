/**
 * Unit Tests for Local Gen AI Reasoning and Synthesis Engine.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLocalAiResponse } from '../lib/local-ai.js';

test('Local AI - DIY Filtration Intent', () => {
  const result = generateLocalAiResponse({
    message: 'How do I build a Corsi-Rosenthal box DIY filter?',
    context: { locationKey: 'river_valley_basin', personaKey: 'family_young_children', aqi: 220 }
  });

  assert.equal(result.metadata.intent, 'diy_filtration');
  assert.ok(result.reply.includes('Corsi-Rosenthal Box'), 'Reply must contain Corsi-Rosenthal title');
  assert.ok(result.reply.includes('MERV 13'), 'Reply must mention MERV 13');
  assert.ok(result.reply.includes('shroud'), 'Reply must explain the shroud');
  assert.ok(result.suggestions.length >= 2, 'Must include follow-up suggestions');
});

test('Local AI - Ventilation & Thermal Inversion Intent', () => {
  const result = generateLocalAiResponse({
    message: 'Is it safe to open windows in the morning for fresh air during smog?',
    context: { locationKey: 'river_valley_basin', personaKey: 'family_young_children', aqi: 190 }
  });

  assert.equal(result.metadata.intent, 'ventilation_sealing');
  assert.ok(result.reply.includes('thermal inversion') || result.reply.includes('Inversion'), 'Must explain thermal inversion');
  assert.ok(result.reply.includes('01:00') || result.reply.includes('1:00 PM'), 'Must recommend afternoon solar mixing window');
});

test('Local AI - Child Safety & Stroller Vulnerability Intent', () => {
  const result = generateLocalAiResponse({
    message: 'How do I protect my toddler from air pollution during school drop-offs?',
    context: { locationKey: 'river_valley_basin', personaKey: 'family_young_children', aqi: 250 }
  });

  assert.equal(result.metadata.intent, 'child_family_care');
  assert.ok(result.reply.includes('stroller') || result.reply.includes('Stroller'), 'Must address stroller height exhaust');
  assert.ok(result.reply.includes('50% more air'), 'Must cite child inhalation physiology');
});

test('Local AI - Plant Realities Intent', () => {
  const result = generateLocalAiResponse({
    message: 'Can spider plants and snake plants clean the winter smog in our living room?',
    context: { aqi: 200 }
  });

  assert.equal(result.metadata.intent, 'plant_realities');
  assert.ok(result.reply.includes('NASA'), 'Must address NASA study');
  assert.ok(result.reply.includes('do not replace') || result.reply.includes('never rely on them'), 'Must state plants do not replace mechanical purifiers');
});

test('Local AI - Community Scale Multiplier Intent', () => {
  const result = generateLocalAiResponse({
    message: 'What is the collective community impact if 1,000 households join our clean air effort?',
    context: { aqi: 185 }
  });

  assert.equal(result.metadata.intent, 'community_action');
  assert.ok(result.reply.includes('1,000 Participating Households'), 'Must present 1,000 households scale');
  assert.ok(result.reply.includes('asthma visits prevented') || result.reply.includes('ER asthma'), 'Must calculate pediatric ER relief');
});
