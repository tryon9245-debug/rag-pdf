export type QuestionEmbeddingResult = {
  ok: boolean;
  question?: string;
  embeddingLength?: number;
  firstValues?: number[];
  embedding?: number[];
  embeddingJson?: string;
  sqlVector?: string;
  error?: string;
};

export async function createQuestionEmbeddingFromApi(
  question: string,
): Promise<QuestionEmbeddingResult> {
  const response = await fetch("/api/embeddings/question", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });
  const result = (await response.json()) as QuestionEmbeddingResult;

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "질문 embedding 생성에 실패했습니다.");
  }

  return result;
}
