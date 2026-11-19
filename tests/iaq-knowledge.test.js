/**
 * Unit Tests for Indoor Air Quality Knowledge Repository.
 * Verifies accuracy of DIY instructions, scientific formulas, and myth debunking.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IAQ_HACKS, IAQ_CATEGORIES } from '../lib/iaq-knowledge.js';

test('IAQ Knowledge - IAQ_CATEGORIES completeness', () => {
  assert.ok(IAQ_CATEGORIES.length >= 7, 'Must have at least 7 distinct IAQ categories');
  const catIds = IAQ_CATEGORIES.map(c => c.id);
  assert.ok(catIds.includes('filtration'), 'Must include filtration');
  assert.ok(catIds.includes('ventilation'), 'Must include ventilation');
  assert.ok(catIds.includes('sealing'), 'Must include sealing');
  assert.ok(catIds.includes('kitchen'), 'Must include kitchen');
  assert.ok(catIds.includes('humidity'), 'Must include humidity');
  assert.ok(catIds.includes('protection'), 'Must include protection');
  assert.ok(catIds.includes('botany'), 'Must include botany');
});

test('IAQ Knowledge - Corsi-Rosenthal Box specifications', () => {
  const cr = IAQ_HACKS.find(h => h.id === 'corsi-rosenthal-box');
  assert.ok(cr, 'Corsi-Rosenthal hack must exist');
  assert.ok(cr.criticalStep.toLowerCase().includes('shroud'), 'Must highlight the circular cardboard shroud');
  assert.ok(cr.materials.some(m => m.includes('MERV 13')), 'Must specify MERV 13 or equivalent');
  assert.ok(cr.materials.some(m => m.includes('box fan')), 'Must specify 20" box fan');
});

test('IAQ Knowledge - Thermal Inversion Ventilation Timing', () => {
  const vent = IAQ_HACKS.find(h => h.id === 'thermal-inversion-ventilation');
  assert.ok(vent, 'Ventilation hack must exist');
  assert.ok(vent.summary.includes('1:00 PM') || vent.instructions.some(i => i.includes('1:00 PM')), 'Must specify peak afternoon mixing window');
  assert.ok(vent.criticalStep.toLowerCase().includes('thermal inversion'), 'Must explain meteorological inversion lid');
});

test('IAQ Knowledge - Ultrasonic Humidifier Mineral White Dust Hazard', () => {
  const humid = IAQ_HACKS.find(h => h.id === 'ultrasonic-humidifier-mineral-trap');
  assert.ok(humid, 'Humidifier hack must exist');
  assert.ok(humid.criticalStep.toLowerCase().includes('tap water'), 'Must warn against aerosolizing tap water minerals');
  assert.ok(humid.instructions.some(i => i.toLowerCase().includes('distilled water')), 'Must recommend distilled water or evaporative wick');
});

test('IAQ Knowledge - Plant Myths vs Reality', () => {
  const plants = IAQ_HACKS.find(h => h.id === 'plant-myths-vs-reality');
  assert.ok(plants, 'Plant realities hack must exist');
  assert.ok(plants.criticalStep.includes('1989 NASA Clean Air Study'), 'Must cite and contextualize NASA chamber experiment');
  assert.ok(plants.criticalStep.toLowerCase().includes('cannot replace') || plants.summary.toLowerCase().includes('not replace'), 'Must clarify plants cannot replace particulate filtration');
});
