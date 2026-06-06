-- =============================================================================
-- Store Google embeddings in pgvector instead of jsonb
-- Run after 00005_document_chunks_client_policies.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS embedding_vector vector(768);

-- Existing jsonb embeddings are intentionally not migrated.
ALTER TABLE public.document_chunks
  DROP COLUMN IF EXISTS embedding;

DROP POLICY IF EXISTS "document_chunks_anon_update_embedding" ON public.document_chunks;
DROP POLICY IF EXISTS "document_chunks_anon_update_embedding_vector" ON public.document_chunks;
CREATE POLICY "document_chunks_anon_update_embedding_vector"
  ON public.document_chunks
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
