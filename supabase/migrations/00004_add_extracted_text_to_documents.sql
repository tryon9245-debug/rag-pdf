-- =============================================================================
-- Store extracted PDF text on documents
-- Run after 00003_allow_client_pdf_flow.sql
-- =============================================================================

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS extracted_text text;

-- The extraction route updates the document after the browser upload and insert.
-- Keep this permissive until authentication is wired into the app.
DROP POLICY IF EXISTS "documents_anon_update_extracted_text" ON public.documents;
CREATE POLICY "documents_anon_update_extracted_text"
  ON public.documents
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
