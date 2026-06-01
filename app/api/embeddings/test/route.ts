import { GoogleGenAI } from "@google/genai";
import { getSupabaseClient } from "@/lib/supabaseClient";

export const runtime = "nodejs";

type EmbeddingTestResponse =
  | {
      ok: true;
      chunkId: string;
      embeddingLength: number;
      firstValues: number[];
    }
  | {
      ok: false;
      error: string;
    };

function jsonResponse(
  body: EmbeddingTestResponse,
  init?: ResponseInit,
): Response {
  return Response.json(body, init);
}

export async function GET(): Promise<Response> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) {
      return jsonResponse(
        { ok: false, error: "GOOGLE_API_KEY가 설정되어 있지 않습니다." },
        { status: 500 },
      );
    }

    const supabase = getSupabaseClient();
    const { data: chunk, error: chunkError } = await supabase
      .from("document_chunks")
      .select("id,document_id,chunk_index,content")
      .order("created_at", { ascending: true })
      .order("chunk_index", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (chunkError) {
      return jsonResponse({ ok: false, error: chunkError.message }, { status: 500 });
    }
    if (!chunk) {
      return jsonResponse(
        { ok: false, error: "document_chunks에 조회할 row가 없습니다." },
        { status: 404 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: chunk.content,
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: 768,
      },
    });
    const embedding = result.embeddings?.[0]?.values ?? [];
    const firstValues = embedding.slice(0, 3);

    console.log("[google-embedding:test]", {
      chunkId: chunk.id,
      documentId: chunk.document_id,
      chunkIndex: chunk.chunk_index,
    });
    console.log(`Embedding length: ${embedding.length}`);
    console.log("First values:", firstValues);

    return jsonResponse({
      ok: true,
      chunkId: chunk.id,
      embeddingLength: embedding.length,
      firstValues,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Embedding 생성에 실패했습니다.";
    console.error("[google-embedding:test:error]", error);
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
}
