-- =============================================================================
-- document_chunks table + client-side persistence policies
-- Run after 00004_add_extracted_text_to_documents.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_chunks_document_id_chunk_index_key
    UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx
  ON public.document_chunks (document_id);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "document_chunks_anon_select" ON public.document_chunks;
CREATE POLICY "document_chunks_anon_select"
  ON public.document_chunks
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "document_chunks_anon_insert" ON public.document_chunks;
CREATE POLICY "document_chunks_anon_insert"
  ON public.document_chunks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "document_chunks_anon_delete" ON public.document_chunks;
CREATE POLICY "document_chunks_anon_delete"
  ON public.document_chunks
  FOR DELETE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "document_chunks_anon_update_embedding" ON public.document_chunks;
CREATE POLICY "document_chunks_anon_update_embedding"
  ON public.document_chunks
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
