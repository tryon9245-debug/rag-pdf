-- =============================================================================
-- RPC for vector similarity search over document_chunks
-- Run after 00007_use_pgvector_for_document_chunks.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.search_chunks(
  query_embedding vector(768),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  content text,
  similarity double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    dc.content,
    1 - (dc.embedding_vector <=> query_embedding) AS similarity
  FROM public.document_chunks AS dc
  WHERE dc.embedding_vector IS NOT NULL
  ORDER BY dc.embedding_vector <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.search_chunks(vector(768), int) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
