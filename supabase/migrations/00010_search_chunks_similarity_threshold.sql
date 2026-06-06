-- =============================================================================
-- Add similarity threshold to search_chunks
-- Run after 00009_search_chunks_with_file_name.sql
-- =============================================================================

DROP FUNCTION IF EXISTS public.search_chunks(vector(768), int);
DROP FUNCTION IF EXISTS public.search_chunks(vector(768), int, double precision);

CREATE OR REPLACE FUNCTION public.search_chunks(
  query_embedding vector(768),
  match_count int DEFAULT 5,
  similarity_threshold double precision DEFAULT 0.7
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
    ranked.content,
    ranked.file_name,
    ranked.similarity
  FROM (
    SELECT
      dc.content,
      d.file_name,
      1 - (dc.embedding_vector <=> query_embedding) AS similarity,
      dc.embedding_vector <=> query_embedding AS distance
    FROM public.document_chunks AS dc
    JOIN public.documents AS d
      ON d.id = dc.document_id
    WHERE dc.embedding_vector IS NOT NULL
  ) AS ranked
  WHERE ranked.similarity >= similarity_threshold
  ORDER BY ranked.distance
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.search_chunks(vector(768), int, double precision) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
