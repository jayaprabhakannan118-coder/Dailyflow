/*
# Add activity_date column to activities

1. Changes to existing tables
- `activities`: add `activity_date` (date, NOT NULL, defaults to CURRENT_DATE)
  This lets each activity belong to a specific calendar day, so users can
  review progress for any past date via a date picker.
2. Backfill
- Existing rows get CURRENT_DATE as their activity_date.
3. Index
- Add index on (activity_date, position) for efficient date-filtered queries.
4. Security
- No policy changes; existing anon+authenticated CRUD policies already
  cover the new column (it's user-editable like the other fields).
*/

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS activity_date date NOT NULL DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_activities_date_position
  ON activities (activity_date, position);
