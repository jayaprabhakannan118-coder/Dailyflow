/*
# Create activities table (single-tenant, no auth)

1. New Tables
- `activities`
  - `id` (uuid, primary key)
  - `title` (text, not null) — name of the activity
  - `description` (text, nullable) — optional details
  - `scheduled_time` (time, not null) — time of day the activity is planned for
  - `duration_minutes` (integer, default 30) — estimated duration
  - `completed` (boolean, default false) — whether marked done
  - `completed_at` (timestamptz, nullable) — when it was marked done
  - `position` (integer, default 0) — ordering in the timeline
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `activities`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (single-tenant app, no sign-in).
*/

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  scheduled_time time NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activities" ON activities;
CREATE POLICY "anon_select_activities" ON activities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activities" ON activities;
CREATE POLICY "anon_insert_activities" ON activities FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_activities" ON activities;
CREATE POLICY "anon_update_activities" ON activities FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activities" ON activities;
CREATE POLICY "anon_delete_activities" ON activities FOR DELETE
  TO anon, authenticated USING (true);
