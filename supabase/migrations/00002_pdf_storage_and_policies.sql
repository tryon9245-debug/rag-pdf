-- =============================================================================
-- PDF storage bucket + client upload policies
-- Run after 00001_initial_schema.sql
-- =============================================================================

-- documents.user_id: optional until auth is wired
ALTER TABLE public.documents
  ALTER COLUMN user_id DROP NOT NULL;

-- -----------------------------------------------------------------------------
-- Storage bucket: pdf-files (public URL for stable file_url in DB)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-files',
  'pdf-files',
  true,
  52428800,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- Storage RLS (required for browser upload via anon key)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- documents: allow insert from client (tighten when auth is added)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "documents_anon_insert" ON public.documents;
CREATE POLICY "documents_anon_insert"
  ON public.documents
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
