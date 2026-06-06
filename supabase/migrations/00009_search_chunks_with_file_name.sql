-- =============================================================================
-- Include source file name in search_chunks results
-- Run after 00008_search_chunks_rpc.sql
-- =============================================================================

DROP FUNCTION IF EXISTS public.search_chunks(vector(768), int);

CREATE OR REPLACE FUNCTION public.search_chunks(
  query_embedding vector(768),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  content text,
  file_name text,
  similarity double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    dc.content,
    d.file_name,
    1 - (dc.embedding_vector <=> query_embedding) AS similarity
  FROM public.document_chunks AS dc
  JOIN public.documents AS d
    ON d.id = dc.document_id
  WHERE dc.embedding_vector IS NOT NULL
  ORDER BY dc.embedding_vector <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.search_chunks(vector(768), int) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
