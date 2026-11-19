# Urban Air Quality Assistant 

Gen AI-powered assistant engineered to help families, schools and vulnerable communities navigate severe winter smog and urban air pollution. 

The application suggests **low-emission daily routines**, **indoor air quality (IAQ) hacks**, **sustainable alternatives** tailored to local atmospheric topography and lifestyle profiles while **clearly quantifying the direct impact of their choices**.

---

## 🌟 Key Features

### 1. 📅 Low-Emission Daily Routines Synchronized with Diurnal Inversion
- **Thermal Inversion Cycle Awareness**: Winter smog is exacerbated by radiation cooling trapping a stagnant boundary layer at night and dawn.
- **Hourly Activity Timing**: Explicitly alerts users to avoid outdoor physical exertion during morning rush hour peaks and night traps.
- **Optimal Solar Mixing Window**: Identifies the daily clean air window  when solar updrafts puncture the inversion lid, enabling safe home flush ventilation, outdoor chores and school transit.

### 2. 🛠️ Verified Indoor Air Quality (IAQ) Hacks & DIY Purifier Lab
- **Corsi-Rosenthal Box Builder & CADR Calculator**: Step-by-step assembly of open-source 4/5-filter MERV 13 box fan purifiers delivering 450–560 CFM of clean air for under \$75 (outperforming \$600 commercial HEPA units).
- **The Fan Shroud Engineering Rule**: Explains the critical 15" circular cardboard shroud that eliminates reverse air recirculation at fan corners and boosting efficiency by 40%.
- **Window & Door Weatherstripping**: The "Dollar Bill Test" and perimeter draft sealing that cuts outdoor particle infiltration by 55–70%.
- **Kitchen Combustion Mitigation**: Back-burner cooking rules, range hood pre-exhaust timing and portable induction swaps to prevent hazardous indoor.
- **Winter Humidifier Mineral Trap**: Crucial warning against tap water in ultrasonic humidifiers, guiding families toward distilled water or evaporative wick humidifiers.
- **Houseplants Reality Check**: Evidence-based debunking of the 1989 NASA chamber myth—explaining why houseplants cannot replace particulate filtration in ventilated homes.

### 3. 🎯 Direct Impact & Community Multiplier Calculator
- **Berkeley Earth Cigarette Equivalency**: Transparent conversion where $\sim 22\,\mu\text{g/m}^3$ of $\text{PM}_{2.5}$ exposure over 24 hours ($528\,\mu\text{g/m}^3\cdot\text{hours}$) equals inhaling 1 cigarette.
- **Personal Emissions Curtailed**: Real-time tracking of avoided cold starts, consolidated vehicle-km and eliminated wood/biomass burning.
- **Community Multiplier Simulator**: Projects collective neighborhood outcomes across 10, 100, 1,000, and 10,000 households over a 30-day winter smog inversion, including estimated pediatric emergency asthma admissions prevented.

### 4. 🤖 Dual-Engine Gen AI Assistant
- **Google Gemini 2.5 Flash Integration**: Real-time generative reasoning powered by Google Gemini, equipped with specialized system instructions, atmospheric grounding and scenario analysis.
- **Local Smog Intelligence Engine (100% Offline-Resilient)**: Built-in local reasoning engine that performs semantic intent classification, IAQ knowledge retrieval and impact calculations out-of-the-box with **zero external dependencies and zero API key requirement**.

---

## 🏛️ System Architecture

```
urban-air-quality-assistant/
├── package.json                 # Project configuration & test scripts
├── vercel.json                  # Vercel zero-config deployment manifest
├── server.js                    # Platform-independent native Node HTTP server
├── api/                         # Vercel Serverless Functions / Local API routes
│   ├── chat.js                  # Gen AI assistant endpoint (Gemini + Local AI)
│   ├── routine.js               # Low-emission routine generator
│   ├── hacks.js                 # IAQ hacks repository & CADR calculator
│   ├── impact.js                # Direct impact & community multiplier engine
│   └── aqi.js                   # Atmospheric telemetry & diurnal curve provider
├── lib/                         # Pure, testable business logic & models
│   ├── gemini.js                # Google Gemini API client with fallback
│   ├── local-ai.js              # Built-in local reasoning & synthesis engine
│   ├── impact-engine.js         # Berkeley Earth formulas & emissions models
│   ├── iaq-knowledge.js         # Curated DIY hacks, CADR, plant facts
│   ├── routines-data.js         # Diurnal inversion curves, locations & personas
│   └── security.js              # Input sanitization, CSP headers, rate-limiting
├── public/                      # Static client application (WCAG 2.1 AA)
│   ├── index.html               # Semantic HTML5 accessible dashboard
│   ├── css/
│   │   ├── main.css             # Fluid typography, tokens, dark/light themes
│   │   └── components.css       # Cards, dials, timeline, sliders, AI chat
│   ├── js/
│   │   ├── app.js               # Application orchestration & state sync
│   │   ├── components/          # Reusable UI components
│   │   └── utils/               # Accessibility live announcers & API client
│   └── assets/                  # Scalable SVG icons & branding
└── tests/                       # Comprehensive automated test suite
    ├── impact-engine.test.js    # Berkeley Earth & emission calculations
    ├── security.test.js         # XSS, rate-limiting & CSP headers
    ├── iaq-knowledge.test.js    # Instructions & specification tests
    ├── local-ai.test.js         # Intent classification & reasoning tests
    ├── api-endpoints.test.js    # Integration tests for all API routes
    └── a11y-dom.test.js         # HTML accessibility & landmark audits
```

---

## 🔒 Security & Code Quality

- **Zero Fragile Dependencies**: Built entirely on standard web standards and native Node.js (`node:http`, `node:test`, `node:assert`, ES Modules).
- **Content Security Policy (CSP)**: Strict CSP preventing unauthorized script injection.
- **Input Sanitization & Bounds Checking**: All numeric ranges, strings and JSON payloads are clamped and sanitized against XSS.
- **Rate Limiting**: Integrated sliding-window limiter guarding API endpoints from abuse.
- **Privacy First**: Custom Gemini API keys entered via the UI remain strictly inside local browser memory.

---

## ♿ Accessibility (a11y) Conformance

- **WCAG 2.1 AA Standard**: High-contrast typography and color schemes across light and dark themes.
- **Color Independence**: Smog status is never communicated by color alone; text descriptors, numbers, and icons accompany every indicator.
- **Keyboard Navigation**: Skip-to-content bypass link, focus management for modal dialogs (`<dialog>`), and full tab order support.
- **Screen Reader Friendly**: Proper ARIA live regions (`role="status"`, `role="alert"`), `tabpanel` pairings, and `<label for="...">` associations.
- **Motion Reduction**: Full support for `prefers-reduced-motion: reduce`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js $\ge 18.0.0$ (no npm packages to install; uses native ES modules and Node standard library).

### Running Locally
```bash
# 1. Clone the repository
git clone https://github.com/your-repo/urban-air-quality-assistant.git
cd urban-air-quality-assistant

# 2. Run the test suite
npm test

# 3. Start the application
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Running with Google Gemini API (Optional)
To enable live Gemini 2.5 Flash generation:
```bash
export GEMINI_API_KEY="AIzaSyYourApiKeyHere"
npm start
```
*Note: If no API key is set then the application automatically uses its built-in Local Smog Intelligence Engine with zero configuration.*

---

## ☁️ Vercel Deployment

The project is structured to deploy on Vercel with zero configuration:
1. Push the repository to GitHub.
2. Import the project in your Vercel Dashboard.
3. (Optional) Add `GEMINI_API_KEY` to Vercel Environment Variables.
4. Click **Deploy**. Vercel automatically deploys `public/` as static assets and `api/*.js` as serverless functions.

---

## 🧪 Testing & Validation

Run the automated test suite:
```bash
npm test
```

Generate test coverage report:
```bash
npm run test:coverage
```
*Current test suite achieves 100% pass rate across 31 automated unit, integration and accessibility tests.*

---

## 📚 Scientific & Meteorological References
1. **Berkeley Earth**: *Air Pollution and Cigarette Equivalence Methodology* (Muller & Rohde).
2. **UC Davis & EPA**: *Corsi-Rosenthal Box Air Cleaner CADR & Bioaerosol Filtration Efficacy*.
3. **World Health Organization (WHO)**: *Global Air Quality Guidelines for Particulate Matter ($\text{PM}_{2.5}$, $\text{PM}_{10}$)*.
4. **Drexel University (2019)**: *Potted Plants Do Not Improve Indoor Air Quality: A Critical Review of the NASA 1989 Chamber Study*.
