/**
 * Indoor Air Quality (IAQ) Knowledge Repository.
 * Curated scientifically verified hacks, DIY guides, physiological facts, and myth-busting rules.
 */

export const IAQ_HACKS = [
  {
    id: 'corsi-rosenthal-box',
    title: 'The Corsi-Rosenthal DIY Air Purifier',
    category: 'filtration',
    costRating: '$ (Affordable)',
    effectiveness: '90-95% reduction in indoor PM2.5',
    timeToBuild: '20-30 minutes',
    summary: 'A world-renowned open-source air cleaner built with a 20" box fan and 4-5 MERV 13 furnace filters delivering hospital-grade clean air at a fraction of commercial purifier costs.',
    materials: [
      '1x 20" x 20" box fan (standard 3-speed)',
      '4x or 5x MERV 13 or FPR 10 furnace filters (20" x 20" x 1" or 20" x 20" x 2")',
      '1x Cardboard shroud (cut with a 15" circular hole for the fan face)',
      '1x Roll of heavy-duty duct tape or gaffer tape',
      '1x 20" x 20" cardboard bottom base (if building a 4-filter cube)'
    ],
    criticalStep: 'Always tape a circular cardboard shroud onto the fan exhaust! A box fan blades leave dead corners where air recirculates backward. Adding a 14-15" circular aperture shroud increases airflow and filtration efficiency by 40-50% while reducing motor noise.',
    instructions: [
      'Arrange 4 MERV 13 filters in a square cube with the airflow arrows pointing INWARD toward the center.',
      'Duct tape all vertical filter seams securely to make an airtight seal.',
      'Tape the bottom cardboard base to seal the floor of the cube.',
      'Place the 20" box fan on top of the cube facing UP (blowing clean air upward toward the ceiling).',
      'Cut a circular hole (~15" diameter) in a 20" square piece of cardboard and tape it onto the top face of the fan (the shroud).',
      'Run the fan on low or medium speed for continuous quiet air cleaning.'
    ],
    scientificImpact: 'Provides 400 - 600 CFM (Clean Air Delivery Rate), equivalent to multiple commercial HEPA units costing over $600.',
    maintenance: 'Vacuum outer pleats monthly; replace filters after 5-8 months of continuous winter smog use.'
  },
  {
    id: 'thermal-inversion-ventilation',
    title: 'Smart Ventilation: The Afternoon Inversion Window',
    category: 'ventilation',
    costRating: 'Free ($0)',
    effectiveness: 'Avoids 70-80% peak morning outdoor toxic infiltration',
    timeToBuild: 'Instant habit change',
    summary: 'Never open windows between 6:00 AM - 10:00 AM or late night during winter smog. Open briefly only during peak solar mixing between 1:00 PM and 3:30 PM.',
    materials: [
      'Smartphone weather/AQI app or local monitor',
      'Timer/alarm for 1:30 PM'
    ],
    criticalStep: 'During winter nights, the ground cools rapidly, trapping a stagnant "thermal inversion lid" 50-100 meters above ground where smoke and vehicle exhaust concentrate. In early morning, cold smog settles right at street level. At 1:00 PM, sunlight breaks the inversion lid, lifting pollutants and providing the cleanest ambient air of the day.',
    instructions: [
      'Keep all exterior windows and balcony doors shut tight overnight and throughout morning rush hours (06:00 - 10:30).',
      'Check local real-time AQI around 1:00 PM - 2:30 PM when boundary layer mixing is highest.',
      'If outdoor AQI has dropped, conduct a 10-15 minute "flush ventilation" across opposing windows.',
      'Immediately seal all windows again before 4:30 PM as solar radiation ceases and nocturnal inversion sets in.'
    ],
    scientificImpact: 'Reduces indoor peak PM2.5 spikes by 55-80 µg/m³ compared to traditional morning airing.',
    maintenance: 'Repeat daily throughout winter inversion months (November to February).'
  },
  {
    id: 'weatherstripping-air-lock',
    title: 'DIY Window & Door Weatherstripping Air Lock',
    category: 'sealing',
    costRating: '$ (Low Cost)',
    effectiveness: 'Cuts passive outdoor smog infiltration by 40-60%',
    timeToBuild: '45 minutes',
    summary: 'Winter air draft leaks allow massive amounts of microscopic PM2.5 to seep through window sashes and under exterior doors. Temporary foam seals create an airtight clean refuge.',
    materials: [
      'Self-adhesive rubber/foam weatherstrip tape (1/4" or 1/2")',
      'Silicone door sweep or fabric draft stopper snake for exterior doors',
      'Removable painter’s tape or window insulation film for single-pane windows'
    ],
    criticalStep: 'The "Dollar Bill Test": Close a window or door on a dollar bill. If you can pull the bill out effortlessly without friction, smog and cold air are pouring in. Apply foam weatherstrip along that perimeter sash until friction is felt.',
    instructions: [
      'Clean window sills and door frames with isopropyl alcohol or warm water to remove dust.',
      'Apply high-density foam adhesive strip along the interior window rebate and contact edge.',
      'Place a dense dual-sided draft blocker at the base of your main entrance door.',
      'For older single-glazed or drafty sliding windows, seal perimeter joints with removable transparent seal tape.'
    ],
    scientificImpact: 'Lowers baseline indoor PM2.5 infiltration rate from 0.75 down to <0.28 outdoor-to-indoor ratio.',
    maintenance: 'Inspect seal integrity after high-wind days.'
  },
  {
    id: 'kitchen-cooking-mitigation',
    title: 'Kitchen Smoke & Gas Stove Decontamination',
    category: 'kitchen',
    costRating: '$0 - $$',
    effectiveness: 'Prevents indoor PM2.5 spikes exceeding 400 µg/m³ and NO2 accumulation',
    timeToBuild: 'Immediate cooking habits',
    summary: 'Cooking (especially high-heat searing, deep frying, and burning oils) plus unvented gas burners generate hazardous spikes of PM2.5, carbon monoxide, and nitrogen dioxide inside closed winter homes.',
    materials: [
      'Range hood or back-burner pots',
      'Cookware lids',
      'Optional portable induction cooktop ($45 - $65)'
    ],
    criticalStep: 'Always cook on the BACK burners if using a range hood! Most range hoods only have suction directly above the back burners; front burner smoke escapes into the living room by up to 60%. Turn range hood to High 2 minutes BEFORE starting flame to establish thermal updraft.',
    instructions: [
      'Pre-run range hood exhaust on High 2 minutes before igniting gas burners.',
      'Prioritize steaming, boiling, or baking over high-temperature pan searing or wok frying during bad AQI days.',
      'Always keep pot lids on to capture volatile aerosol droplets and conserve cooking heat.',
      'If budget allows, use a plug-in portable induction burner on your countertop to eliminate combustion NO2 completely.',
      'Keep kitchen doors closed to bedrooms while cooking to maintain a clean sleeping sanctuary.'
    ],
    scientificImpact: 'Eliminates acute indoor NO2 spikes that cause childhood bronchial hyper-responsiveness.',
    maintenance: 'Clean metallic grease filters in dishwasher or boiling degreaser water every 3 weeks.'
  },
  {
    id: 'ultrasonic-humidifier-mineral-trap',
    title: 'Winter Humidity Trap: Preventing Ultrasonic "White Dust" PM2.5',
    category: 'humidity',
    costRating: '$ (Zero or low cost)',
    effectiveness: 'Eliminates up to 150 µg/m³ of artificial mineral particulate in bedrooms',
    timeToBuild: '5 minutes',
    summary: 'Many families unknowingly pollute their own bedrooms with ultrasonic cool mist humidifiers filled with tap water. Minerals aerosolize into respirable PM2.5!',
    materials: [
      'Distilled or demineralized water (OR an evaporative wick humidifier)',
      'Digital hygrometer ($10)'
    ],
    criticalStep: 'Ultrasonic humidifiers shatter water droplets mechanically with high-frequency vibrations. If you put tap water inside, calcium, magnesium, and chlorine become airborne aerosols under 2.5 micrometers. An air quality sensor next to a tap-water ultrasonic humidifier will read 300+ µg/m³! Always use distilled water, or switch to an evaporative wick-based humidifier which evaporates pure vapor.',
    instructions: [
      'Target an indoor relative humidity of 38% to 48% (keeps respiratory mucosal cilia active without triggering mold growth).',
      'Never fill ultrasonic humidifiers with mineral-rich tap water or reverse-osmosis reject water.',
      'Use distilled water, or choose evaporative wick humidifiers that naturally leave minerals behind on the wick.',
      'Clean humidifier reservoir weekly with white vinegar to prevent bacterial and mold biofilm.'
    ],
    scientificImpact: 'Keeps bedroom air clean and prevents false mineral-induced respiratory coughing fits.',
    maintenance: 'Check hygrometer twice daily; do not let humidity exceed 50% to prevent winter window condensation and black mold.'
  },
  {
    id: 'respiratory-mask-fit-realities',
    title: 'The N95/FFP2 Seal Check & Stroller Shielding',
    category: 'protection',
    costRating: '$ (Affordable per unit)',
    effectiveness: 'Filters 95-99% of particulate vs 20-30% with surgical/cloth masks',
    timeToBuild: '2 minutes per use',
    summary: 'A cloth or surgical mask leaves gaps around the nose and cheeks where smog bypasses filtration completely. A fitted N95/FFP2/KF94 mask is non-negotiable for unavoidable outdoor exposure.',
    materials: [
      'NIOSH N95, FFP2, or genuine KF94 respirator masks',
      'Adjustable headbands (superior to ear-loops for tight seal)',
      'Plastic rain/smog cover for baby strollers'
    ],
    criticalStep: 'Perform the "User Seal Check": Cup both hands over the mask without pressing it against your face, and exhale sharply. If air leaks around your nose bridge, tighten the metallic nose clip. If air leaks at the sides, adjust head straps. Inhale sharply: the mask should collapse slightly inward.',
    instructions: [
      'Select head-strap respirators rather than loose ear-loops whenever possible for high AQI days (>150).',
      'Ensure the metal nose wire is pinched with two fingers simultaneously over the bridge of your nose.',
      'For infants and toddlers who cannot safely wear respirators: use weather/rain shield covers on strollers with a battery mini-fan filter or keep stroller walks strictly for midday clean mixing windows.',
      'Do not reuse a respirator that has become wet, visibly soiled, or hard to breathe through.'
    ],
    scientificImpact: 'Reduces inhaled toxic particulate dose by over 90% during morning and evening transit.',
    maintenance: 'Store masks in breathable paper bags between uses; discard after 40 hours of active wear.'
  },
  {
    id: 'plant-myths-vs-reality',
    title: 'Houseplants Reality Check: Scientific Truths & Limits',
    category: 'botany',
    costRating: '$0 (Avoid false expenditures)',
    effectiveness: 'Clarifies that plants filter < 1% of winter PM2.5 in living spaces',
    timeToBuild: 'Instant awareness',
    summary: 'Debunking the persistent myth that snake plants or spider plants can "purify smog". Houseplants are great for mental well-being, but do NOT replace mechanical filtration.',
    materials: [
      'Knowledge & focus on mechanical filtration (Corsi-Rosenthal / HEPA)'
    ],
    criticalStep: 'The 1989 NASA Clean Air Study used sealed 0.8 m³ containers with zero air exchange. In a real home with even 0.5 air changes per hour (ACH), you would need 10 to 100 plants per square meter to equal a single box fan filter! Plants do not capture PM2.5 or soot effectively and can create mold if overwatered in winter.',
    instructions: [
      'Enjoy houseplants (e.g. Snake Plant, Pothos) for biophilic beauty, stress relief, and mild humidity moderation.',
      'Do not rely on plants as an air pollution defense strategy for children or asthma patients.',
      'Never overwater indoor plants in winter; soggy soil generates mold spores that exacerbate respiratory allergies.',
      'Invest the budget you would spend on expensive "air purifying plants" into MERV 13 furnace filters and weatherstripping instead.'
    ],
    scientificImpact: 'Saves families hundreds of dollars and directs resources to scientifically proven particulate defense.',
    maintenance: 'Keep soil surface dry and well aerated.'
  }
];

export const IAQ_CATEGORIES = [
  { id: 'all', label: 'All IAQ Hacks' },
  { id: 'filtration', label: 'DIY Filtration & Purifiers' },
  { id: 'ventilation', label: 'Inversion & Ventilation Timing' },
  { id: 'sealing', label: 'Weatherstripping & Draft Defense' },
  { id: 'kitchen', label: 'Kitchen & Combustion Mitigation' },
  { id: 'humidity', label: 'Winter Humidity & Mold Balance' },
  { id: 'protection', label: 'Respirator Masks & Stroller Care' },
  { id: 'botany', label: 'Plant Myths vs Reality' }
];
