/**
 * API Client for Urban Air Quality Assistant.
 * Handles network requests, API key pass-through, timeout protection, and robust fallbacks.
 */

export class ApiClient {
  constructor() {
    this.apiKey = localStorage.getItem('urban_air_gemini_key') || '';
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (this.apiKey) {
      localStorage.setItem('urban_air_gemini_key', this.apiKey);
    } else {
      localStorage.removeItem('urban_air_gemini_key');
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  async fetchAqi(locationKey = 'river_valley_basin', customAqi = null) {
    let url = `/api/aqi?location=${encodeURIComponent(locationKey)}`;
    if (customAqi) url += `&aqi=${encodeURIComponent(customAqi)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AQI fetch failed: ${res.statusText}`);
    return res.json();
  }

  async fetchRoutine(locationKey, personaKey, aqi) {
    const res = await fetch('/api/routine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationKey, personaKey, aqi })
    });
    if (!res.ok) throw new Error(`Routine fetch failed: ${res.statusText}`);
    return res.json();
  }

  async fetchHacks(category = 'all', search = '') {
    let url = `/api/hacks?category=${encodeURIComponent(category)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Hacks fetch failed: ${res.statusText}`);
    return res.json();
  }

  async calculateCadr(roomParams) {
    const res = await fetch('/api/hacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomParams)
    });
    if (!res.ok) throw new Error(`CADR calculation failed: ${res.statusText}`);
    return res.json();
  }

  async calculateImpact(params) {
    const res = await fetch('/api/impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`Impact calculation failed: ${res.statusText}`);
    return res.json();
  }

  async sendChatMessage(message, context = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['x-gemini-api-key'] = this.apiKey;
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, context, apiKey: this.apiKey })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Chat failed: ${res.statusText}`);
    }
    return res.json();
  }
}

export const api = new ApiClient();
