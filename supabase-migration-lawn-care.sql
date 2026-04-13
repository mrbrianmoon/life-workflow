-- ============================================================
-- Life Workflow — Lawn Care Tables
-- Run this in your Supabase SQL Editor (arndpirxpnaoelmbidtz)
-- ============================================================

-- ── Zones ───────────────────────────────────────────────────
-- Your yard areas (Front, Back, etc.)
CREATE TABLE lc_zones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  sq_ft integer,
  grass_type text DEFAULT 'Cool-season mix',
  notes text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lc_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can access zones" ON lc_zones
  FOR ALL USING (auth.uid() = user_id);

-- ── Schedule Items ──────────────────────────────────────────
-- Seasonal tasks (template + custom), checkable per zone
CREATE TABLE lc_schedule_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
    -- categories: fertilizer, mowing, weed-control, seeding,
    --             aeration, watering, pest-control, cleanup, general
  month_start integer NOT NULL,  -- 1-12
  month_end integer,             -- nullable (if task spans months)
  is_template boolean DEFAULT false,
  zone_id uuid REFERENCES lc_zones(id) ON DELETE SET NULL,
    -- null = applies to all zones
  done boolean DEFAULT false,
  done_date text,                -- e.g. 'Apr 12, 2026'
  year integer NOT NULL DEFAULT 2026,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lc_schedule_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can access schedule" ON lc_schedule_items
  FOR ALL USING (auth.uid() = user_id);

-- ── Treatment Log ───────────────────────────────────────────
-- What was actually applied (Phase 2 later feature)
CREATE TABLE lc_treatment_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES lc_zones(id) ON DELETE SET NULL,
  schedule_item_id uuid REFERENCES lc_schedule_items(id) ON DELETE SET NULL,
  product_name text,
  application_rate text,         -- e.g. '3 lbs per 1000 sq ft'
  amount_used text,              -- e.g. '12 lbs'
  applied_date text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lc_treatment_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can access treatments" ON lc_treatment_log
  FOR ALL USING (auth.uid() = user_id);
