export type BackfillDocumentEmbeddingsResult = {
  ok: boolean;
  selected?: number;
  processed?: number;
  failed?: number;
  error?: string;
};

export async function backfillDocumentEmbeddingsFromApi(
  documentId: string,
  limit: number,
): Promise<BackfillDocumentEmbeddingsResult> {
  const params = new URLSearchParams({
    documentId,
    limit: String(limit),
  });
  const response = await fetch(`/api/embeddings/backfill?${params}`, {
    method: "POST",
  });
  const result = (await response.json()) as BackfillDocumentEmbeddingsResult;

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "임베딩 저장에 실패했습니다.");
  }

  return result;
}
