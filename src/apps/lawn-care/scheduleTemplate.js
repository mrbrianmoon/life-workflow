// ── Central Indiana Cool-Season Lawn Care Calendar ──────────
// Based on Purdue Extension AY-27, JPJ Landscaping, and
// local phenological indicators for Zone 6a/6b

const CATEGORIES = {
  fertilizer: { label: 'Fertilizer', icon: '🧪' },
  mowing: { label: 'Mowing', icon: '🏡' },
  'weed-control': { label: 'Weed Control', icon: '🌿' },
  seeding: { label: 'Seeding', icon: '🌱' },
  aeration: { label: 'Aeration', icon: '⛏️' },
  watering: { label: 'Watering', icon: '💧' },
  'pest-control': { label: 'Pest Control', icon: '🐛' },
  cleanup: { label: 'Cleanup', icon: '🧹' },
  general: { label: 'General', icon: '📋' },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Template items: month_start is 1-indexed (1 = January)
const INDIANA_TEMPLATE = [
  // ── January / February ──
  {
    title: 'Sharpen mower blades & prep equipment',
    description: 'Get mower serviced, blades sharpened, and spreader calibrated before spring.',
    category: 'general',
    month_start: 1,
    month_end: 2,
  },
  {
    title: 'Soil test (if due)',
    description: 'Test soil any time it isn\'t frozen. Results guide lime and fertilizer decisions.',
    category: 'general',
    month_start: 2,
  },
  // ── March ──
  {
    title: 'Spring cleanup — clear debris and dead leaves',
    description: 'Remove winter debris, sticks, and matted leaves. Trim ornamental grasses.',
    category: 'cleanup',
    month_start: 3,
  },
  {
    title: 'First mow — low cut to remove dead growth',
    description: 'Mow at 2-2.5 inches for first cut to clear winter damage. Bag clippings this time.',
    category: 'mowing',
    month_start: 3,
  },
  // ── April ──
  {
    title: 'Apply pre-emergent herbicide',
    description: 'Apply when forsythia blooms (soil temps ~55°F). Prevents crabgrass germination. Do NOT overseed if applying pre-emergent.',
    category: 'weed-control',
    month_start: 4,
  },
  {
    title: 'First fertilizer application',
    description: 'Slow-release nitrogen fertilizer. Apply 0.75 lbs N per 1,000 sq ft. Avoid heavy nitrogen in spring.',
    category: 'fertilizer',
    month_start: 4,
  },
  {
    title: 'Begin regular mowing at 3-3.5 inches',
    description: 'Never remove more than 1/3 of the blade. Mow frequently as spring growth peaks.',
    category: 'mowing',
    month_start: 4,
    month_end: 5,
  },
  // ── May ──
  {
    title: 'Post-emergent weed treatment if needed',
    description: 'Spot-treat broadleaf weeds (dandelions, clover) with selective herbicide.',
    category: 'weed-control',
    month_start: 5,
  },
  {
    title: 'Second fertilizer application',
    description: 'Apply 0.75-1.0 lbs N per 1,000 sq ft. Use slow-release nitrogen. Skip if you fertilized with pre-emergent.',
    category: 'fertilizer',
    month_start: 5,
  },
  // ── June ──
  {
    title: 'Begin deep watering schedule',
    description: '1 inch per week including rainfall (~620 gallons per 1,000 sq ft). Water deeply, less frequently.',
    category: 'watering',
    month_start: 6,
    month_end: 8,
  },
  {
    title: 'Raise mowing height to 3.5-4 inches',
    description: 'Taller grass shades roots, retains moisture, and suppresses weeds in summer heat.',
    category: 'mowing',
    month_start: 6,
  },
  // ── July ──
  {
    title: 'Apply grub preventive',
    description: 'If history of grub damage, apply preventive insecticide in early July. Scout: cut 1 sq ft, peel back, count grubs. 10+ = infestation.',
    category: 'pest-control',
    month_start: 7,
  },
  {
    title: 'Do NOT fertilize — heat stress period',
    description: 'Cool-season grass may go semi-dormant. This is normal. Do not force growth with fertilizer.',
    category: 'general',
    month_start: 7,
  },
  // ── August ──
  {
    title: 'Plan fall overseeding and aeration',
    description: 'Note thin/bare spots. Best overseeding window is Aug 15 – Sep 15 in central Indiana.',
    category: 'seeding',
    month_start: 8,
  },
  // ── September ──
  {
    title: 'Core aerate the lawn',
    description: 'Relieves compaction in clay-heavy Indiana soil. Leave cores on surface to break down. Best done when soil is moist.',
    category: 'aeration',
    month_start: 9,
  },
  {
    title: 'Overseed thin and bare areas',
    description: 'Best window: Aug 15 – Sep 15. Warm soil + cool air = ideal germination. Do NOT apply pre-emergent if seeding.',
    category: 'seeding',
    month_start: 9,
  },
  {
    title: 'Fall fertilizer — most important feeding',
    description: 'Apply 1.0 lbs N per 1,000 sq ft. This is the single most important fertilizer application of the year.',
    category: 'fertilizer',
    month_start: 9,
  },
  // ── October ──
  {
    title: 'Continue mowing until growth stops',
    description: 'Keep mowing at 3-3.5 inches. Mulch fallen leaves — light layer is fine, heavy layer should be removed.',
    category: 'mowing',
    month_start: 10,
  },
  {
    title: 'Remove or mulch fallen leaves',
    description: 'Thick leaf cover smothers grass and promotes snow mold. Mulch-mow thin layers, bag heavy ones.',
    category: 'cleanup',
    month_start: 10,
    month_end: 11,
  },
  // ── November ──
  {
    title: 'Winterizer fertilizer application',
    description: 'Apply 1.0-1.5 lbs N per 1,000 sq ft with fast-release nitrogen (urea). Apply after final mow while grass is still green.',
    category: 'fertilizer',
    month_start: 11,
  },
  {
    title: 'Final mow — lower cut for winter',
    description: 'Lower to 2.5 inches for last mow. Prevents snow mold and discourages voles.',
    category: 'mowing',
    month_start: 11,
  },
  // ── December ──
  {
    title: 'Minimize traffic on frozen turf',
    description: 'Foot traffic and vehicles on frozen grass cause bare spots in spring. Use de-icing salt sparingly near lawn edges.',
    category: 'general',
    month_start: 12,
  },
];

export { CATEGORIES, MONTH_NAMES, INDIANA_TEMPLATE };
