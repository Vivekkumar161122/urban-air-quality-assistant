/**
 * Low-Emission Daily Routine Planner Component.
 */

export class RoutinePlannerComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(routineData) {
    if (!this.container || !routineData) return;

    const { location, persona, baselineAqi, basePm25, timeline, summaryAdvice } = routineData;

    this.container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Low-Emission Daily Routine: ${persona.name}
            </h2>
            <div class="card-subtitle">
              Tailored for <strong>${location.name}</strong> at ambient AQI <strong>${baselineAqi}</strong> (Base PM2.5: ~${basePm25} µg/m³)
            </div>
          </div>
        </div>

        <div style="background: var(--color-surface-hover); border-radius: var(--radius-md); padding: 1rem 1.25rem; font-size: 0.9rem; margin-bottom: 1.5rem; border-left: 4px solid var(--color-primary);">
          ${summaryAdvice}
        </div>

        <div class="timeline-container" role="feed" aria-label="Hourly low emission daily timeline">
          ${timeline.map(item => {
            let cardClass = 'moderate';
            if (item.period.includes('Peak') || item.period.includes('Trap')) cardClass = 'hazard';
            else if (item.period.includes('Mixing') || item.period.includes('Solar')) cardClass = 'safe';

            return `
              <article class="timeline-card ${cardClass}" tabindex="0" aria-label="${item.time}: ${item.period}">
                <div class="timeline-time-badge">
                  <span>${item.time} &bull; ${item.period}</span>
                  <span style="font-weight: 700;">Est. PM2.5 ~${item.hourlyEstimatedPm25} µg/m³</span>
                </div>

                <h3 class="timeline-action-title">${item.routineAction}</h3>

                <div class="timeline-sustainable-box">
                  <strong>🌱 Low-Emission Sustainable Choice:</strong> ${item.sustainableAlternative}
                </div>

                <div class="timeline-impact-pill">
                  🎯 Direct Impact: ${item.impactNote}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
}
