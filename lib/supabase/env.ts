const PLACEHOLDER_MARKERS = [
  "YOUR_PROJECT_REF",
  "YOUR_SUPABASE_ANON_KEY",
  "your-project.supabase.co",
  "your-anon-key",
] as const;

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export function readSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  const missing: string[] = [];
  if (!url) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!anonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (missing.length > 0) {
    throw new Error(
      `${missing.join(", ")}가 비어 있습니다. 프로젝트 루트의 .env.local을 채운 뒤 dev 서버를 재시작하세요.`,
    );
  }

  const hasPlaceholder = PLACEHOLDER_MARKERS.some(
    (marker) => url.includes(marker) || anonKey.includes(marker),
  );
  if (hasPlaceholder) {
    throw new Error(
      ".env.local에 예시 값(YOUR_PROJECT_REF 등)이 그대로입니다. Supabase 대시보드 → Project Settings → API에서 Project URL과 anon public 키를 복사해 넣으세요.",
    );
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않습니다. 예: https://abcdefgh.supabase.co (현재: ${url})`,
    );
  }

  const isPublicKey =
    anonKey.startsWith("eyJ") || anonKey.startsWith("sb_publishable_");
  if (!isPublicKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY는 API의 publishable 키(sb_publishable_로 시작) 또는 legacy anon public 키(eyJ로 시작)여야 합니다. secret/service_role 키는 사용하지 마세요.",
    );
  }

  return { url: url.replace(/\/$/, ""), anonKey };
}

export function isNetworkFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message === "failed to fetch" ||
    message.includes("networkerror") ||
    message.includes("network request failed")
  );
}
