import { GoogleGenAI } from "@google/genai";

export const GOOGLE_EMBEDDING_MODEL = "gemini-embedding-001";
export const GOOGLE_EMBEDDING_DIMENSION = 768;
export const GOOGLE_ANSWER_MODEL = "gemini-2.5-flash";

export function getGoogleEmbeddingClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY가 설정되어 있지 않습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function createGoogleEmbedding(
  ai: GoogleGenAI,
  content: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: GOOGLE_EMBEDDING_MODEL,
    contents: content,
    config: {
      taskType,
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

export function toPgVector(values: number[]): string {
  return `[${values.join(",")}]`;
}
