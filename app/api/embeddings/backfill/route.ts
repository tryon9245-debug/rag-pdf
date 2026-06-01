import {
  backfillDocumentChunkEmbeddings,
  normalizeEmbeddingBatchSize,
} from "@/lib/embeddings/backfillDocumentChunkEmbeddings";

export const runtime = "nodejs";

type EmbeddingBackfillResponse =
  | {
      ok: true;
      selected: number;
      processed: number;
      failed: number;
    }
  | {
      ok: false;
      error: string;
    };

function jsonResponse(
  body: EmbeddingBackfillResponse,
  init?: ResponseInit,
): Response {
  return Response.json(body, init);
}

function getBatchSize(request: Request): number {
  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get("limit"));
  return normalizeEmbeddingBatchSize(rawLimit);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId")?.trim() || undefined;
    const batchSize = getBatchSize(request);
    const result = await backfillDocumentChunkEmbeddings({
      documentId,
      limit: batchSize,
    });

    return jsonResponse({
      ok: true,
      selected: result.selected,
      processed: result.processed,
      failed: result.failed,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Embedding 배치 처리에 실패했습니다.";
    console.error("[embedding-backfill:error]", error);
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
}
