// ── Central Indiana Cool-Season Lawn Care Calendar ──────────
// Based on Purdue Extension AY-27, JPJ Landscaping, and
// local phenological indicators for Zone 6a/6b
//
// gantt_key values must match the keys produced by makeGanttKey()
// in ganttData.js: panel:label_with_spaces_as_underscores:monthIndex

const CATEGORIES = {
  fertilizer:    { label: 'Fertilizer',    icon: '🧪' },
  mowing:        { label: 'Mowing',        icon: '🏡' },
  'weed-control':{ label: 'Weed Control',  icon: '🌿' },
  seeding:       { label: 'Seeding',       icon: '🌱' },
  aeration:      { label: 'Aeration',      icon: '⛏️' },
  watering:      { label: 'Watering',      icon: '💧' },
  'pest-control':{ label: 'Pest Control',  icon: '🐛' },
  cleanup:       { label: 'Cleanup',       icon: '🧹' },
  general:       { label: 'General',       icon: '📋' },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Template items: month_start is 1-indexed (1 = January)
// gantt_key links a task to a Gantt bar; null means no Gantt bar association.
const INDIANA_TEMPLATE = [
  // ── January / February ──
  {
    title: 'Sharpen mower blades & prep equipment',
    description: 'Get mower serviced, blades sharpened, and spreader calibrated before spring.',
    category: 'general',
    month_start: 1,
    month_end: 2,
    gantt_key: null,
  },
  {
    title: 'Soil test (if due)',
    description: 'Test soil any time it isn\'t frozen. Results guide lime and fertilizer decisions.',
    category: 'general',
    month_start: 2,
    gantt_key: null,
  },

  // ── March ──
  {
    title: 'Spring cleanup — clear debris and dead leaves',
    description: 'Remove winter debris, sticks, and matted leaves. Trim ornamental grasses.',
    category: 'cleanup',
    month_start: 3,
    gantt_key: null,
  },
  {
    title: 'First mow — low cut to remove dead growth',
    description: 'Mow at 2-2.5 inches for first cut to clear winter damage. Bag clippings this time.',
    category: 'mowing',
    month_start: 3,
    gantt_key: null,
  },
  {
    title: 'Apply pre-emergent herbicide (March)',
    description: 'Apply when forsythia blooms (soil temps ~55°F). Prevents crabgrass germination. Do NOT overseed if applying pre-emergent.',
    category: 'weed-control',
    month_start: 3,
    gantt_key: 'lawn:Pre-emergent:2',
  },

  // ── April ──
  {
    title: 'Pre-emergent follow-up (April)',
    description: 'Split application — second half in April extends the barrier window 2–3 extra weeks. Granular products like Barricade 0-0-7 work well.',
    category: 'weed-control',
    month_start: 4,
    gantt_key: 'lawn:Pre-emergent:3',
  },
  {
    title: 'First fertilizer application',
    description: 'Slow-release nitrogen fertilizer. Apply 0.75 lbs N per 1,000 sq ft. Avoid heavy nitrogen in spring.',
    category: 'fertilizer',
    month_start: 4,
    gantt_key: 'lawn:Fertilize:3',
  },
  {
    title: 'Spring broadleaf treatment',
    description: 'Apply a post-emergent broadleaf herbicide (2,4-D + MCPP + dicamba blend, e.g. Trimec) when weeds are actively growing and daytime temps are 60–80°F.',
    category: 'weed-control',
    month_start: 4,
    gantt_key: 'lawn:Broadleaf_weeds:3',
  },
  {
    title: 'Begin regular mowing at 3-3.5 inches',
    description: 'Never remove more than 1/3 of the blade. Mow frequently as spring growth peaks.',
    category: 'mowing',
    month_start: 4,
    month_end: 5,
    gantt_key: null,
  },

  // ── May ──
  {
    title: 'Spot-spray broadleaf weeds (May)',
    description: 'Spot-treat any remaining broadleaf weeds. Avoid blanket spraying during summer heat above 85°F. Liquid formulations work faster than granular.',
    category: 'weed-control',
    month_start: 5,
    gantt_key: 'lawn:Broadleaf_weeds:4',
  },
  {
    title: 'Early summer fertilizer application',
    description: 'Apply 0.75-1.0 lbs N per 1,000 sq ft. Use slow-release nitrogen. Skip if you fertilized with pre-emergent.',
    category: 'fertilizer',
    month_start: 5,
    gantt_key: 'lawn:Fertilize:5',
  },

  // ── June ──
  {
    title: 'Deep watering schedule (June)',
    description: '1 inch per week including rainfall (~620 gallons per 1,000 sq ft). Water deeply 2–3x per week. Early morning is best — reduces evaporation and fungal risk.',
    category: 'watering',
    month_start: 6,
    gantt_key: 'lawn:Watering_focus:5',
  },
  {
    title: 'Raise mowing height to 3.5-4 inches',
    description: 'Taller grass shades roots, retains moisture, and suppresses weeds in summer heat.',
    category: 'mowing',
    month_start: 6,
    gantt_key: null,
  },

  // ── July ──
  {
    title: 'Apply grub preventive',
    description: 'If history of grub damage, apply preventive insecticide in early July. Scout: cut 1 sq ft, peel back, count grubs. 10+ = infestation.',
    category: 'pest-control',
    month_start: 7,
    gantt_key: null,
  },
  {
    title: 'Maintain deep watering (July)',
    description: 'Most critical period for cool-season grasses. Keep dormant grass alive with ½ inch every 2 weeks minimum. If irrigating to keep it green, maintain 1–1.5 inches/week consistently.',
    category: 'watering',
    month_start: 7,
    gantt_key: 'lawn:Watering_focus:6',
  },
  {
    title: 'Do NOT fertilize — heat stress period',
    description: 'Cool-season grass may go semi-dormant. This is normal. Do not force growth with fertilizer.',
    category: 'general',
    month_start: 7,
    gantt_key: null,
  },

  // ── August ──
  {
    title: 'Late summer watering (August)',
    description: 'Continue 1–1.5 inches/week. As temps drop after mid-August, the lawn recovers from summer stress. Ramp up slightly in preparation for fall overseeding.',
    category: 'watering',
    month_start: 8,
    gantt_key: 'lawn:Watering_focus:7',
  },
  {
    title: 'Soil test — send to Purdue Extension',
    description: 'Send a soil sample to Purdue Extension in late August. Results guide fall fertilizer and lime applications. Cost ~$15–20. Indiana soils often need lime to raise pH to 6.5–7.0.',
    category: 'general',
    month_start: 8,
    gantt_key: 'lawn:Soil_test:7',
  },

  // ── September ──
  {
    title: 'Core aerate the lawn',
    description: 'Relieves compaction in clay-heavy Indiana soil. Leave cores on surface to break down. Best done when soil is moist.',
    category: 'aeration',
    month_start: 9,
    gantt_key: 'lawn:Overseed_/_Aerate:8',
  },
  {
    title: 'Overseed thin and bare areas',
    description: 'Best window: Aug 15 – Sep 15. Warm soil + cool air = ideal germination. Do NOT apply pre-emergent if seeding.',
    category: 'seeding',
    month_start: 9,
    gantt_key: 'lawn:Overseed_/_Aerate:8',
  },
  {
    title: 'Fall fertilizer — most important feeding',
    description: 'Apply 1.0 lbs N per 1,000 sq ft. This is the single most important fertilizer application of the year.',
    category: 'fertilizer',
    month_start: 9,
    gantt_key: 'lawn:Fertilize:8',
  },
  {
    title: 'Fall pre-emergent (September)',
    description: 'Optional fall pre-emergent targets winter annual weeds like henbit and chickweed. Use sparingly — only if these were a problem last year. Skip if you\'re overseeding this fall.',
    category: 'weed-control',
    month_start: 9,
    gantt_key: 'lawn:Pre-emergent:8',
  },

  // ── October ──
  {
    title: 'Continue mowing until growth stops',
    description: 'Keep mowing at 3-3.5 inches. Mulch fallen leaves — light layer is fine, heavy layer should be removed.',
    category: 'mowing',
    month_start: 10,
    gantt_key: null,
  },
  {
    title: 'Overseeding window closes (October)',
    description: 'Overseeding should be done by early October at the latest in central Indiana to allow 6+ weeks of growth before frost.',
    category: 'seeding',
    month_start: 10,
    gantt_key: 'lawn:Overseed_/_Aerate:9',
  },
  {
    title: 'Fall feeding — winterizer formula (October)',
    description: 'Second fall feeding with a winterizer formula — higher potassium (K) to harden grass for winter. E.g. 24-0-12. Apply 1 lb N/1,000 sq ft.',
    category: 'fertilizer',
    month_start: 10,
    gantt_key: 'lawn:Fertilize:9',
  },
  {
    title: 'Fall broadleaf treatment (October)',
    description: 'Fall is the best time to treat broadleaf weeds. Weeds pull nutrients into roots for winter — they absorb herbicides more effectively. Often more effective than spring.',
    category: 'weed-control',
    month_start: 10,
    gantt_key: 'lawn:Broadleaf_weeds:9',
  },
  {
    title: 'Fall pre-emergent follow-up (October)',
    description: 'Second application of fall pre-emergent if needed for winter weed pressure. Do not apply if you overseeded in September.',
    category: 'weed-control',
    month_start: 10,
    gantt_key: 'lawn:Pre-emergent:9',
  },
  {
    title: 'Remove or mulch fallen leaves',
    description: 'Thick leaf cover smothers grass and promotes snow mold. Mulch-mow thin layers, bag heavy ones.',
    category: 'cleanup',
    month_start: 10,
    month_end: 11,
    gantt_key: null,
  },

  // ── November ──
  {
    title: 'Winterizer fertilizer application',
    description: 'Apply 1.0-1.5 lbs N per 1,000 sq ft with fast-release nitrogen (urea). Apply after final mow while grass is still green.',
    category: 'fertilizer',
    month_start: 11,
    gantt_key: 'lawn:Fertilize:10',
  },
  {
    title: 'Last broadleaf spray (November)',
    description: 'Apply before first hard frost. Weeds must still be actively growing for herbicide absorption.',
    category: 'weed-control',
    month_start: 11,
    gantt_key: 'lawn:Broadleaf_weeds:10',
  },
  {
    title: 'Final mow — lower cut for winter',
    description: 'Lower to 2.5 inches for last mow. Prevents snow mold and discourages voles.',
    category: 'mowing',
    month_start: 11,
    gantt_key: null,
  },

  // ── December ──
  {
    title: 'Minimize traffic on frozen turf',
    description: 'Foot traffic and vehicles on frozen grass cause bare spots in spring. Use de-icing salt sparingly near lawn edges.',
    category: 'general',
    month_start: 12,
    gantt_key: null,
  },
];


// ── Arborvitae Template ──────────────────────────────────────
// 10 Giant Arborvitae (Thuja plicata) — year 2 establishment
// gantt_key values use 'tree:' prefix to match treeTasks in ganttData.js

const ARBORVITAE_TEMPLATE = [
  // ── January ──
  {
    title: 'Monitor snow load (January)',
    description: 'After heavy wet snowfall, gently brush snow off branches using upward strokes. Arborvitae branches can split permanently under heavy snow load. Do not shake the tree.',
    category: 'general',
    month_start: 1,
    gantt_key: 'tree:Winter_wrap:0',
  },
  {
    title: 'Winter watering (January)',
    description: 'Water once if there has been no rain or snow for 3+ weeks and temps are above freezing. Young arborvitae can desiccate in dry winters. Target the root zone, not the foliage.',
    category: 'watering',
    month_start: 1,
    gantt_key: 'tree:Watering:0',
  },

  // ── February ──
  {
    title: 'Prepare to remove burlap wrap (February)',
    description: 'Begin watching for consistent daytime temps above 40°F in late February. Remove burlap gradually as warming begins — do not leave it on past mid-March.',
    category: 'general',
    month_start: 2,
    gantt_key: 'tree:Winter_wrap:1',
  },
  {
    title: 'Winter watering (February)',
    description: 'Water during winter thaws if soil is dry. This is especially important heading into the spring growth flush.',
    category: 'watering',
    month_start: 2,
    gantt_key: 'tree:Watering:1',
  },

  // ── March ──
  {
    title: 'Light shaping — remove dead or damaged branches',
    description: 'Giant Arborvitae need very little pruning. Do NOT hard prune — they do not regenerate from old wood. Remove dead, damaged, or crossing branches only. Never cut into brown interior wood.',
    category: 'general',
    month_start: 3,
    gantt_key: 'tree:Pruning:2',
  },
  {
    title: 'Spring mulch refresh',
    description: 'Apply or refresh a 3–4 inch layer of wood chip mulch around each tree, extending to the drip line (2–3 feet from trunk). Keep mulch 2–3 inches away from the trunk to prevent rot.',
    category: 'general',
    month_start: 3,
    gantt_key: 'tree:Mulching:2',
  },
  {
    title: 'Early spring fertilizer',
    description: 'Apply a slow-release evergreen fertilizer (e.g. Holly-tone or 10-8-6) as new growth begins. Do not over-fertilize — 1–2 lbs per tree. Excess nitrogen causes weak growth and reduces cold hardiness.',
    category: 'fertilizer',
    month_start: 3,
    gantt_key: 'tree:Fertilize:2',
  },
  {
    title: 'Spring watering ramp-up',
    description: 'Begin regular watering as temperatures rise. Aim for 1–1.5 inches per week at the root zone. Deep, infrequent watering (2–3x per week) encourages deep root growth.',
    category: 'watering',
    month_start: 3,
    gantt_key: 'tree:Watering:2',
  },

  // ── April ──
  {
    title: 'Minor shaping (April)',
    description: 'Lightly trim any wayward new growth to encourage a uniform conical shape. Use sharp hand pruners, not hedge shears. Aim to maintain a natural pyramidal form.',
    category: 'general',
    month_start: 4,
    gantt_key: 'tree:Pruning:3',
  },
  {
    title: 'Top off mulch (April)',
    description: 'Check depth and top off after winter breakdown. Consistent mulch is one of the highest-impact, lowest-effort things you can do for young arborvitae.',
    category: 'general',
    month_start: 4,
    gantt_key: 'tree:Mulching:3',
  },
  {
    title: 'Spring fertilizer follow-up (April)',
    description: 'Optional light application mid-April if growth seems slow. Use a fertilizer with micronutrients — iron and manganese help maintain deep green color. Avoid high-nitrogen lawn fertilizers.',
    category: 'fertilizer',
    month_start: 4,
    gantt_key: 'tree:Fertilize:3',
  },
  {
    title: 'Spring inspection for pests and disease',
    description: 'Inspect all 10 trees as new growth emerges. Look for: bagworms (small bags), spider mites (fine webbing), and tip blight (brown tips). Early detection is critical.',
    category: 'pest-control',
    month_start: 4,
    gantt_key: 'tree:Pest_/_disease:3',
  },
  {
    title: 'Active growth watering (April)',
    description: 'Continue 1–1.5 inches per week. Peak spring growth — consistent moisture now drives strong establishment. Check soil moisture 2–3 inches down before watering.',
    category: 'watering',
    month_start: 4,
    gantt_key: 'tree:Watering:3',
  },

  // ── May ──
  {
    title: 'Bagworm spray window (May)',
    description: 'Late May is the ideal time to spray for bagworms — when larvae are newly hatched and small. Use Bt or spinosad for organic control, or bifenthrin for conventional. Once bags are large, sprays are far less effective.',
    category: 'pest-control',
    month_start: 5,
    gantt_key: 'tree:Pest_/_disease:4',
  },
  {
    title: 'Active growth watering (May)',
    description: 'Maintain 1–1.5 inches per week. Mornings are ideal. Avoid wetting foliage in the evening — arborvitae are susceptible to fungal issues in humid conditions.',
    category: 'watering',
    month_start: 5,
    gantt_key: 'tree:Watering:4',
  },

  // ── June ──
  {
    title: 'Mid-summer pest check (June)',
    description: 'Inspect for spider mites, which thrive in hot dry conditions. Look for yellowing or stippled foliage and fine webbing. Treat with insecticidal soap or neem oil.',
    category: 'pest-control',
    month_start: 6,
    gantt_key: 'tree:Pest_/_disease:5',
  },
  {
    title: 'Summer watering — critical (June)',
    description: 'Increase to 1.5–2 inches per week during heat. Young arborvitae in their second year are still establishing roots and have very little drought tolerance. Never let soil dry out completely.',
    category: 'watering',
    month_start: 6,
    gantt_key: 'tree:Watering:5',
  },

  // ── July ──
  {
    title: 'Peak summer watering (July)',
    description: 'Most critical month. Water deeply 3x per week if temps exceed 85°F. Wilting or browning tips are a sign of drought stress — act immediately. Mulch helps retain moisture significantly.',
    category: 'watering',
    month_start: 7,
    gantt_key: 'tree:Watering:6',
  },

  // ── August ──
  {
    title: 'Late summer watering (August)',
    description: 'Continue deep watering 2–3x per week. As temps drop in late August, you can begin reducing frequency slightly. Interior browning of old needles is normal; tip browning is not.',
    category: 'watering',
    month_start: 8,
    gantt_key: 'tree:Watering:7',
  },

  // ── September ──
  {
    title: 'Fall disease inspection',
    description: 'Full inspection before winter. Look for canker diseases, root rot signs (yellowing from the bottom up), and structural issues. Note any trees that underperformed — they may need drainage attention.',
    category: 'pest-control',
    month_start: 9,
    gantt_key: 'tree:Pest_/_disease:8',
  },
  {
    title: 'Fall fertilizer for arborvitae (September)',
    description: 'Apply a low-nitrogen, high-phosphorus fertilizer (e.g. 5-10-10 or bone meal) in early September to encourage root development before winter. Do NOT use high-nitrogen in fall.',
    category: 'fertilizer',
    month_start: 9,
    gantt_key: 'tree:Fertilize:8',
  },
  {
    title: 'Fall watering (September)',
    description: 'Reduce to 1–1.5 inches per week as temps cool. Continue through September — trees are storing energy for winter. Do not stop watering just because it feels like fall.',
    category: 'watering',
    month_start: 9,
    gantt_key: 'tree:Watering:8',
  },

  // ── October ──
  {
    title: 'Install burlap wrap (October)',
    description: 'Wrap each tree loosely in burlap to protect from winter burn and deer browse. Do not wrap tightly — air circulation matters. Burlap screens, not tight wrapping, are ideal.',
    category: 'general',
    month_start: 10,
    gantt_key: 'tree:Winter_wrap:9',
  },
  {
    title: 'Winter mulch layer (October/November)',
    description: 'Add an extra inch of mulch around the root zone before winter. Insulates roots from freeze-thaw cycles that heave soil and damage young root systems.',
    category: 'general',
    month_start: 10,
    gantt_key: 'tree:Mulching:10',
  },
  {
    title: 'Fall watering (October)',
    description: 'Water 1–2x per week until the ground freezes. A well-hydrated tree going into winter is far more resilient than a dry one. Critical for preventing winter burn.',
    category: 'watering',
    month_start: 10,
    gantt_key: 'tree:Watering:9',
  },

  // ── November ──
  {
    title: 'Finalize winter protection (November)',
    description: 'Ensure all 10 trees are wrapped or screened. Check stakes if any trees were planted with support. Install deer repellent if deer pressure is present in your area.',
    category: 'general',
    month_start: 11,
    gantt_key: 'tree:Winter_wrap:10',
  },
  {
    title: 'Pre-winter deep watering',
    description: 'Give each tree a deep winterization watering before the ground freezes. This is one of the most important things you can do to prevent winter burn on young arborvitae.',
    category: 'watering',
    month_start: 11,
    gantt_key: 'tree:Watering:10',
  },

  // ── December ──
  {
    title: 'Monitor snow load (December)',
    description: 'After heavy wet snowfall, gently brush snow off branches with a broom using upward strokes. Arborvitae branches can split permanently under heavy snow load. Do not shake the tree.',
    category: 'general',
    month_start: 12,
    gantt_key: 'tree:Winter_wrap:11',
  },
  {
    title: 'Winter dormancy watering (December)',
    description: 'Water only during warm spells above freezing if soil is dry. Trees are mostly dormant but roots remain active in mild temperatures.',
    category: 'watering',
    month_start: 12,
    gantt_key: 'tree:Watering:11',
  },
];

export { CATEGORIES, MONTH_NAMES, INDIANA_TEMPLATE, ARBORVITAE_TEMPLATE };
