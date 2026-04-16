# Phase 4 — Polish and Portfolio

**Date:** April 16, 2026
**Status:** ✅ Complete

---

## Overview

Completed feature parity between the React `life-workflow` app and the original standalone `index.html` To Do Workstream, added polish features, deployed to production on Vercel, and prepared the project for portfolio presentation.

---

## Completed Steps

### Feature Additions ✅

#### Clock Widget
- Created `ClockWidget.jsx` — mounts the DaysPedia Indiana time widget via `useEffect`
- Script loaded dynamically on mount, cleaned up on unmount to prevent hot-reload double-initialization
- Created `ClockWidget.module.css` — hides attribution link and header, styles time/date display
- Widget ID: `dayspedia_widget_13e1fcb8e5b558c4`, cityid `5645` (Indiana)

#### Calendar Popover on Both Tabs
- Rewrote `DateNav.jsx` — previously only rendered a badge with no popover
- Full calendar popover added: month navigation, day grid, today highlight, selected date highlight
- `onPickDate` prop added so `TodoApp` can update `selectedDate` on calendar selection
- Calendar now appears on both Work and Personal tabs

#### Stationary Date Nav Pill
- Root cause: date badge was `inline-flex` and grew/shrank with the day name text, shifting the pill position
- Fix: added `min-width: 210px` to `.badgeText` in `DateNav.module.css`
- Pill position is now fixed regardless of day name length (Sunday vs. Mon, etc.)

#### Section Manager
- Created `SectionManagerModal.jsx` — add, rename, delete personal sections
- Rename uses `window.prompt`; delete uses `window.confirm` with fallback section notice
- Reuses `AddModal.module.css` for consistent modal styling
- Created `SectionManagerModal.module.css` for section list and add row
- `usePersonalSections.js` extended with `addSection`, `renameSection`, `deleteSection` functions
- "Manage Sections" button visible only on Personal tab in `TodoApp.jsx`

#### Forward Task Button
- `useTasks.js` extended with `forwardTask(id)` function
- Increments `fwd_count`, advances `display_date` by one day
- Optimistic update: updates both `setTasks` and `tasksRef.current` before Supabase write
- `TaskCard.jsx` updated with forward button and `onForward` prop
- Forward button hidden when `task.tab === 'personal'` or `task.category === 'Ongoing'`
- `SortableTaskCard.jsx` updated to pass `onForward` through to `TaskCard`

#### Progress Bar
- Created `ProgressBar.jsx` — counts done vs total from the render plan
- Created `ProgressBar.module.css` — bar track, animated fill, label
- Placed in `TodoApp.jsx` below the header row, above the task list

---

### Deployment ✅

#### Vercel
- Connected `life-workflow` GitHub repo to Vercel
- Vite project auto-detected — no manual build configuration needed
- Environment variables set in Vercel dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Live URL: `https://life-workflow.vercel.app`
- Auto-deploys on every push to `main`

#### Supabase Auth URL Configuration
- Added Vercel URL to Supabase **Authentication → URL Configuration**
- Added to both Site URL and Redirect URLs

#### Login Screen
- React app had no auth gating — `TodoApp` loaded straight into tasks and returned "Not Authenticated" on add
- Created `LoginScreen.jsx` — email/password form matching `index.html` login styling
- Created `LoginScreen.module.css`
- `TodoApp.jsx` split into two components:
  - `TodoApp` — auth shell: checks session on mount, runs 12h timeout interval, shows `LoginScreen` or `TodoAppInner`
  - `TodoAppInner` — the full app, only rendered when authenticated
- Auth state: `null` (checking) → `false` (show login) → `true` (show app)
- Sign out button added to header

---

### Bug Fixes ✅

#### Drag Reorder Revert on Second Drag
- **Symptom:** First drag worked cleanly; second drag snapped to new position then reverted for ~1 second before correcting
- **Root cause:** `savePositions` fires multiple Supabase UPDATE calls; each UPDATE triggers the realtime channel, which calls `loadTasks()` and overwrites `tasksRef.current` with stale data before all writes complete
- **Fix:** Added `suppressRealtime` ref to `useTasks.js`; set to `true` before writes in `savePositions`, cleared after 800ms in a `finally` block; all three realtime event handlers check `suppressRealtime.current` before calling `loadTasks()`

---

### README ✅

- Written for portfolio audience — hiring managers and developers
- Includes: live demo link, screenshot placeholders, app feature descriptions, tech stack table, architecture notes, background section, project structure, local dev setup, link to original `index.html` app
- Background section frames the PM-to-developer transition, AI-assisted workflow, and personal motivation
- Placed at `life-workflow/README.md` (project root)
- Screenshot placeholders reference `public/screenshots/todo-work.png`, `public/screenshots/todo-personal.png`, `public/screenshots/lawn-care.png`

---

### Favicon ✅

- `favicon.ico` and `favicon.svg` copied from `todo-workstream` repo into `public/` folder
- Added to `index.html` in project root:
  ```html
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  ```
- SVG listed first so modern browsers use the crisp vector version

---

### Home Page Status Badge ✅

- `src/pages/Home.jsx` — updated To Do card `<span>` from `status-migrating` / "Migration in progress" to `status-live` / "Live"
- `src/pages/Home.css` — added `.status-live` rule with green styling matching the app's accent color

---

## Files Added

```
src/apps/todo/
  ClockWidget.jsx
  ClockWidget.module.css
  LoginScreen.jsx
  LoginScreen.module.css
  SectionManagerModal.jsx
  SectionManagerModal.module.css
  ProgressBar.jsx
  ProgressBar.module.css
```

## Files Modified

```
src/apps/todo/
  DateNav.jsx               — calendar popover, onPickDate prop, showPill prop
  DateNav.module.css        — min-width on badgeText, full calendar styles
  TodoApp.jsx               — auth gating, all Phase 4 features wired up
  TaskCard.jsx              — forward button, onForward prop
  TaskCard.module.css       — forwardBtn styles
  SortableTaskCard.jsx      — onForward prop passed through
  usePersonalSections.js    — addSection, renameSection, deleteSection
  useTasks.js               — forwardTask, suppressRealtime fix
src/pages/
  Home.jsx                  — status-live badge
  Home.css                  — .status-live rule
index.html                  — favicon link tags
README.md                   — new, project root
```

---

## Key Learnings

| Concept | Where It Came Up |
|---|---|
| `useEffect` cleanup | ClockWidget script removal on unmount |
| Auth state machine | null/false/true pattern for session checking |
| Component splitting | TodoApp → TodoAppInner to isolate auth concerns |
| Realtime suppression | suppressRealtime ref pattern for write operations |
| iCloud Drive + Git | Spaces in folder paths cause terminal/editor path mismatch |
| Vercel auto-deploy | Every push to main triggers a rebuild and redeploy |

---

## Commits

- `Phase 4: section manager, forward task, progress bar, clock widget, calendar popover, stationary date nav`
- `Phase 4: add login screen and auth gating to TodoApp`
- `Fix drag reorder revert on second drag - suppress realtime during savePositions`
- `Phase 4: README with project overview, architecture notes, and background`
- `Add favicon`
- `Add Live Status`

---

## Architecture Notes

**Why `TodoApp` was split into two components:**
The auth check is async — the component needs to show a loading state, then either a login screen or the app. Putting all the task/section hooks inside the same component that handles auth meant they would run before the session was confirmed, causing immediate "Not Authenticated" errors. Splitting into `TodoApp` (auth shell) and `TodoAppInner` (app) means the hooks only mount after auth is confirmed.

**Why `suppressRealtime` is a `useRef` and not `useState`:**
Changing a ref does not trigger a re-render. The suppress flag only needs to block a callback — it doesn't need to cause any visual update. Using `useState` would cause unnecessary re-renders on every drag operation.

---

## Production URLs

- **Life Workflow (React):** https://life-workflow.vercel.app
- **To Do Workstream (original):** https://mrbrianmoon.github.io/todo-workstream
- **GitHub:** https://github.com/mrbrianmoon/life-workflow

---

## Next Steps (Phase 5 — Future)

- Screenshots added to `public/screenshots/` for README
- Lawn Care: treatment log UI, zone editing, schedule item editing
- To Do: completed date display on task cards
- Consider replacing GitHub Pages `index.html` with the React version as primary daily driver
