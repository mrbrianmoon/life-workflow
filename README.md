# Life Workflow

A personal productivity suite built with React and Supabase. Two apps in one — a task manager for daily work and personal life, and a seasonal lawn care scheduler. Deployed at [life-workflow.vercel.app](https://life-workflow.vercel.app).

> **Note:** The live app requires authentication — it's a personal workspace. Screenshots below show the full interface.

---

## Screenshots

### To Do — Work Tab
![To Do Work Tab](public/screenshots/todo-work.png)

### To Do — Personal Tab
![To Do Personal Tab](public/screenshots/todo-personal.png)

### Lawn Care — Seasonal Schedule
![Lawn Care Schedule](public/screenshots/lawn-care.png)

---

## Apps

### To Do Workstream
A full-featured task manager designed around how I actually work.

- **Work tab** — Tasks organized by category (Students, Action Items, Ongoing) filtered by date. Ongoing tasks are always visible regardless of date.
- **Personal tab** — Dateless tasks in user-defined sections with a section manager for add/rename/delete.
- **Drag-and-drop reordering** — Powered by `@dnd-kit` with optimistic UI updates and realtime sync protection.
- **Rich note editor** — Inline note editor with bullet points, checkboxes, and indentation stored as lightweight plain text syntax.
- **Forward task** — Push a work task to the next day with a forwarded count badge.
- **Calendar popover** — Date picker on both tabs with prev/next day navigation on the Work tab.
- **Real-time sync** — Supabase WebSocket channel keeps the UI current across devices, with a suppress flag that prevents interference during drag operations.
- **12-hour session timeout** — Auth enforced at both login and on a 60-second interval check.

### Lawn Care
A seasonal maintenance scheduler built for central Indiana's climate.

- **Zone manager** — Define yard zones with square footage and grass type.
- **Seasonal schedule** — Month-by-month task checklist with yearly progress tracking.
- **Indiana template** — Pre-built 22-item calendar based on Purdue Extension guidelines and local phenological timing (forsythia-triggered pre-emergent, etc.).
- **Custom tasks** — Add tasks to any month with category and zone assignment.
- **Year navigation** — Plan ahead or review past seasons.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite |
| Routing | React Router v7 |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth with RLS policies |
| Real-time | Supabase WebSocket channels |
| Drag and Drop | @dnd-kit/core, @dnd-kit/sortable |
| Styling | CSS Modules |
| Deployment | Vercel |

---

## Architecture Notes

**No Redux, no external state library.** All state is managed with `useState`, `useRef`, and custom hooks (`useTasks`, `usePersonalSections`). This was a deliberate choice to build a solid understanding of React's own primitives before reaching for abstractions.

**Custom DOM reconciliation pattern.** The original vanilla JS version of the To Do app used a `buildRenderPlan → reconcileDOM` architecture to avoid full re-renders on every update. The React migration preserves this logic as a pure `buildRenderPlan` function that returns a flat array of label and task items, which React then renders efficiently.

**Optimistic UI throughout.** Toggle, delete, forward, and drag reorder all update local state instantly before the Supabase write completes. The `suppressRealtime` ref pattern prevents the WebSocket channel from overwriting optimistic state during write operations.

**Row-level security.** Every table uses `auth.uid() = user_id` RLS policies enforced at the database level. The frontend never trusts itself as the security boundary.

---

## Background

I spent a decade in K–12 education leadership — project management, operations, compliance, building programs from scratch. Technology has always been how I stay organized: I've used spreadsheets, automation tools, and AI assistants to manage work that would otherwise require a dedicated coordinator.

At some point the tools available stopped doing exactly what I needed, so I started building my own. This project began as a single `index.html` file with vanilla JavaScript and Supabase. Over several months — learning React, working through real bugs, shipping to production — it became this. The To Do app is my actual daily driver. I use it every day at work.

I leverage AI (primarily Claude) as a development accelerator: planning architecture, debugging, understanding why something works the way it does. Every line of code in this project has been read, understood, and intentionally kept or changed. The goal isn't just a working app — it's building the foundation to do this professionally.

---

## Project Structure

```
src/
  shared/
    supabaseClient.js       — Single Supabase init from environment variables
    Layout.jsx / Layout.css — Top nav with React Router NavLinks
  apps/
    todo/
      useTasks.js               — All task CRUD, real-time, drag position saves
      usePersonalSections.js    — Section CRUD with Supabase sync
      buildRenderPlan.js        — Pure function: tasks → flat render plan
      TodoApp.jsx               — Auth gating + main app shell
      TaskCard.jsx              — Individual task card with note rendering
      SortableTaskCard.jsx      — @dnd-kit wrapper for TaskCard
      DateNav.jsx               — Date badge, calendar popover, day nav pill
      ClockWidget.jsx           — DaysPedia Indiana time widget
      NoteEditor.jsx            — Rich inline note editor
      AddModal.jsx / EditModal.jsx
      SectionManagerModal.jsx
      ProgressBar.jsx
    lawn-care/
      LawnCareApp.jsx
      ZoneManager.jsx
      SeasonalSchedule.jsx
      scheduleTemplate.js       — Indiana seasonal template data
  pages/
    Home.jsx                    — Landing page with app cards
```

---

## Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your Supabase URL and anon key to .env

# Run dev server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build
```

**Environment variables required:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Related

The original standalone To Do app (vanilla JS, single HTML file) is still live at [mrbrianmoon.github.io/todo-workstream](https://mrbrianmoon.github.io/todo-workstream). The React version in this repo is its full replacement, built incrementally over four phases documented in the project history.
