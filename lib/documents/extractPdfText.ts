export type ExtractPdfTextResult = {
  ok: boolean;
  textLength?: number;
  saved?: boolean;
  chunksSaved?: number;
  error?: string;
};

export async function extractPdfTextFromFile(
  file: File,
  documentId: string,
): Promise<ExtractPdfTextResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentId", documentId);

  const response = await fetch("/api/pdf/extract-text", {
    method: "POST",
    body: formData,
  });
  const result = (await response.json()) as ExtractPdfTextResult;

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "PDF 텍스트 추출에 실패했습니다.");
  }

  return result;
}
