// ── Gantt bar data for Lawn Care and Arborvitae ─────────────
// Ported from the original standalone yard-care HTML app.
// active[] uses 0-indexed months (0 = January, 11 = December).
// details{} keys match active[] indices.
//
// gantt_key format: panel:label_with_spaces_as_underscores:monthIndex
// e.g. "lawn:Pre-emergent:2" or "tree:Watering:6"
//
// The makeGanttKey() helper must produce the same string used
// as the gantt_key value in lc_schedule_items rows.

export function makeGanttKey(panel, label, monthIndex) {
  return panel + ':' + label.replace(/\s+/g, '_') + ':' + monthIndex;
}

export const GANTT_MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
];

// ── Lawn tasks ───────────────────────────────────────────────
export const lawnTasks = [
  {
    label: 'Pre-emergent',
    color: '#BA7517',
    active: [2, 3, 8, 9],
    details: {
      2: {
        title: 'Crabgrass pre-emergent (March)',
        body: 'Apply a pre-emergent herbicide (prodiamine or pendimethalin) when soil temps reach 50–55°F for 3 consecutive days — typically early-to-mid March in central Indiana. This is your most critical step given last year\'s crabgrass. Apply before forsythia blooms. Do NOT overseed in the same 8–12 weeks after application.'
      },
      3: {
        title: 'Pre-emergent follow-up (April)',
        body: 'A split application (half in March, half in April) extends the barrier window 2–3 extra weeks. Especially useful on a heavily infested lawn. Granular products like Barricade 0-0-7 work well here.'
      },
      8: {
        title: 'Fall pre-emergent (September)',
        body: 'Optional fall pre-emergent targets winter annual weeds like henbit and chickweed. Use sparingly — only if these were a problem last year. Skip if you\'re overseeding this fall, as it will block germination.'
      },
      9: {
        title: 'Pre-emergent follow-up (October)',
        body: 'Second application of fall pre-emergent if needed for winter weed pressure. Do not apply if you overseeded in September.'
      },
    },
  },
  {
    label: 'Fertilize',
    color: '#3B6D11',
    active: [3, 5, 8, 9, 10],
    details: {
      3: {
        title: 'Light spring feeding (April)',
        body: 'Apply a balanced slow-release fertilizer (e.g. 18-0-6). Go light — 0.5 lb nitrogen per 1,000 sq ft. Heavy spring N causes excessive top growth at the expense of roots.'
      },
      5: {
        title: 'Early summer feeding (June)',
        body: 'Optional light feeding (0.5 lb N/1,000 sq ft) before summer heat sets in. Use a slow-release formula. Skip if your lawn is struggling in heat.'
      },
      8: {
        title: 'Fall starter fertilizer (September)',
        body: 'Most important feeding of the year for cool-season grasses. Apply 1 lb N/1,000 sq ft of a high-N fertilizer (e.g. 32-0-10). Time with overseeding if applicable.'
      },
      9: {
        title: 'Fall feeding (October)',
        body: 'Second fall feeding with a winterizer formula — higher potassium (K) to harden grass for winter. E.g. 24-0-12. Apply 1 lb N/1,000 sq ft.'
      },
      10: {
        title: 'Winterizer (November)',
        body: 'Final feeding before ground freezes. A dormant feed of 0.5–1 lb N/1,000 sq ft in early November helps the lawn store carbohydrates for winter and green up faster in spring.'
      },
    },
  },
  {
    label: 'Overseed / Aerate',
    color: '#0C447C',
    active: [8, 9],
    details: {
      8: {
        title: 'Core aeration + overseeding (mid-September)',
        body: 'The #1 tool for thickening your lawn. Core aerate first, then overseed immediately after. Use a quality tall fescue or KBG blend. Apply at 4–6 lbs/1,000 sq ft for overseeding, 8–10 lbs for bare areas. Keep seed moist for 2–3 weeks.'
      },
      9: {
        title: 'Overseeding window closes (October)',
        body: 'Overseeding should be done by early October at the latest in central Indiana to allow 6+ weeks of growth before frost.'
      },
    },
  },
  {
    label: 'Broadleaf weeds',
    color: '#993556',
    active: [3, 4, 9, 10],
    details: {
      3: {
        title: 'Spring broadleaf treatment (April)',
        body: 'Apply a post-emergent broadleaf herbicide (2,4-D + MCPP + dicamba blend, e.g. Trimec) when weeds are actively growing and daytime temps are 60–80°F. Targets dandelions, clover, ground ivy, plantain.'
      },
      4: {
        title: 'Spot-spray broadleaf weeds (May)',
        body: 'Spot-treat any remaining broadleaf weeds. Avoid blanket spraying during summer heat above 85°F. Liquid formulations work faster than granular.'
      },
      9: {
        title: 'Fall broadleaf treatment (October)',
        body: 'Fall is the best time to treat broadleaf weeds. Weeds pull nutrients into roots for winter — they absorb herbicides more effectively. Often more effective than spring.'
      },
      10: {
        title: 'Last broadleaf spray (November)',
        body: 'Apply before first hard frost. Weeds must still be actively growing for herbicide absorption.'
      },
    },
  },
  {
    label: 'Watering focus',
    color: '#185FA5',
    active: [5, 6, 7],
    details: {
      5: {
        title: 'Establish watering schedule (June)',
        body: 'Start deep, infrequent watering: 1 to 1.5 inches per week, applied 2–3 times per week. Early morning is best — reduces evaporation and fungal risk.'
      },
      6: {
        title: 'Summer watering (July)',
        body: 'Most critical period for cool-season grasses. Keep dormant grass alive with ½ inch every 2 weeks minimum. If irrigating to keep it green, maintain 1–1.5 inches/week consistently.'
      },
      7: {
        title: 'Late summer watering (August)',
        body: 'Continue 1–1.5 inches/week. As temps drop after mid-August, the lawn recovers from summer stress. Ramp up slightly in preparation for fall overseeding.'
      },
    },
  },
  {
    label: 'Soil test',
    color: '#534AB7',
    active: [7],
    details: {
      7: {
        title: 'Soil test (August)',
        body: 'Send a soil sample to Purdue Extension in late August. Results guide fall fertilizer and lime applications. Cost ~$15–20. Indiana soils often need lime to raise pH to 6.5–7.0 — the sweet spot for cool-season turf.'
      },
    },
  },
];

// ── Lawn season cards ────────────────────────────────────────
export const lawnSeasons = [
  {
    title: 'Early spring (Mar–Apr)',
    color: '#BA7517',
    items: [
      'Pre-emergent is priority #1 — apply when soil hits 50°F (mid-March).',
      'Light fertilizer application (0.5 lb N/1,000 sq ft).',
      'Spot-treat broadleaf weeds as they emerge.',
      'Do NOT overseed while pre-emergent is active.',
    ],
  },
  {
    title: 'Late spring / Summer (May–Aug)',
    color: '#185FA5',
    items: [
      'Mow at 3.5–4 inches to shade soil and suppress crabgrass.',
      'Water deeply 2–3x per week. Shallow watering encourages crabgrass.',
      'Avoid fertilizing during peak heat (July–Aug).',
      'Soil test in late August to guide fall applications.',
    ],
  },
  {
    title: 'Fall (Sep–Nov)',
    color: '#3B6D11',
    items: [
      'Core aerate + overseed in mid-September to thicken the lawn.',
      'Heaviest fertilizer applications of the year (Sep and Oct/Nov).',
      'Broadleaf herbicide in October — most effective time of year.',
      'Apply lime if your soil test recommends it.',
    ],
  },
  {
    title: 'Winter (Dec–Feb)',
    color: '#534AB7',
    items: [
      'No lawn treatments needed.',
      'Order pre-emergent early — sells out in Feb/March.',
      'Review what worked this season and plan adjustments.',
    ],
  },
];

// ── Arborvitae tasks ─────────────────────────────────────────
export const treeTasks = [
  {
    label: 'Watering',
    color: '#185FA5',
    active: [0,1,2,3,4,5,6,7,8,9,10,11],
    details: {
      0:  { title: 'Winter watering (January)',           body: 'Water once if there has been no rain or snow for 3+ weeks and temps are above freezing. Young arborvitae can desiccate in dry winters. Target the root zone, not the foliage.' },
      1:  { title: 'Winter watering (February)',          body: 'Water during winter thaws if soil is dry. This is especially important heading into the spring growth flush.' },
      2:  { title: 'Spring watering ramp-up (March)',     body: 'Begin regular watering as temperatures rise. Aim for 1–1.5 inches per week at the root zone. Deep, infrequent watering (2–3x per week) encourages deep root growth.' },
      3:  { title: 'Active growth watering (April)',      body: 'Continue 1–1.5 inches per week. Peak spring growth — consistent moisture now drives strong establishment. Check soil moisture 2–3 inches down before watering.' },
      4:  { title: 'Active growth watering (May)',        body: 'Maintain 1–1.5 inches per week. Mornings are ideal. Avoid wetting foliage in the evening — arborvitae are susceptible to fungal issues in humid conditions.' },
      5:  { title: 'Summer watering — critical (June)',   body: 'Increase to 1.5–2 inches per week during heat. Young arborvitae in their second year are still establishing roots and have very little drought tolerance. Never let soil dry out completely.' },
      6:  { title: 'Peak summer watering (July)',         body: 'Most critical month. Water deeply 3x per week if temps exceed 85°F. Wilting or browning tips are a sign of drought stress — act immediately. Mulch helps retain moisture significantly.' },
      7:  { title: 'Late summer watering (August)',       body: 'Continue deep watering 2–3x per week. As temps drop in late August, you can begin reducing frequency slightly. Interior browning of old needles is normal; tip browning is not.' },
      8:  { title: 'Fall watering (September)',           body: 'Reduce to 1–1.5 inches per week as temps cool. Continue through September — trees are storing energy for winter. Do not stop watering just because it feels like fall.' },
      9:  { title: 'Fall watering (October)',             body: 'Water 1–2x per week until the ground freezes. A well-hydrated tree going into winter is far more resilient than a dry one. Critical for preventing winter burn.' },
      10: { title: 'Pre-winter watering (November)',      body: 'Give each tree a deep winterization watering before the ground freezes. This is one of the most important things you can do to prevent winter burn on young arborvitae.' },
      11: { title: 'Winter dormancy (December)',          body: 'Water only during warm spells above freezing if soil is dry. Trees are mostly dormant but roots remain active in mild temperatures.' },
    },
  },
  {
    label: 'Fertilize',
    color: '#3B6D11',
    active: [2, 3, 8],
    details: {
      2: { title: 'Early spring fertilizer (March)',  body: 'Apply a slow-release evergreen fertilizer (e.g. Holly-tone or 10-8-6) as new growth begins. Do not over-fertilize — 1–2 lbs per tree at this size. Excess nitrogen causes weak, leggy growth and reduces cold hardiness.' },
      3: { title: 'Spring fertilizer follow-up (April)', body: 'Optional light application mid-April if growth seems slow. Use a fertilizer with micronutrients — iron and manganese help maintain deep green color. Avoid high-nitrogen lawn fertilizers.' },
      8: { title: 'Fall fertilizer (September)',      body: 'Apply a low-nitrogen, high-phosphorus fertilizer (e.g. 5-10-10 or bone meal) in early September to encourage root development before winter. Do NOT use high-nitrogen in fall — it stimulates growth that frost will kill.' },
    },
  },
  {
    label: 'Mulching',
    color: '#854F0B',
    active: [2, 3, 10],
    details: {
      2:  { title: 'Spring mulch refresh (March)',  body: 'Apply or refresh a 3–4 inch layer of wood chip mulch around each tree, extending to the drip line (2–3 feet from trunk). Keep mulch 2–3 inches away from the trunk to prevent rot.' },
      3:  { title: 'Top off mulch (April)',          body: 'Check depth and top off after winter breakdown. Consistent mulch is one of the highest-impact, lowest-effort things you can do for young arborvitae.' },
      10: { title: 'Winter mulch layer (November)', body: 'Add an extra inch of mulch around the root zone before winter. Insulates roots from freeze-thaw cycles that heave soil and damage young root systems.' },
    },
  },
  {
    label: 'Winter wrap',
    color: '#534AB7',
    active: [9, 10, 11, 0, 1],
    details: {
      9:  { title: 'Install burlap wrap (October)',       body: 'Wrap each tree loosely in burlap to protect from winter burn and deer browse. Do not wrap tightly — air circulation matters. Burlap screens, not tight wrapping, are ideal.' },
      10: { title: 'Finalize winter protection (November)', body: 'Ensure all 10 trees are wrapped or screened. Check stakes if any trees were planted with support. Install deer repellent if deer pressure is present in your area.' },
      11: { title: 'Monitor for snow load (December)',   body: 'After heavy wet snowfall, gently brush snow off branches with a broom using upward strokes. Arborvitae branches can split permanently under heavy snow load. Do not shake the tree.' },
      0:  { title: 'Monitor snow load (January)',        body: 'Continue monitoring after snowstorms. Brush off accumulated wet snow gently. Check that burlap wrap is still intact and hasn\'t blown off or been disturbed by wildlife.' },
      1:  { title: 'Prepare to remove wrap (February)',  body: 'Begin watching for consistent daytime temps above 40°F in late February. Remove burlap gradually as warming begins — do not leave it on past mid-March.' },
    },
  },
  {
    label: 'Pest / disease',
    color: '#993556',
    active: [3, 4, 5, 8],
    details: {
      3: { title: 'Spring inspection (April)',          body: 'Inspect all 10 trees as new growth emerges. Look for: bagworms (small bags hanging from branches), spider mites (fine webbing), and tip blight (brown tips from fungal disease). Early detection is critical.' },
      4: { title: 'Bagworm spray window (May)',         body: 'Late May is the ideal time to spray for bagworms — when larvae are newly hatched and small. Use Bt or spinosad for organic control, or bifenthrin for conventional. Once bags are large, sprays are far less effective.' },
      5: { title: 'Mid-summer pest check (June)',       body: 'Inspect for spider mites, which thrive in hot dry conditions. Look for yellowing or stippled foliage and fine webbing. Treat with insecticidal soap or neem oil.' },
      8: { title: 'Fall disease inspection (September)', body: 'Full inspection before winter. Look for canker diseases, root rot signs (yellowing from the bottom up), and structural issues. Note any trees that underperformed — they may need drainage attention.' },
    },
  },
  {
    label: 'Pruning',
    color: '#1D9E75',
    active: [2, 3],
    details: {
      2: { title: 'Light shaping only (March)', body: 'Giant Arborvitae need very little pruning at 4 feet. Do NOT hard prune — they do not regenerate from old wood. Remove dead, damaged, or crossing branches only. Never cut into brown interior wood.' },
      3: { title: 'Minor shaping (April)',       body: 'Lightly trim any wayward new growth to encourage a uniform conical shape. Use sharp hand pruners, not hedge shears. Aim to maintain a natural pyramidal form rather than a forced shape.' },
    },
  },
];

// ── Arborvitae season cards ──────────────────────────────────
export const treeSeasons = [
  {
    title: 'Early spring (Mar–Apr)',
    color: '#3B6D11',
    items: [
      'Resume deep watering — 1 to 1.5 inches per week at the root zone.',
      'Apply slow-release evergreen fertilizer as new growth begins.',
      'Refresh mulch layer to 3–4 inches around each tree.',
      'Remove burlap gradually once temps consistently stay above 40°F.',
      'Inspect for winter damage and overwintering pests.',
    ],
  },
  {
    title: 'Late spring / Summer (May–Aug)',
    color: '#185FA5',
    items: [
      'Increase watering to 1.5–2 inches/week in heat — critical for year-2 trees.',
      'Spray for bagworms in late May while larvae are small.',
      'Monitor for spider mites in hot, dry stretches — treat with neem oil.',
      'Never fertilize with high-nitrogen products in summer heat.',
      'Tip browning signals drought stress — interior browning is normal.',
    ],
  },
  {
    title: 'Fall (Sep–Nov)',
    color: '#534AB7',
    items: [
      'Apply low-nitrogen root-building fertilizer in early September.',
      'Continue watering until the ground freezes.',
      'Deep winterization watering before first hard freeze.',
      'Add extra mulch layer in November to insulate roots.',
      'Install burlap screens in October — winter burn and deer protection.',
    ],
  },
  {
    title: 'Winter (Dec–Feb)',
    color: '#854F0B',
    items: [
      'Brush heavy snow off branches using upward strokes after storms.',
      'Water during warm spells above freezing if soil is dry.',
      'Check burlap wrap integrity after storms.',
      'Remove burlap gradually starting late February.',
      'Plan any spacing adjustments for spring.',
    ],
  },
];
