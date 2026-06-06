import {
  createGoogleEmbedding,
  getGoogleEmbeddingClient,
  GOOGLE_ANSWER_MODEL,
  toPgVector,
} from "@/lib/embeddings/googleEmbedding";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { SearchChunksResult } from "@/lib/supabase/types";

export const runtime = "nodejs";

const MATCH_COUNT = 5;
const NO_CONTEXT_MESSAGE = "문서에서 해당 내용을 찾을 수 없습니다.";

type RagAnswerResponse =
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

function jsonResponse(body: RagAnswerResponse, init?: ResponseInit): Response {
  return Response.json(body, init);
}

function buildContext(chunks: SearchChunksResult[]): string {
  return chunks
    .map(
      (chunk, index) =>
        `Chunk ${index + 1}:\n출처 파일명: ${chunk.file_name ?? "알 수 없음"}\n${chunk.content}`,
    )
    .join("\n\n");
}

function getSourceFileNames(chunks: SearchChunksResult[]): string[] {
  return Array.from(
    new Set(
      chunks
        .map((chunk) => chunk.file_name?.trim())
        .filter((fileName): fileName is string => Boolean(fileName)),
    ),
  );
}

function removeSourceLines(answer: string): string {
  return answer
    .split("\n")
    .filter((line) => !/^\s*출처\s*:/u.test(line))
    .join("\n")
    .trim();
}

function appendSourceFooter(
  answer: string,
  sourceFileNames: string[],
): string {
  const answerWithoutSources = removeSourceLines(answer);
  if (sourceFileNames.length === 0) {
    return `${answerWithoutSources}\n\n출처: 알 수 없음`;
  }
  return `${answerWithoutSources}\n\n출처: ${sourceFileNames.join(", ")}`;
}

function buildPrompt(question: string, context: string): string {
  return `당신은 문서 기반 상담 AI입니다.

반드시 제공된 Context 안에서만 답변하세요.

Context에 없는 내용은 추측하지 말고
'${NO_CONTEXT_MESSAGE}'
라고 답변하세요.

답변 본문에는 출처를 쓰지 마세요. 출처 표시는 시스템이 답변 마지막에 한 번만 추가합니다.

Context:

${context}

사용자 질문:
${question}`;
}

async function searchChunks(
  queryEmbedding: number[],
): Promise<SearchChunksResult[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("search_chunks", {
    query_embedding: toPgVector(queryEmbedding),
    match_count: MATCH_COUNT,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function generateAnswer(
  question: string,
  chunks: SearchChunksResult[],
): Promise<string> {
  const ai = getGoogleEmbeddingClient();
  console.log("Building context");
  const context = buildContext(chunks);
  const sourceFileNames = getSourceFileNames(chunks);
  const prompt = buildPrompt(question, context);

  console.log("Calling Gemini");

  const response = await ai.models.generateContent({
    model: GOOGLE_ANSWER_MODEL,
    contents: prompt,
  });

  const answer = response.text?.trim() || "";
  if (!answer) {
    throw new Error("Gemini가 빈 답변을 반환했습니다.");
  }

  return appendSourceFooter(answer, sourceFileNames);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { question?: unknown };
    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return jsonResponse(
        {
          ok: false,
          error: "질문을 입력해 주세요.",
          code: "unknown",
        },
        { status: 400 },
      );
    }

    console.log("Question received", { question });

    let queryEmbedding: number[];
    try {
      const ai = getGoogleEmbeddingClient();
      queryEmbedding = await createGoogleEmbedding(
        ai,
        question,
        "RETRIEVAL_QUERY",
      );
      console.log("Question embedding created", {
        length: queryEmbedding.length,
        firstValues: queryEmbedding.slice(0, 3),
      });
    } catch (error) {
      console.error("[rag-answer:embedding:error]", error);
      return jsonResponse(
        {
          ok: false,
          error: "질문을 벡터로 변환하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          code: "embedding_failed",
        },
        { status: 500 },
      );
    }

    let chunks: SearchChunksResult[];
    try {
      console.log("Searching chunks");
      chunks = await searchChunks(queryEmbedding);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "문서 검색 중 오류가 발생했습니다.";
      console.error("[rag-answer:search:error]", error);
      return jsonResponse(
        { ok: false, error: message, code: "unknown" },
        { status: 500 },
      );
    }

    if (chunks.length === 0) {
      console.log("Top 5 chunks found", { count: 0 });
      return jsonResponse(
        { ok: false, error: NO_CONTEXT_MESSAGE, code: "no_results" },
        { status: 404 },
      );
    }

    console.log("Top 5 chunks found", { count: chunks.length });
    for (const chunk of chunks) {
      console.log(`Similarity: ${chunk.similarity}`);
      console.log(`Source file: ${chunk.file_name ?? "알 수 없음"}`);
      console.log("Chunk:");
      console.log(chunk.content);
      console.log("---");
    }

    try {
      const answer = await generateAnswer(question, chunks);
      console.log("Answer generated", { length: answer.length });
      return jsonResponse({ ok: true, answer, chunks });
    } catch (error) {
      console.error("[rag-answer:gemini:error]", error);
      return jsonResponse(
        {
          ok: false,
          error: "Gemini 답변 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          code: "gemini_failed",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "답변 생성 중 알 수 없는 오류가 발생했습니다.";
    console.error("[rag-answer:error]", error);
    return jsonResponse(
      { ok: false, error: message, code: "unknown" },
      { status: 500 },
    );
  }
}
