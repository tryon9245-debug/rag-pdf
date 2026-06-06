-- =============================================================================
-- Client-side user persistence policies
-- Run after 00001_initial_schema.sql
-- =============================================================================

DROP POLICY IF EXISTS "users_anon_insert" ON public.users;
CREATE POLICY "users_anon_insert"
  ON public.users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- The app inserts then immediately returns the created user with
-- `.insert(...).select().single()`, so SELECT is required too.
DROP POLICY IF EXISTS "users_anon_select" ON public.users;
CREATE POLICY "users_anon_select"
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (true);
