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
