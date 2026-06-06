import {
  createGoogleEmbedding,
  getGoogleEmbeddingClient,
  toPgVector,
} from "@/lib/embeddings/googleEmbedding";

export const runtime = "nodejs";

type QuestionEmbeddingResponse =
  | {
      ok: true;
      question: string;
      embeddingLength: number;
      firstValues: number[];
      embedding: number[];
      embeddingJson: string;
      sqlVector: string;
    }
  | {
      ok: false;
      error: string;
    };

function jsonResponse(
  body: QuestionEmbeddingResponse,
  init?: ResponseInit,
): Response {
  return Response.json(body, init);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { question?: unknown };
    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return jsonResponse(
        { ok: false, error: "질문을 입력해 주세요." },
        { status: 400 },
      );
    }

    const ai = getGoogleEmbeddingClient();
    const embedding = await createGoogleEmbedding(
      ai,
      question,
      "RETRIEVAL_QUERY",
    );
    const embeddingJson = JSON.stringify(embedding);
    const sqlVector = toPgVector(embedding);
    const firstValues = embedding.slice(0, 3);

    console.log("[question-embedding]", { question });
    console.log(`Embedding length: ${embedding.length}`);
    console.log("First values:", firstValues);
    console.log("Embedding JSON:", embeddingJson);
    console.log("SQL vector:", sqlVector);

    return jsonResponse({
      ok: true,
      question,
      embeddingLength: embedding.length,
      firstValues,
      embedding,
      embeddingJson,
      sqlVector,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "질문 embedding 생성에 실패했습니다.";
    console.error("[question-embedding:error]", error);
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
}
