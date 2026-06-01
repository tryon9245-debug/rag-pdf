import { getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { chunkText } from "@/lib/documents/chunkText";
import { getSupabaseClient } from "@/lib/supabaseClient";

export const runtime = "nodejs";

PDFParse.setWorker(getData());

type ExtractPdfTextResponse =
  | {
      ok: true;
      textLength: number;
      saved: boolean;
      chunksSaved: number;
    }
  | {
      ok: false;
      error: string;
    };

function jsonResponse(
  body: ExtractPdfTextResponse,
  init?: ResponseInit,
): Response {
  return Response.json(body, init);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const documentId = formData.get("documentId");

    if (typeof documentId !== "string" || !documentId.trim()) {
      return jsonResponse(
        { ok: false, error: "documentId가 없습니다." },
        { status: 400 },
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      return jsonResponse(
        { ok: false, error: "PDF 파일이 없습니다." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });

    try {
      const result = await parser.getText();
      const text = result.text ?? "";
      console.log("[pdf-text-extraction]", {
        documentId,
        fileName: file.name,
        textLength: text.length,
      });
      console.log(text);

      const supabase = getSupabaseClient();
      const { data: updatedDocument, error: updateError } = await supabase
        .from("documents")
        .update({ extracted_text: text })
        .eq("id", documentId)
        .select("id")
        .single();

      if (updateError || !updatedDocument) {
        const message =
          updateError?.message || "문서 텍스트 저장 결과를 확인하지 못했습니다.";
        console.error("[pdf-text-extraction:save:error]", {
          documentId,
          message,
        });
        return jsonResponse(
          { ok: false, error: message },
          { status: 500 },
        );
      }

      console.log("[pdf-text-extraction:save:success]", {
        documentId,
        textLength: text.length,
      });

      const { error: deleteChunksError } = await supabase
        .from("document_chunks")
        .delete()
        .eq("document_id", documentId);

      if (deleteChunksError) {
        console.error("[document-chunks:delete:error]", {
          documentId,
          message: deleteChunksError.message,
        });
        return jsonResponse(
          { ok: false, error: deleteChunksError.message },
          { status: 500 },
        );
      }

      const chunks = chunkText(text);
      if (chunks.length > 0) {
        const { error: insertChunksError } = await supabase
          .from("document_chunks")
          .insert(
            chunks.map((content, chunkIndex) => ({
              document_id: documentId,
              chunk_index: chunkIndex,
              content,
            })),
          );

        if (insertChunksError) {
          console.error("[document-chunks:save:error]", {
            documentId,
            message: insertChunksError.message,
          });
          return jsonResponse(
            { ok: false, error: insertChunksError.message },
            { status: 500 },
          );
        }
      }

      console.log("[document-chunks:save:success]", {
        documentId,
        chunkCount: chunks.length,
      });

      return jsonResponse({
        ok: true,
        textLength: text.length,
        saved: true,
        chunksSaved: chunks.length,
      });
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "PDF 텍스트 추출에 실패했습니다.";
    console.error("[pdf-text-extraction:error]", error);
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
}
