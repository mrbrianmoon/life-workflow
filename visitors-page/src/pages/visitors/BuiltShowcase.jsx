import { useState } from 'react';

const APPS = [
  {
    id: 'todo',
    name: 'To Do Workstream',
    route: '/todo',
    tagline: 'Drag-and-drop tasks with real-time sync, rich notes, and forwarding.',
    body: 'Two tabs (Work / Personal) with date-driven filtering on the work side and user-defined sections on the personal side. The note editor handles bullets, checkboxes, and indentation; checkboxes inside notes are individually toggleable and persist to the same row.',
    features: [
      'Real-time Supabase channel keeps multiple devices in sync',
      'Optimistic UI on toggle, delete, drag — writes happen in the background',
      '@dnd-kit drag overlay preserves card shape; PointerSensor guards against accidental drags on buttons',
      'Forward-to-tomorrow flow with origin date preservation and forward count badge'
    ],
    architecture: [
      'Custom useTasks hook owns CRUD + savePositions + realtime subscription',
      'tasksRef pattern fixes stale closure in async drag handlers',
      'suppressRealtime ref prevents write-then-reload race conditions',
      'buildRenderPlan pure function returns a flat label/task array consumed by the renderer'
    ],
    chips: ['React', 'Supabase Realtime', '@dnd-kit', 'CSS Modules', 'RLS']
  },
  {
    id: 'lawn',
    name: 'Lawn Care',
    route: '/lawn-care',
    tagline: 'Gantt grid linked to a checkable seasonal task list.',
    body: 'Visual Gantt of seasonal lawn care for central Indiana, color-coded by category (pre-emergent, fertilize, broadleaf, watering, soil test). Each Gantt bar links by gantt_key to one or more tasks below — the bar only checks when every linked task is done.',
    features: [
      'Indiana-specific 22-item template based on Purdue Extension AY-27',
      'Arborvitae sub-tab with its own template and Gantt visualization',
      'gantt_key-first deduplication so renaming a template item does not create duplicates',
      'All-or-nothing bar completion logic ties grid state to underlying tasks'
    ],
    architecture: [
      'Single source of truth: lc_schedule_items table; treeItems derived from items at render time',
      'gantt_key format: panel:label_with_underscores:monthIndex',
      'buildCompletions pure function maps key → { total, done }',
      'Loading guard prevents duplicate template inserts on rapid re-clicks'
    ],
    chips: ['React', 'Supabase', 'Derived state', 'Domain modeling']
  },
  {
    id: 'car',
    name: 'Car Maintenance',
    route: '/car-maintenance',
    tagline: 'Four-vehicle quadrants with drag-to-log reminders.',
    body: 'A grid of four vehicles (Fusion, Odyssey, Silverado, Toro), each with a color-coded card showing recent service entries. A horizontal reminder strip across the top can be dragged onto any vehicle quadrant to open a pre-filled entry modal.',
    features: [
      'Drag a reminder card onto a vehicle to log service against it',
      'Status logic: Scheduled / Coming Up / Overdue based on date and mileage windows',
      'Top-3 entries collapse with expand button per vehicle',
      'Schedule Next Service section in the entry modal creates a reminder on save'
    ],
    architecture: [
      'Two tables: cm_entries and cm_reminders, both with auth.uid() = user_id RLS',
      'Auth shell pattern (CarApp → CarAppInner) prevents flash of unprotected content',
      'Optimistic UI with revert-on-failure for delete operations',
      'useRef for drag offset coordinates during ghost positioning'
    ],
    chips: ['React', 'Drag-and-drop', 'Supabase RLS', 'Auth shell pattern']
  }
];

function BuiltShowcase() {
  const [activeId, setActiveId] = useState('todo');
  const active = APPS.find(function (a) { return a.id === activeId; }) || APPS[0];

  return (
    <div className="visitors-card">
      <div className="visitors-section-eyebrow">What I've built</div>
      <h2 className="visitors-section-title">Four production apps, one codebase</h2>
      <p className="visitors-section-lead">
        Every app is live, deployed on Vercel, and uses the same Supabase project. Click through to see what each one does and how it's wired underneath.
      </p>

      <div className="visitors-tabs" role="tablist">
        {APPS.map(function (app) {
          const isActive = app.id === activeId;
          return (
            <button
              key={app.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={'visitors-tab' + (isActive ? ' active' : '')}
              onClick={function () { setActiveId(app.id); }}
            >
              {app.name}
            </button>
          );
        })}
      </div>

      <div className="visitors-tab-panel">
        <h3 className="visitors-tab-title">{active.name}</h3>
        <p className="visitors-tab-tagline">{active.tagline}</p>
        <p className="visitors-tab-body">{active.body}</p>

        <div className="visitors-tab-grid">
          <div>
            <h4 className="visitors-tab-subhead">Key features</h4>
            <ul className="visitors-bullet-list">
              {active.features.map(function (f, i) {
                return <li key={i}>{f}</li>;
              })}
            </ul>
          </div>
          <div>
            <h4 className="visitors-tab-subhead">Architecture notes</h4>
            <ul className="visitors-bullet-list">
              {active.architecture.map(function (a, i) {
                return <li key={i}>{a}</li>;
              })}
            </ul>
          </div>
        </div>

        <div className="visitors-chip-row">
          {active.chips.map(function (chip, i) {
            return <span key={i} className="visitors-chip accent">{chip}</span>;
          })}
        </div>

        <div className="visitors-tab-cta-row">
          <a href={active.route} className="visitors-cta primary small">
            Try {active.name} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default BuiltShowcase;
