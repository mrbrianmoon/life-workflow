# PHASE_7 — Visitors Page (Hiring Manager Portfolio)

**Date:** May 3, 2026
**Status:** Framework complete — ready to integrate

---

## What's New

A new `/visitors` route with a portfolio-style page targeted at hiring managers and recruiters. Includes a sticky sub-nav, animated section reveals, an interactive journey timeline, a tabbed app showcase, a tech stack grid, expandable bug-fix cards, and a contact section.

All classes are prefixed `visitors-` to avoid collision with anything else in the codebase.

Adding the Visitors tile to the home page also fills out the 2×2 grid — the Car Maintenance card no longer sits alone at the bottom (the layout note from PHASE_6B is now resolved as a side effect).

---

## New Files (drop into project as-is)

```
src/pages/visitors/
  Visitors.jsx          — page shell, sticky sub-nav, scroll-spy, reveal observer
  Visitors.css          — all styles (prefixed `visitors-`)
  VisitorsHero.jsx      — name, tagline, CTAs, stat row
  JourneyTimeline.jsx   — vertical timeline, 4 milestones
  BuiltShowcase.jsx     — tabbed tour of the 4 apps
  TechStack.jsx         — categorized stack & skills grid
  LessonsLearned.jsx    — expandable bug-fix cards
  ContactSection.jsx    — email, GitHub, phone, location
```

---

## Required Edits — 2 Files

### 1. `src/App.jsx` — Drop-In Replacement Provided

The zip includes a patched `src/App.jsx` you can paste over your existing file. Only two lines were added:

- New import after the `CarApp` line:
  ```jsx
  import Visitors from './pages/visitors/Visitors';
  ```
- New route after the `/car-maintenance` route:
  ```jsx
  <Route path="visitors" element={<Visitors />} />
  ```

The rest of the file (including the `/car-maintenance` absolute-path quirk) is preserved exactly as you had it.

### 2. `src/pages/Home.jsx` — Add One Card

You have an existing pattern of three cards (To Do, Lawn Care, Car Maintenance) inside `<div className="app-cards">`. Add this fourth `<Link>` immediately after the Car Maintenance card. The class names below match your `Home.css` exactly:

```jsx
<Link to="/visitors" className="app-card">
  <div className="app-card-icon">👋</div>
  <h2>Visitors</h2>
  <p>For hiring managers — my journey, what I've built, and what I'm looking for.</p>
  <span className="app-card-status status-live">Live</span>
</Link>
```

If your existing cards use `<NavLink>` instead of `<Link>`, match whichever import you already have at the top of the file. If they use a different status class in practice, match that too — the key thing is to mirror the existing card's structure exactly.

**Why this fits your grid cleanly:** your `.app-cards` is `grid-template-columns: 1fr 1fr` with `max-width: 560px`. Three cards left an awkward orphan; four cards form a clean 2×2.

---

## Optional: Resume PDF Hookup

The hero "View resume" button currently points to `/Brian_Moon_Resume.pdf` (served from `/public`).

**Option A** — Drop your resume PDF into `public/` with that exact filename and it just works.

**Option B** — Edit `VisitorsHero.jsx` line ~5 to point at whatever filename you prefer:

```jsx
window.open('/your-resume-filename.pdf', '_blank', 'noopener,noreferrer');
```

If you'd rather hide the button until the file is ready, comment out or remove the "View resume" `<button>` in `VisitorsHero.jsx`.

---

## Workflow to Apply

1. Copy the entire `src/pages/visitors/` folder into your project at the same path
2. Replace `src/App.jsx` with the patched copy from this zip
3. Add the one new card to `src/pages/Home.jsx`
4. `npm run dev` — verify `/visitors` loads and the home page tile links correctly
5. Push to GitHub — Vercel auto-deploys

---

## Things That Pull from Real Project Content

The lessons, journey, and architecture notes are pulled directly from your phase docs and resume so they're already accurate:

- **Journey:** dates, role progression, headline metrics from `Brian_Moon_Resume.pdf`
- **Built:** features and architecture from PHASE_3, PHASE_4, PHASE_5, PHASE_6A, PHASE_6B
- **Lessons:** stale closure (Phase 3), realtime race (Phase 4), RLS (security setup), drag overlay (Phase 3), iCloud path (Phase 4 notes), Vite cache (Phase 6A), Vercel 404 (Phase 6B)
- **Stack:** matches what's actually installed in your project

Each section's data lives in a top-of-file array (`MILESTONES`, `APPS`, `LESSONS`, `STACK`) — edits stay surgical when you want to revise the copy.

---

## What's Not in This Build (per your decision)

- **Resume embed/preview** — skipped per your instruction; the button opens the PDF in a new tab
- That's it — every other section in the original plan is included

---

## Behavior Notes

- **Sticky sub-nav** uses `position: sticky` + IntersectionObserver to highlight the active section. No scroll handler.
- **Reveal animation** uses a second IntersectionObserver to fade-in each section as it enters the viewport. Respects `prefers-reduced-motion`.
- **`user-select: text`** is applied at the page level to override the global `user-select: none` you set on `body` — visitors need to be able to copy your email and code snippets.
- **Mobile** — sub-nav becomes horizontally scrollable, the tab grid in BuiltShowcase stacks to one column, hero stats wrap to 2-up.

---

## Suggested Commit Message

```
Phase 7: Visitors page with hero, journey timeline, app showcase, tech stack, lessons, and contact
```
