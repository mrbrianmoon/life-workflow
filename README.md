# Life Workflow

A consolidated personal productivity hub built with React + Vite, backed by a single Supabase project.

## Apps

- **To Do Workstream** — Task management with priorities, sections, drag-and-drop, and real-time sync. *(Migrating from standalone `index.html`)*
- **Lawn Care** — Yard zone tracking, treatment logs, and seasonal scheduling for central Indiana. *(Building fresh)*

## Tech Stack

- **Frontend:** React 19, React Router, Vite
- **Backend:** Supabase (PostgreSQL + real-time + RLS)
- **Deployment:** Vercel (planned)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/life-workflow.git
cd life-workflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev
```

The app runs at `http://localhost:5173`.

## Project Structure

```
src/
  shared/
    supabaseClient.js    — Single Supabase client init
    Layout.jsx           — Top nav shell (wraps all routes)
    Layout.css
  apps/
    todo/                — To Do Workstream (Phase 3 migration)
    lawn-care/           — Lawn Care app (Phase 2 build)
  pages/
    Home.jsx             — Landing page with app cards
  App.jsx                — Router configuration
  main.jsx               — Entry point
  index.css              — Global styles
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

Never commit `.env` — it's in `.gitignore`.
