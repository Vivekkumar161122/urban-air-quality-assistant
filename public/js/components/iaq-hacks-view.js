/**
 * Indoor Air Quality (IAQ) Hacks View and Corsi-Rosenthal Calculator Component.
 */

import { api } from '../utils/api-client.js';

export class IaqHacksViewComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.hacks = [];
    this.categories = [];
  }

  async init() {
    try {
      const data = await api.fetchHacks(this.activeCategory, this.searchQuery);
      this.hacks = data.hacks;
      this.categories = data.categories;
      this.render();
    } catch (err) {
      console.error('Failed to load IAQ hacks:', err);
    }
  }

  setCategory(category) {
    this.activeCategory = category;
    this.init();
  }

  setSearch(query) {
    this.searchQuery = query;
    this.init();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              Verified Indoor Air Quality (IAQ) Hacks & DIY Purifier Lab
            </h2>
            <div class="card-subtitle">
              Scientifically proven, low-cost modifications to shield your home and lungs during severe winter smog.
            </div>
          </div>
        </div>

        <!-- Filter and Search Bar -->
        <div class="hack-filter-bar" role="tablist" aria-label="IAQ Hack Categories">
          ${this.categories.map(c => `
            <button
              class="filter-chip ${c.id === this.activeCategory ? 'active' : ''}"
              data-cat="${c.id}"
              role="tab"
              aria-selected="${c.id === this.activeCategory}"
            >
              ${c.label}
            </button>
          `).join('')}
        </div>

        <!-- Interactive Corsi-Rosenthal Box CADR Calculator -->
        <div class="cadr-calc-box">
          <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🧮</span> Corsi-Rosenthal Box Sizing & Air Exchange Calculator
          </h3>
          <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1rem;">
            Determine the Clean Air Delivery Rate (CADR) and Air Changes per Hour (ACH) for your specific room dimensions.
          </p>

          <form id="cadr-form" class="calc-inputs-row">
            <div class="input-field-group">
              <label for="room-length" class="input-label">Length (feet)</label>
              <input type="number" id="room-length" class="input-control" value="16" min="6" max="80" required>
            </div>
            <div class="input-field-group">
              <label for="room-width" class="input-label">Width (feet)</label>
              <input type="number" id="room-width" class="input-control" value="14" min="6" max="80" required>
            </div>
            <div class="input-field-group">
              <label for="room-height" class="input-label">Ceiling Height (ft)</label>
              <input type="number" id="room-height" class="input-control" value="8" min="6" max="25" required>
            </div>
            <div class="input-field-group">
              <label for="filter-count" class="input-label">Filters (MERV 13)</label>
              <select id="filter-count" class="input-control">
                <option value="4" selected>4-Filter Cube</option>
                <option value="5">5-Filter Comparetto Cube</option>
              </select>
            </div>
            <div class="input-field-group">
              <label for="fan-speed" class="input-label">Fan Speed</label>
              <select id="fan-speed" class="input-control">
                <option value="1">Speed 1 (Whisper / Night)</option>
                <option value="2" selected>Speed 2 (Balanced Day)</option>
                <option value="3">Speed 3 (Maximum Flush)</option>
              </select>
            </div>
          </form>

          <div id="cadr-results" class="calc-results-badge">
            <div class="calc-metric-stat">
              <span class="submetric-label">Clean Air Delivery (CADR)</span>
              <span id="cadr-val" class="calc-metric-val">460 CFM</span>
            </div>
            <div class="calc-metric-stat">
              <span class="submetric-label">Air Changes / Hour (ACH)</span>
              <span id="ach-val" class="calc-metric-val" style="color: var(--color-success);">15.3 ACH</span>
            </div>
            <div class="calc-metric-stat">
              <span class="submetric-label">90% Air Cleared Time</span>
              <span id="cleartime-val" class="calc-metric-val">9 mins</span>
            </div>
            <div class="calc-metric-stat">
              <span class="submetric-label">DIY Cost vs Commercial</span>
              <span class="calc-metric-val" style="color: var(--color-primary); font-size: 1.1rem;">$75 vs $650</span>
            </div>
          </div>
        </div>

        <!-- Hacks Cards Grid -->
        <div class="grid-2" style="margin-top: 1.5rem;" role="feed">
          ${this.hacks.map(hack => `
            <article class="card hack-card" tabindex="0" aria-labelledby="hack-title-${hack.id}">
              <div>
                <div class="hack-badge-row">
                  <span class="hack-badge">${hack.category.toUpperCase()}</span>
                  <span class="hack-badge">${hack.costRating}</span>
                  <span class="hack-badge highlight">⭐ ${hack.effectiveness}</span>
                </div>
                
                <h3 id="hack-title-${hack.id}" class="card-title" style="font-size: 1.15rem; margin-bottom: 0.5rem;">
                  ${hack.title}
                </h3>
                
                <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
                  ${hack.summary}
                </p>

                <div style="font-size: 0.825rem; font-weight: 700; color: var(--color-text-main); margin-top: 0.5rem;">
                  📦 Key Materials:
                </div>
                <ul class="hack-instructions-list">
                  ${hack.materials.slice(0, 3).map(m => `<li>${m}</li>`).join('')}
                </ul>

                <div class="hack-critical-warning">
                  <strong>⚠️ Critical Engineering Rule:</strong> ${hack.criticalStep}
                </div>
              </div>

              <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border); font-size: 0.8rem; color: var(--color-text-muted);">
                🔬 <em>${hack.scientificImpact}</em>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
    this.updateCadr();
  }

  attachEvents() {
    // Category chips click
    const chips = this.container.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.setCategory(chip.getAttribute('data-cat'));
      });
    });

    // CADR form live updates
    const form = this.container.querySelector('#cadr-form');
    if (form) {
      form.addEventListener('input', () => this.updateCadr());
    }
  }

  async updateCadr() {
    const l = Number(document.getElementById('room-length')?.value) || 16;
    const w = Number(document.getElementById('room-width')?.value) || 14;
    const h = Number(document.getElementById('room-height')?.value) || 8;
    const fc = Number(document.getElementById('filter-count')?.value) || 4;
    const fs = Number(document.getElementById('fan-speed')?.value) || 2;

    try {
      const res = await api.calculateCadr({
        lengthFt: l,
        widthFt: w,
        heightFt: h,
        filterCount: fc,
        fanSpeed: fs
      });

      const p = res.performance;
      const cadrEl = document.getElementById('cadr-val');
      const achEl = document.getElementById('ach-val');
      const clearEl = document.getElementById('cleartime-val');

      if (cadrEl) cadrEl.textContent = `${p.estimatedCadrCfm} CFM`;
      if (achEl) achEl.textContent = `${p.ach} ACH`;
      if (clearEl) clearEl.textContent = `${p.minutesTo90PercentClean} mins`;
    } catch (err) {
      console.warn('CADR calculation failed:', err);
    }
  }
}
