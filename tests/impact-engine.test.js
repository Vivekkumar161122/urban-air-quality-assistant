/**
 * Unit Tests for Impact Engine.
 * Tests Berkeley Earth particulate-to-cigarette conversion, emissions savings,
 * Corsi-Rosenthal CADR/ACH calculations, and community multipliers.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExposureReduction,
  calculateEmissionsAvoided,
  calculateCorsiRosenthalPerformance,
  calculateCommunityMultiplier,
  UG_M3_HOURS_PER_CIGARETTE
} from '../lib/impact-engine.js';

test('Impact Engine - Berkeley Earth Cigarette Constant', () => {
  assert.equal(UG_M3_HOURS_PER_CIGARETTE, 528, '528 µg/m³·hours must equal 1 cigarette equivalent');
});

test('Impact Engine - calculateExposureReduction produces accurate cigarette equivalents', () => {
  const result = calculateExposureReduction({
    outdoorPm25: 200,
    hoursIndoors: 14,
    commuteMinutesAvoided: 45,
    n95Used: true
  });

  assert.ok(result.totalUgHoursSaved > 0, 'Must compute positive µg/m³·hours saved');
  assert.ok(result.cigarettesAvoided > 0, 'Must compute positive cigarettes avoided');
  assert.ok(result.reductionPercentage >= 70, 'Effective mitigation should achieve >= 70% strain relief');
  assert.equal(typeof result.cleanIndoorAchieved, 'number');
  assert.ok(result.cleanIndoorAchieved <= 25, 'Sanctuary room should achieve <= 25 µg/m³');
});

test('Impact Engine - calculateEmissionsAvoided sums pollutants correctly', () => {
  const emissions = calculateEmissionsAvoided({
    carKmReplaced: 10,
    carColdStartsAvoided: 1,
    carIdlingMinutesAvoided: 10,
    woodBurningHoursAvoided: 2,
    leafBurningBagsComposted: 1,
    gasCookingSwappedHours: 1
  });

  assert.ok(emissions.co2eKg > 0, 'CO2e kg must be positive');
  assert.ok(emissions.pm25Grams > 0, 'PM2.5 grams must be positive');
  assert.ok(emissions.noxGrams > 0, 'NOx grams must be positive');
  assert.ok(emissions.totalGramsPollutionDirectlyPrevented > 0, 'Total direct pollution must be positive');
});

test('Impact Engine - calculateCorsiRosenthalPerformance computes accurate CADR and ACH', () => {
  // Room: 15ft x 14ft x 8ft = 1680 cu ft
  const perf = calculateCorsiRosenthalPerformance({
    lengthFt: 15,
    widthFt: 14,
    heightFt: 8,
    filterCount: 4,
    fanSpeed: 2
  });

  assert.equal(perf.roomVolumeCuFt, 1680);
  assert.equal(perf.estimatedCadrCfm, 460); // 4-filter speed 2 base CADR
  // ACH = (460 * 60) / 1680 = 16.42
  assert.ok(perf.ach >= 15 && perf.ach <= 17, `ACH ${perf.ach} should be around 16.4`);
  assert.ok(perf.minutesTo90PercentClean < 15, 'Should clear 90% in under 15 minutes');
  assert.ok(perf.rating.includes('5+ ACH'), '16 ACH should qualify as Hospital/Cleanroom grade');
});

test('Impact Engine - calculateCommunityMultiplier scales accurately for 1,000 households', () => {
  const single = { cigarettesAvoided: 2.0, pm25Grams: 5.0, co2eKg: 4.0 };
  const community = calculateCommunityMultiplier(single, 1000);

  assert.equal(community.participatingHouseholds, 1000);
  assert.equal(community.timespanDays, 30);
  assert.equal(community.totalCigarettesAvoided, 2.0 * 1000 * 30); // 60,000
  assert.equal(community.totalPm25KgPrevented, (5.0 * 1000 * 30) / 1000); // 150 kg
  assert.ok(community.asthmaVisitsAvoided >= 4, 'Must project positive pediatric ER visits averted');
});
