/**
 * Google Gemini API Client and Orchestrator for Urban Air Quality Assistant.
 * Uses the latest Gemini 2.5 Flash / 1.5 Flash endpoint with domain-specialized
 * system instructions, structured context, and seamless fallback to the Local AI Engine.
 */

import { generateLocalAiResponse } from './local-ai.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const FALLBACK_GEMINI_MODEL = 'gemini-1.5-flash';

const AIR_QUALITY_SYSTEM_INSTRUCTION = `You are the "Urban Air Quality Assistant", an expert AI assistant dedicated to helping families and communities navigate severe winter smog and urban air pollution.
Your primary mission:
1. Provide actionable, low-cost, scientifically validated indoor air quality (IAQ) hacks (e.g. Corsi-Rosenthal boxes, weatherstripping, smart ventilation windows, kitchen NO2 mitigation, ultrasonic humidifier mineral hazards, plant myth debunking).
2. Suggest low-emission daily routines synchronized with the atmospheric diurnal thermal inversion cycle (morning ground smog peaks vs afternoon solar boundary layer mixing around 13:00 - 15:30).
3. Tailor advice to location archetypes (river valley basins like Delhi/Po Valley/Salt Lake, dense urban street canyons, coastal basins, suburban heating belts) and family vulnerability personas (infants, elderly with COPD/asthma, commuters, apartment renters).
4. Clearly explain the direct quantified impact of their choices:
   - PM2.5 inhalation reduction (in µg/m³·hours and equivalent cigarettes avoided using Berkeley Earth 22 µg/m³·24h = 1 cigarette).
   - Direct personal emissions saved (kg CO2e, grams PM2.5, grams NOx).
   - Community multiplier effects (what happens when 1,000 households join).
5. Always maintain an encouraging, practical, scientifically rigorous, and empathetic tone. Format with clean GitHub-flavored Markdown, bullet points, and bold highlights for readability.`;

/**
 * Calls Google Gemini REST API or falls back to local reasoning engine.
 * @param {Object} options
 * @param {string} options.message - User prompt
 * @param {Object} [options.context] - Air quality context (aqi, locationKey, personaKey, etc.)
 * @param {string} [options.apiKey] - Optional runtime Gemini API key (or process.env.GEMINI_API_KEY)
 * @returns {Promise<Object>} { reply: string, suggestions: string[], source: string }
 */
export async function askGeminiOrLocalAssistant({
  message = '',
  context = {},
  apiKey = null
} = {}) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  // If no Gemini API key is provided, use our high-fidelity local engine directly
  if (!activeKey || typeof activeKey !== 'string' || activeKey.trim().length === 0) {
    const localResult = generateLocalAiResponse({ message, context });
    return {
      reply: localResult.reply,
      suggestions: localResult.suggestions,
      source: 'local_engine',
      model: 'Local Smog Intelligence Engine'
    };
  }

  // Build the payload for Gemini 2.5 Flash
  const contextualPrompt = `
Current User Air Quality Context:
- Location Archetype: ${context.locationKey || 'river_valley_basin'}
- Lifestyle/Family Persona: ${context.personaKey || 'family_young_children'}
- Ambient Winter AQI: ${context.aqi || 185}
- User Question: ${message}

Provide a comprehensive, empathetic, and scientifically grounded response. Include actionable next steps and clearly state the direct quantified impact of their choices.
`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: AIR_QUALITY_SYSTEM_INSTRUCTION }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: contextualPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.6,
      topP: 0.95,
      maxOutputTokens: 1200
    }
  };

  try {
    const primaryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${encodeURIComponent(activeKey.trim())}`;
    
    // Use AbortController for network safety
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    const response = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Gemini API] Primary model failed with status ${response.status}: ${errText}. Falling back to local engine.`);
      const fallback = generateLocalAiResponse({ message, context });
      return {
        reply: fallback.reply,
        suggestions: fallback.suggestions,
        source: 'local_fallback',
        model: 'Local Intelligence Engine (Gemini fallback)'
      };
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText || replyText.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    // Generate contextual follow-up suggestions
    const suggestions = [
      'How does this impact our family members with asthma or COPD?',
      'Can you calculate the Corsi-Rosenthal box CADR for our room?',
      'Show me the full hourly low-emission routine for today'
    ];

    return {
      reply: replyText,
      suggestions,
      source: 'gemini_api',
      model: DEFAULT_GEMINI_MODEL
    };
  } catch (err) {
    console.warn(`[Gemini API Error] ${err.message}. Seamlessly serving local intelligence.`);
    const fallback = generateLocalAiResponse({ message, context });
    return {
      reply: fallback.reply,
      suggestions: fallback.suggestions,
      source: 'local_fallback',
      model: 'Local Intelligence Engine (Network fallback)'
    };
  }
}
