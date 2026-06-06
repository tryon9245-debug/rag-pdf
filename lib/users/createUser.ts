import type { ConsultationFormData } from "@/components/landing/types";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { UserRow } from "@/lib/supabase/types";

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function optionalAge(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createConsultationUser(
  formData: ConsultationFormData,
): Promise<UserRow> {
  const supabase = getSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .insert({
      name: optionalText(formData.name),
      age: optionalAge(formData.age),
      gender: formData.gender || null,
      job: optionalText(formData.occupation),
    })
    .select("id,name,age,gender,job,created_at")
    .single();

  if (error || !user) {
    throw new Error(error?.message || "사용자 정보를 저장하지 못했습니다.");
  }

  console.log("[users:insert:success]", {
    userId: user.id,
    name: user.name,
  });

  return user;
}
