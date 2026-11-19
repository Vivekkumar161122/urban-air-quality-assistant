/**
 * Main Application Orchestrator for Urban Air Quality Assistant.
 */

import { api } from './utils/api-client.js';
import { initLiveAnnouncers, announce } from './utils/a11y.js';
import { ModalDialog } from './components/modal-dialog.js';
import { AqiDialComponent } from './components/aqi-dial.js';
import { RoutinePlannerComponent } from './components/routine-planner.js';
import { IaqHacksViewComponent } from './components/iaq-hacks-view.js';
import { ImpactCalculatorComponent } from './components/impact-calculator.js';
import { AiChatComponent } from './components/ai-chat.js';

class UrbanAirApp {
  constructor() {
    this.currentLocation = localStorage.getItem('urban_air_location') || 'river_valley_basin';
    this.currentPersona = localStorage.getItem('urban_air_persona') || 'family_young_children';
    this.currentAqi = 285;

    // Component instances
    this.aqiDial = new AqiDialComponent('aqi-dial-mount');
    this.routinePlanner = new RoutinePlannerComponent('routine-planner-mount');
    this.iaqHacks = new IaqHacksViewComponent('iaq-hacks-mount');
    this.impactCalc = new ImpactCalculatorComponent('impact-calculator-mount');
    this.aiChat = new AiChatComponent('ai-chat-mount');

    this.settingsModal = null;
  }

  async init() {
    initLiveAnnouncers();
    this.initTheme();
    this.initNavigation();
    this.initSettingsModal();

    // Render initial views
    await this.refreshAllData();
    await this.iaqHacks.init();
    await this.impactCalc.init(this.currentAqi);
    this.aiChat.render();
    this.aiChat.setContext({
      locationKey: this.currentLocation,
      personaKey: this.currentPersona,
      aqi: this.currentAqi
    });

    announce('Urban Air Quality Assistant ready. Navigated to Dashboard.');
  }

  initTheme() {
    const savedTheme = localStorage.getItem('urban_air_theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', activeTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', `Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} mode`);
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('urban_air_theme', next);
        themeToggleBtn.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} mode`);
        announce(`Theme changed to ${next} mode`);
      });
    }
  }

  initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.view-section');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');

        // Update Tab states
        tabs.forEach(t => {
          t.setAttribute('aria-selected', 'false');
          t.classList.remove('active');
        });
        tab.setAttribute('aria-selected', 'true');
        tab.classList.add('active');

        // Switch visible section
        sections.forEach(s => {
          if (s.id === targetId) {
            s.style.display = 'block';
            s.removeAttribute('hidden');
          } else {
            s.style.display = 'none';
            s.setAttribute('hidden', '');
          }
        });

        announce(`Navigated to ${tab.textContent.trim()} section`);
      });
    });
  }

  initSettingsModal() {
    this.settingsModal = new ModalDialog('settings-dialog');

    const openBtns = document.querySelectorAll('[data-open-settings]');
    openBtns.forEach(b => b.addEventListener('click', () => {
      // Pre-populate values
      const locSelect = document.getElementById('setting-location');
      const personaSelect = document.getElementById('setting-persona');
      const apiKeyInput = document.getElementById('setting-api-key');

      if (locSelect) locSelect.value = this.currentLocation;
      if (personaSelect) personaSelect.value = this.currentPersona;
      if (apiKeyInput) apiKeyInput.value = api.getApiKey();

      this.settingsModal.open();
    }));

    const saveBtn = document.getElementById('settings-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const locSelect = document.getElementById('setting-location');
        const personaSelect = document.getElementById('setting-persona');
        const apiKeyInput = document.getElementById('setting-api-key');

        if (locSelect) {
          this.currentLocation = locSelect.value;
          localStorage.setItem('urban_air_location', this.currentLocation);
        }
        if (personaSelect) {
          this.currentPersona = personaSelect.value;
          localStorage.setItem('urban_air_persona', this.currentPersona);
        }
        if (apiKeyInput) {
          api.setApiKey(apiKeyInput.value);
        }

        this.updateProfilePill();
        this.settingsModal.close();
        await this.refreshAllData();
        announce('Settings saved and profile refreshed.');
      });
    }

    this.updateProfilePill();
  }

  updateProfilePill() {
    const pill = document.getElementById('current-profile-pill');
    if (pill) {
      const locationLabels = {
        river_valley_basin: 'River Valley (Delhi/Po/SLC)',
        urban_metro_canyon: 'Urban Canyon (NYC/London)',
        coastal_basin: 'Coastal Marine (LA/Mumbai)',
        suburban_heating_belt: 'Suburban Heating Belt'
      };
      const personaLabels = {
        family_young_children: 'Family w/ Children',
        seniors_respiratory: 'Seniors / COPD',
        commuter_transit: 'Commuters',
        apartment_renter: 'Renters',
        suburban_homeowner: 'Homeowners'
      };
      pill.textContent = `📍 ${locationLabels[this.currentLocation] || this.currentLocation} • 👤 ${personaLabels[this.currentPersona] || this.currentPersona}`;
    }
  }

  async refreshAllData() {
    try {
      const aqiData = await api.fetchAqi(this.currentLocation);
      this.currentAqi = aqiData.baselineAqi;
      this.aqiDial.render(aqiData);

      const routineData = await api.fetchRoutine(this.currentLocation, this.currentPersona, this.currentAqi);
      this.routinePlanner.render(routineData);

      this.aiChat.setContext({
        locationKey: this.currentLocation,
        personaKey: this.currentPersona,
        aqi: this.currentAqi
      });
    } catch (err) {
      console.error('Failed refreshing data:', err);
    }
  }
}

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new UrbanAirApp();
  app.init().catch(err => console.error('App init error:', err));
});
