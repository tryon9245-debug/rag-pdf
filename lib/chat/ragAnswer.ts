import type { SearchChunksResult } from "@/lib/supabase/types";

export type RagAnswerResult =
  | {
      ok: true;
      answer: string;
      chunks: SearchChunksResult[];
    }
  | {
      ok: false;
      error: string;
      code: "embedding_failed" | "no_results" | "gemini_failed" | "unknown";
    };

export async function createRagAnswer(question: string): Promise<RagAnswerResult> {
  const response = await fetch("/api/chat/rag", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });
  const result = (await response.json()) as RagAnswerResult;

  if (!response.ok || !result.ok) {
    return result.ok
      ? {
          ok: false,
          error: "답변 생성 중 오류가 발생했습니다.",
          code: "unknown",
        }
      : result;
  }

  return result;
}
