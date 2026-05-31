-- =============================================================================
-- rag-pdf: initial schema (Supabase SQL Editor)
-- Goal: create `users` and `documents` tables (1:N)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------------------------
CREATE TABLE public.users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text,
  age        int,
  gender     text,
  job        text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Application users';

-- -----------------------------------------------------------------------------
-- 2. documents (many per user)
-- -----------------------------------------------------------------------------
CREATE TABLE public.documents (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  file_name  text,
  file_url   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.documents IS 'PDF documents owned by a user';

-- 1:N — documents.user_id → users.id (FK above)
CREATE INDEX documents_user_id_idx ON public.documents (user_id);

-- -----------------------------------------------------------------------------
-- 3. Row Level Security (enabled; policies added later)
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Example policies (uncomment and adjust when ready):
--
-- CREATE POLICY "users_select_own"
--   ON public.users FOR SELECT
--   USING (auth.uid() = id);
--
-- CREATE POLICY "documents_select_own"
--   ON public.documents FOR SELECT
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "documents_insert_own"
--   ON public.documents FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
