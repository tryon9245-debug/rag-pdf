import {
  createGoogleEmbedding,
  getGoogleEmbeddingClient,
  toPgVector,
} from "@/lib/embeddings/googleEmbedding";
import { getSupabaseClient } from "@/lib/supabaseClient";

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 100;

type ChunkForEmbedding = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
};

export type BackfillDocumentChunkEmbeddingsOptions = {
  documentId?: string;
  limit?: number;
};

export type BackfillDocumentChunkEmbeddingsResult = {
  selected: number;
  processed: number;
  failed: number;
};

export function normalizeEmbeddingBatchSize(limit?: number): number {
  if (!Number.isFinite(limit) || !limit || limit <= 0) {
    return DEFAULT_BATCH_SIZE;
  }
  return Math.min(Math.floor(limit), MAX_BATCH_SIZE);
}

export async function backfillDocumentChunkEmbeddings(
  options: BackfillDocumentChunkEmbeddingsOptions = {},
): Promise<BackfillDocumentChunkEmbeddingsResult> {
  const batchSize = normalizeEmbeddingBatchSize(options.limit);
  const supabase = getSupabaseClient();
  let query = supabase
    .from("document_chunks")
    .select("id,document_id,chunk_index,content")
    .is("embedding_vector", null)
    .order("created_at", { ascending: true })
    .order("chunk_index", { ascending: true })
    .limit(batchSize);

  if (options.documentId) {
    query = query.eq("document_id", options.documentId);
  }

  const { data: chunks, error: selectError } = await query;
  if (selectError) {
    console.error("[embedding-backfill:select:error]", selectError.message);
    throw new Error(selectError.message);
  }

  const pendingChunks = (chunks ?? []) as ChunkForEmbedding[];
  console.log("[embedding-backfill:start]", {
    documentId: options.documentId ?? null,
    batchSize,
    selected: pendingChunks.length,
  });

  const ai = getGoogleEmbeddingClient();
  let processed = 0;
  let failed = 0;

  for (const [index, chunk] of pendingChunks.entries()) {
    console.log(`Processing chunk ${index + 1}/${pendingChunks.length}`);
    try {
      const embedding = await createGoogleEmbedding(
        ai,
        chunk.content,
        "RETRIEVAL_DOCUMENT",
      );
      console.log("Embedding generated", {
        chunkId: chunk.id,
        length: embedding.length,
        firstValues: embedding.slice(0, 3),
      });

      const { data: updatedChunk, error: updateError } = await supabase
        .from("document_chunks")
        .update({ embedding_vector: toPgVector(embedding) })
        .eq("id", chunk.id)
        .is("embedding_vector", null)
        .select("id")
        .maybeSingle();

      if (updateError) {
        throw new Error(updateError.message);
      }
      if (!updatedChunk) {
        console.log("[embedding-backfill:skip]", {
          chunkId: chunk.id,
          reason: "embedding_vector already exists",
        });
        continue;
      }

      processed += 1;
      console.log("Embedding vector saved successfully", {
        chunkId: chunk.id,
        documentId: chunk.document_id,
        chunkIndex: chunk.chunk_index,
        dimension: embedding.length,
      });
    } catch (error) {
      failed += 1;
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Embedding 처리에 실패했습니다.";
      console.error("[embedding-backfill:chunk:error]", {
        chunkId: chunk.id,
        message,
      });
    }
  }

  console.log("[embedding-backfill:complete]", {
    documentId: options.documentId ?? null,
    processed,
    failed,
  });

  return {
    selected: pendingChunks.length,
    processed,
    failed,
  };
}
