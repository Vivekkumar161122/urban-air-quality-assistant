/**
 * AQI Dial and Diurnal Thermal Inversion Visualization Component.
 */

export class AqiDialComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(data) {
    if (!this.container || !data) return;

    const { baselineAqi, basePm25, category, color, healthSummary, hourlyCurve, location } = data;

    // SVG Circle perimeter for r=70: 2 * PI * 70 ≈ 439.8
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    // Map AQI (0 to 500) to dash offset
    const clampedAqi = Math.min(500, Math.max(0, baselineAqi));
    const offset = circumference - (clampedAqi / 500) * circumference;

    this.container.innerHTML = `
      <div class="card aqi-hero-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 3"/>
              </svg>
              Winter Air Quality Telemetry & Diurnal Inversion
            </h2>
            <div class="card-subtitle">Atmospheric basin profile: <strong>${location.name}</strong></div>
          </div>
          <span class="aqi-status-badge" style="background-color: ${color};" role="status">
            ${category}
          </span>
        </div>

        <div class="aqi-display-group">
          <div class="aqi-gauge-wrapper" aria-label="Current Air Quality Index: ${baselineAqi}, status ${category}">
            <svg class="aqi-circular-svg" viewBox="0 0 170 170" aria-hidden="true">
              <circle class="aqi-circle-bg" cx="85" cy="85" r="${radius}" />
              <circle
                class="aqi-circle-val"
                cx="85"
                cy="85"
                r="${radius}"
                stroke="${color}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
              />
            </svg>
            <div class="aqi-number-container">
              <div class="aqi-large-number" style="color: ${color};">${baselineAqi}</div>
              <div class="aqi-unit-label">US AQI</div>
            </div>
          </div>

          <div class="aqi-meta-details">
            <p class="aqi-explanation-text">${healthSummary}</p>
            <div class="aqi-submetrics">
              <div class="submetric-item">
                <span class="submetric-label">PM2.5 Ambient</span>
                <span class="submetric-val">${basePm25} µg/m³</span>
              </div>
              <div class="submetric-item">
                <span class="submetric-label">Optimal Flush Window</span>
                <span class="submetric-val" style="color: var(--color-success);">1:00 PM - 3:30 PM</span>
              </div>
              <div class="submetric-item">
                <span class="submetric-label">Peak Smog Trap</span>
                <span class="submetric-val" style="color: var(--color-danger);">06:00 - 09:30 AM</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Diurnal Inversion Curve Bar Chart -->
        <div class="inversion-chart-container">
          <div class="chart-title-row">
            <span>Hourly Atmospheric Inversion Profile (00:00 - 23:00)</span>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">
              🟢 Clean Solar Mixing (13-15h) &nbsp;|&nbsp; 🔴 Stagnant Ground Lid (06-09h)
            </span>
          </div>

          <div class="chart-bars-scroll" role="region" aria-label="24-hour diurnal smog curve">
            ${hourlyCurve.map(hour => {
              // Calculate relative bar height percentage (max PM approx 350)
              const heightPct = Math.min(100, Math.max(12, Math.round((hour.pm25 / 350) * 100)));
              let barClass = 'moderate-window';
              if (hour.isOptimalVentilation) barClass = 'safe-window';
              else if (hour.isHazardousPeak) barClass = 'hazard-window';

              return `
                <div class="chart-bar-column" title="${hour.timeLabel}: Est PM2.5 ${hour.pm25} µg/m³, Boundary Layer ${hour.boundaryLayerMeters}m. ${hour.advice}">
                  <div class="chart-bar-fill ${barClass}" style="height: ${heightPct}%;"></div>
                  <div class="chart-hour-label">${hour.hour}h</div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--color-text-muted); text-align: center;">
            Hover/focus bars for hourly boundary layer altitude and clinical advice.
          </div>
        </div>
      </div>
    `;
  }
}
