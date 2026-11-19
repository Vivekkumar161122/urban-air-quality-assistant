/**
 * Direct Impact Calculator & Community Multiplier Component.
 */

import { api } from '../utils/api-client.js';

export class ImpactCalculatorComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async init(initialAqi = 185) {
    this.render(initialAqi);
    this.attachEvents();
    await this.recalculate();
  }

  render(initialAqi) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="card impact-meter-card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Direct Impact & Community Multiplier Calculator
            </h2>
            <div class="card-subtitle">
              Transparent, scientifically grounded accounting of inhaled particulate averted and emissions curtailed.
            </div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Interactive Parameter Sliders -->
          <div>
            <div class="slider-wrapper">
              <div class="slider-label-row">
                <label for="slider-aqi">Outdoor Ambient PM2.5 (µg/m³)</label>
                <span id="label-aqi">${Math.round(initialAqi * 0.75)} µg/m³</span>
              </div>
              <input type="range" id="slider-aqi" class="range-slider" min="30" max="600" value="${Math.round(initialAqi * 0.75)}">
            </div>

            <div class="slider-wrapper">
              <div class="slider-label-row">
                <label for="slider-hours">Filtered Indoor Sanctuary Hours / Day</label>
                <span id="label-hours">14 hours</span>
              </div>
              <input type="range" id="slider-hours" class="range-slider" min="4" max="24" value="14">
            </div>

            <div class="slider-wrapper">
              <div class="slider-label-row">
                <label for="slider-commute">Peak Smog Commute Shifted / Avoided (mins)</label>
                <span id="label-commute">45 mins</span>
              </div>
              <input type="range" id="slider-commute" class="range-slider" min="0" max="180" step="5" value="45">
            </div>

            <div class="slider-wrapper">
              <div class="slider-label-row">
                <label for="slider-car-km">Car Commute Replaced / Carpooled (km)</label>
                <span id="label-car-km">12 km</span>
              </div>
              <input type="range" id="slider-car-km" class="range-slider" min="0" max="60" value="12">
            </div>

            <div class="slider-wrapper">
              <div class="slider-label-row">
                <label for="slider-wood-hours">Wood Stove / Fireplace Burning Curtailed (hrs)</label>
                <span id="label-wood-hours">2 hrs</span>
              </div>
              <input type="range" id="slider-wood-hours" class="range-slider" min="0" max="8" value="2">
            </div>

            <div class="slider-wrapper">
              <div class="slider-label-row">
                <label for="slider-community">Participating Community Households</label>
                <span id="label-community">1,000 homes</span>
              </div>
              <input type="range" id="slider-community" class="range-slider" min="10" max="10000" step="50" value="1000">
            </div>
          </div>

          <!-- Real-Time Metrics Display -->
          <div>
            <div class="cigarette-meter-box" role="status" aria-live="polite">
              <div id="cig-number" class="cigarette-hero-number">1.8</div>
              <div class="cigarette-hero-desc">Equivalent Cigarettes of Toxic PM2.5 Inhalation Avoided per Person Daily</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem;">
                Based on Berkeley Earth atmospheric epidemiology: 22 µg/m³ PM2.5 for 24h ≈ 1 cigarette.
              </div>
            </div>

            <div class="grid-2" style="margin-bottom: 1rem;">
              <div class="card" style="padding: 1rem; text-align: center;">
                <div class="submetric-label">Direct PM2.5 Exposure Cut</div>
                <div id="metric-strain-relief" style="font-size: 1.8rem; font-weight: 800; color: var(--color-success);">82%</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Lower respiratory strain</div>
              </div>
              <div class="card" style="padding: 1rem; text-align: center;">
                <div class="submetric-label">Family Emissions Curtailed</div>
                <div id="metric-emissions-co2" style="font-size: 1.8rem; font-weight: 800; color: var(--color-primary);">6.0 kg</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">CO2e daily kept from sky</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Community Scale Table -->
        <div style="margin-top: 1.5rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">
            🏘️ Community Multiplier: Collective 30-Day Winter Smog Wave Impact
          </h3>
          <div class="community-table-container">
            <table class="responsive-table" aria-label="Community impact scaling table">
              <thead>
                <tr>
                  <th scope="col">Households</th>
                  <th scope="col">Total Cigarettes Averted</th>
                  <th scope="col">PM2.5 Prevented from Air</th>
                  <th scope="col">CO2e Emissions Cut</th>
                  <th scope="col">Pediatric ER Visits Prevented</th>
                </tr>
              </thead>
              <tbody id="community-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const sliders = [
      'slider-aqi',
      'slider-hours',
      'slider-commute',
      'slider-car-km',
      'slider-wood-hours',
      'slider-community'
    ];

    sliders.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          this.updateSliderLabels();
          this.recalculate();
        });
      }
    });
  }

  updateSliderLabels() {
    const aqi = document.getElementById('slider-aqi')?.value;
    const hours = document.getElementById('slider-hours')?.value;
    const commute = document.getElementById('slider-commute')?.value;
    const carKm = document.getElementById('slider-car-km')?.value;
    const wood = document.getElementById('slider-wood-hours')?.value;
    const comm = document.getElementById('slider-community')?.value;

    if (document.getElementById('label-aqi')) document.getElementById('label-aqi').textContent = `${aqi} µg/m³`;
    if (document.getElementById('label-hours')) document.getElementById('label-hours').textContent = `${hours} hours`;
    if (document.getElementById('label-commute')) document.getElementById('label-commute').textContent = `${commute} mins`;
    if (document.getElementById('label-car-km')) document.getElementById('label-car-km').textContent = `${carKm} km`;
    if (document.getElementById('label-wood-hours')) document.getElementById('label-wood-hours').textContent = `${wood} hrs`;
    if (document.getElementById('label-community')) document.getElementById('label-community').textContent = `${Number(comm).toLocaleString()} homes`;
  }

  async recalculate() {
    const outdoorPm25 = Number(document.getElementById('slider-aqi')?.value) || 160;
    const hoursIndoors = Number(document.getElementById('slider-hours')?.value) || 14;
    const commuteMinutesAvoided = Number(document.getElementById('slider-commute')?.value) || 45;
    const carKmReplaced = Number(document.getElementById('slider-car-km')?.value) || 12;
    const woodBurningHoursAvoided = Number(document.getElementById('slider-wood-hours')?.value) || 2;
    const participatingHouseholds = Number(document.getElementById('slider-community')?.value) || 1000;

    try {
      const data = await api.calculateImpact({
        outdoorPm25,
        hoursIndoors,
        commuteMinutesAvoided,
        carKmReplaced,
        woodBurningHoursAvoided,
        participatingHouseholds
      });

      const exp = data.exposure;
      const em = data.emissions;
      const comm = data.community;

      const cigEl = document.getElementById('cig-number');
      const strainEl = document.getElementById('metric-strain-relief');
      const co2El = document.getElementById('metric-emissions-co2');

      if (cigEl) cigEl.textContent = exp.cigarettesAvoided;
      if (strainEl) strainEl.textContent = `${exp.reductionPercentage}%`;
      if (co2El) co2El.textContent = `${em.co2eKg} kg`;

      // Render community comparison rows
      const tbody = document.getElementById('community-table-body');
      if (tbody) {
        const scales = [1, 50, 250, participatingHouseholds];
        tbody.innerHTML = scales.map(count => {
          const totalCigs = Math.round(exp.cigarettesAvoided * count * 30);
          const totalPm25Kg = Number(((em.pm25Grams * count * 30) / 1000).toFixed(1));
          const totalCo2Tons = Number(((em.co2eKg * count * 30) / 1000).toFixed(1));
          const erVisits = Math.max(1, Math.round(totalPm25Kg * 0.028));

          return `
            <tr>
              <td><strong>${count.toLocaleString()} family${count > 1 ? 's' : ''}</strong></td>
              <td>${totalCigs.toLocaleString()} cigs avoided</td>
              <td>${totalPm25Kg.toLocaleString()} kg PM2.5 prevented</td>
              <td>${totalCo2Tons.toLocaleString()} metric tons CO2</td>
              <td><span style="color: var(--color-success); font-weight: 700;">~${erVisits} emergency visits averted</span></td>
            </tr>
          `;
        }).join('');
      }
    } catch (err) {
      console.warn('Impact recalculation error:', err);
    }
  }
}
