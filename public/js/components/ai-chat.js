/**
 * AI Chat Assistant Component.
 * Supports Markdown formatting, scenario prompt chips, suggestion buttons,
 * and seamless fallback between Gemini API and the Local Smog Engine.
 */

import { api } from '../utils/api-client.js';
import { announce } from '../utils/a11y.js';

export class AiChatComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.context = {
      locationKey: 'river_valley_basin',
      personaKey: 'family_young_children',
      aqi: 185
    };
    this.isProcessing = false;
  }

  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="card" style="padding: 0; overflow: hidden;">
        <div class="card-header" style="padding: 1.25rem 1.25rem 0.75rem 1.25rem; margin: 0; border-bottom: 1px solid var(--color-border);">
          <div>
            <h2 class="card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Urban Air Quality Gen AI Assistant
            </h2>
            <div class="card-subtitle">
              Powered by Google Gemini 2.5 Flash with built-in Local Offline Smog Intelligence.
            </div>
          </div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">
            Status: <span id="chat-engine-status" style="color: var(--color-success); font-weight: 700;">Ready</span>
          </div>
        </div>

        <div class="chat-window">
          <div id="chat-messages-list" class="chat-messages" role="log" aria-live="polite" aria-atomic="false">
            <div class="chat-bubble assistant">
              <p>Hello! I am your <strong>Urban Air Quality Assistant</strong>. I am trained to help families navigate severe winter smog, thermal inversions, and high PM2.5 levels.</p>
              <p style="margin-top: 0.5rem;">How can I assist your household or community today? Select a scenario below or type any question.</p>
            </div>
          </div>

          <!-- Scenario Quick Prompts -->
          <div class="scenario-chips-row" role="toolbar" aria-label="Quick Smog Scenario Prompts">
            <button class="scenario-chip" data-prompt="How do I build a DIY Corsi-Rosenthal box for under $75?">
              🛠️ Build DIY Box Purifier
            </button>
            <button class="scenario-chip" data-prompt="When is the safest time to open windows during a winter smog inversion?">
              🕒 Window Ventilation Window
            </button>
            <button class="scenario-chip" data-prompt="How do I protect my toddler from ground-level stroller smog on school runs?">
              🚼 Stroller & School Smog
            </button>
            <button class="scenario-chip" data-prompt="How does Berkeley Earth convert our current AQI into cigarette equivalents?">
              🚬 Cigarette Equivalency
            </button>
            <button class="scenario-chip" data-prompt="Can houseplants like snake plants replace an air purifier during winter?">
              🪴 Plant Realities vs Myths
            </button>
            <button class="scenario-chip" data-prompt="How do I stop kitchen gas stove NO2 and frying aerosols without an outdoor duct?">
              🍳 Kitchen Fume Mitigation
            </button>
          </div>

          <!-- Chat Input -->
          <form id="chat-form" class="chat-input-bar">
            <input
              type="text"
              id="chat-user-input"
              class="chat-input"
              placeholder="Ask about smog routines, IAQ hacks, filter sizing, or health protections..."
              aria-label="Ask the Urban Air Quality Assistant a question"
              required
            />
            <button type="submit" id="chat-send-btn" class="btn-primary" aria-label="Send message">
              <span>Send</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = this.container.querySelector('#chat-form');
    const input = this.container.querySelector('#chat-user-input');

    if (form && input) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || this.isProcessing) return;
        input.value = '';
        await this.handleUserMessage(text);
      });
    }

    // Scenario prompt chips
    const chips = this.container.querySelectorAll('.scenario-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt && !this.isProcessing) {
          this.handleUserMessage(prompt);
        }
      });
    });
  }

  async handleUserMessage(text) {
    this.isProcessing = true;
    const msgList = document.getElementById('chat-messages-list');
    const sendBtn = document.getElementById('chat-send-btn');
    const statusEl = document.getElementById('chat-engine-status');

    if (sendBtn) sendBtn.disabled = true;
    if (statusEl) statusEl.textContent = 'Thinking...';

    // Append user message bubble
    this.appendBubble('user', text);

    // Append temporary typing indicator
    const typingId = `typing-${Date.now()}`;
    const typingEl = document.createElement('div');
    typingEl.id = typingId;
    typingEl.className = 'chat-bubble assistant';
    typingEl.textContent = 'Analyzing atmospheric data & generating tailored intervention...';
    msgList.appendChild(typingEl);
    msgList.scrollTop = msgList.scrollHeight;

    try {
      const response = await api.sendChatMessage(text, this.context);

      // Remove typing bubble
      const t = document.getElementById(typingId);
      if (t) t.remove();

      this.appendBubble('assistant', response.reply, response.model || 'Urban Air Quality Engine', response.suggestions);
      announce('Assistant response received: ' + response.reply.slice(0, 100));
    } catch (err) {
      const t = document.getElementById(typingId);
      if (t) t.remove();
      this.appendBubble('assistant', `⚠️ Could not complete request: ${err.message}. Please try again or check settings.`);
    } finally {
      this.isProcessing = false;
      if (sendBtn) sendBtn.disabled = false;
      if (statusEl) statusEl.textContent = 'Ready';
    }
  }

  appendBubble(role, content, modelName = null, suggestions = []) {
    const msgList = document.getElementById('chat-messages-list');
    if (!msgList) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;

    if (role === 'assistant') {
      bubble.innerHTML = this.formatMarkdown(content);
      if (modelName) {
        const src = document.createElement('span');
        src.className = 'chat-bubble-source';
        src.textContent = `⚡ Engine: ${modelName}`;
        bubble.appendChild(src);
      }

      if (suggestions && suggestions.length > 0) {
        const sugRow = document.createElement('div');
        sugRow.style.marginTop = '0.75rem';
        sugRow.style.display = 'flex';
        sugRow.style.flexWrap = 'wrap';
        sugRow.style.gap = '0.4rem';

        suggestions.forEach(s => {
          const btn = document.createElement('button');
          btn.className = 'scenario-chip';
          btn.style.fontSize = '0.75rem';
          btn.textContent = `💡 ${s}`;
          btn.addEventListener('click', () => {
            if (!this.isProcessing) this.handleUserMessage(s);
          });
          sugRow.appendChild(btn);
        });
        bubble.appendChild(sugRow);
      }
    } else {
      bubble.textContent = content;
    }

    msgList.appendChild(bubble);
    msgList.scrollTop = msgList.scrollHeight;
  }

  /**
   * Lightweight accessible markdown renderer for assistant responses.
   * Renders headers, lists, tables, bold, and italics safely.
   */
  formatMarkdown(text) {
    if (!text) return '';

    // Sanitize basic HTML first
    let s = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    s = s.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    s = s.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    s = s.replace(/^## (.*$)/gim, '<h2>$1</h2>');

    // Bold & Italics
    s = s.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    s = s.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Markdown Tables (simple regex parser)
    s = s.replace(/\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g, (match, header, rows) => {
      const ths = header.split('|').map(h => h.trim()).filter(Boolean).map(h => `<th>${h}</th>`).join('');
      const trs = rows.trim().split('\n').map(row => {
        const tds = row.split('|').map(c => c.trim()).filter(Boolean).map(c => `<td>${c}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<table class="responsive-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    });

    // Unordered lists
    s = s.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    s = s.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    // Deduplicate adjacent <ul> tags
    s = s.replace(/<\/ul>\s*<ul>/gim, '');

    // Paragraph breaks
    s = s.replace(/\n\n+/g, '<br><br>');

    return s;
  }
}
