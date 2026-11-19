/**
 * Accessibility (a11y) and HTML DOM Structure Tests.
 * Inspects public/index.html to ensure conformance with WCAG 2.1 AA landmarks,
 * label associations, ARIA roles, and keyboard skip links.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

test('a11y - Skip to main content link', () => {
  assert.ok(htmlContent.includes('class="skip-link"'), 'Must have skip-link class');
  assert.ok(htmlContent.includes('href="#main-content"'), 'Skip link must target #main-content');
  assert.ok(htmlContent.includes('id="main-content"'), '<main> must have id="main-content"');
  assert.ok(htmlContent.includes('tabindex="-1"'), '<main> must have tabindex="-1" to receive programmatic focus');
});

test('a11y - Semantic landmark elements present', () => {
  assert.ok(htmlContent.includes('<header class="app-header">'), 'Must include <header>');
  assert.ok(htmlContent.includes('<nav class="app-nav"'), 'Must include <nav>');
  assert.ok(htmlContent.includes('<main'), 'Must include <main>');
  assert.ok(htmlContent.includes('<footer class="app-footer">'), 'Must include <footer>');
  assert.ok(htmlContent.includes('<dialog'), 'Must include native accessible <dialog>');
});

test('a11y - ARIA tablist and tabpanel pairing', () => {
  assert.ok(htmlContent.includes('role="tablist"'), 'Navigation container must declare role="tablist"');
  assert.ok(htmlContent.includes('role="tab"'), 'Tab buttons must have role="tab"');
  assert.ok(htmlContent.includes('role="tabpanel"'), 'Sections must declare role="tabpanel"');
  assert.ok(htmlContent.includes('aria-selected="true"'), 'Active tab must indicate aria-selected="true"');
  assert.ok(htmlContent.includes('aria-controls="view-dashboard"'), 'Tab must declare aria-controls for its panel');
});

test('a11y - Alert banner declares assertive live region', () => {
  assert.ok(htmlContent.includes('role="alert"'), 'Smog alert banner must declare role="alert"');
  assert.ok(htmlContent.includes('aria-live="assertive"'), 'Smog alert banner must declare aria-live="assertive"');
});

test('a11y - Form controls in dialog have associated labels', () => {
  assert.ok(htmlContent.includes('for="setting-location"'), 'Location select must have associated label');
  assert.ok(htmlContent.includes('id="setting-location"'), 'Location select must have matching id');

  assert.ok(htmlContent.includes('for="setting-persona"'), 'Persona select must have associated label');
  assert.ok(htmlContent.includes('id="setting-persona"'), 'Persona select must have matching id');

  assert.ok(htmlContent.includes('for="setting-api-key"'), 'API key input must have associated label');
  assert.ok(htmlContent.includes('id="setting-api-key"'), 'API key input must have matching id');
});

test('a11y - Modal dialog is properly labeled', () => {
  assert.ok(htmlContent.includes('id="settings-dialog"'));
  assert.ok(htmlContent.includes('aria-labelledby="settings-title"'));
  assert.ok(htmlContent.includes('id="settings-title"'));
});
