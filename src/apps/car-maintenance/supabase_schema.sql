-- ── Car Maintenance Tables ────────────────────────────────────────
-- Run in Supabase SQL Editor (project: arndpirxpnaoelmbidtz)

-- Service log entries
CREATE TABLE IF NOT EXISTS cm_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle     text NOT NULL,
  mileage     text NOT NULL DEFAULT '',
  entry_date  text NOT NULL DEFAULT '',
  note        text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- Service reminders
CREATE TABLE IF NOT EXISTS cm_reminders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle     text NOT NULL,
  service     text NOT NULL,
  due_mileage text NOT NULL DEFAULT '',
  due_month   text NOT NULL DEFAULT '',
  due_year    text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cm_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_reminders ENABLE ROW LEVEL SECURITY;

-- Policies: owner access only
CREATE POLICY "Owner can access cm_entries" ON cm_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Owner can access cm_reminders" ON cm_reminders
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cm_entries_user_vehicle  ON cm_entries(user_id, vehicle);
CREATE INDEX IF NOT EXISTS idx_cm_reminders_user_vehicle ON cm_reminders(user_id, vehicle);
