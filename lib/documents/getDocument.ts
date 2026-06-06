import { getSupabaseClient } from "@/lib/supabaseClient";
import type { DocumentRow } from "@/lib/supabase/types";

export async function getDocumentById(documentId: string): Promise<DocumentRow> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id,user_id,file_name,file_url,extracted_text,created_at")
    .eq("id", documentId)
    .single();

  if (error) {
    throw new Error(error.message || "문서 정보를 조회하지 못했습니다.");
  }

  return data;
}

export async function getLatestDocumentByFileName(
  fileName: string,
): Promise<DocumentRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id,user_id,file_name,file_url,extracted_text,created_at")
    .eq("file_name", fileName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "기존 문서 정보를 조회하지 못했습니다.");
  }

  return data;
}
