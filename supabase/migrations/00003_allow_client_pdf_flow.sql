-- =============================================================================
-- Client PDF flow RLS policies
-- Run after 00002_pdf_storage_and_policies.sql
-- =============================================================================

-- Browser uploads use the public client key, so Storage must allow inserts into
-- the app's PDF bucket.
DROP POLICY IF EXISTS "pdf_files_anon_insert" ON storage.objects;
CREATE POLICY "pdf_files_anon_insert"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'pdf-files');

DROP POLICY IF EXISTS "pdf_files_public_read" ON storage.objects;
CREATE POLICY "pdf_files_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'pdf-files');

-- The app inserts then immediately returns the inserted document with
-- `.insert(...).select().single()`, so both INSERT and SELECT policies are needed.
ALTER TABLE public.documents
  ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "documents_anon_insert" ON public.documents;
CREATE POLICY "documents_anon_insert"
  ON public.documents
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "documents_anon_select" ON public.documents;
CREATE POLICY "documents_anon_select"
  ON public.documents
  FOR SELECT
  TO anon, authenticated
  USING (true);
