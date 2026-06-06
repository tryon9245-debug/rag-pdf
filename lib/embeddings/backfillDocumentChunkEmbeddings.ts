import { GoogleGenAI } from "@google/genai";
import { getSupabaseClient } from "@/lib/supabaseClient";

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 100;
const GOOGLE_EMBEDDING_DIMENSION = 768;

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

async function createEmbedding(
  ai: GoogleGenAI,
  content: string,
): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: GOOGLE_EMBEDDING_DIMENSION,
    },
  });

  const embedding = result.embeddings?.[0]?.values ?? [];
  if (embedding.length === 0) {
    throw new Error("빈 embedding이 반환되었습니다.");
  }
  if (embedding.length !== GOOGLE_EMBEDDING_DIMENSION) {
    throw new Error(
      `Embedding 차원이 올바르지 않습니다. expected=${GOOGLE_EMBEDDING_DIMENSION}, actual=${embedding.length}`,
    );
  }
  return embedding;
}

function toPgVector(values: number[]): string {
  return `[${values.join(",")}]`;
}

export async function backfillDocumentChunkEmbeddings(
  options: BackfillDocumentChunkEmbeddingsOptions = {},
): Promise<BackfillDocumentChunkEmbeddingsResult> {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY가 설정되어 있지 않습니다.");
  }

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

  const ai = new GoogleGenAI({ apiKey });
  let processed = 0;
  let failed = 0;

  for (const [index, chunk] of pendingChunks.entries()) {
    console.log(`Processing chunk ${index + 1}/${pendingChunks.length}`);
    try {
      const embedding = await createEmbedding(ai, chunk.content);
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
