import { getSupabaseClient } from "@/lib/supabaseClient";
import { isNetworkFetchError } from "@/lib/supabase/env";
import type { DocumentRow } from "@/lib/supabase/types";
import { PdfUploadError } from "./errors";
import { buildPdfStoragePath, getPdfStorageBucket } from "./storagePath";

const SIGNED_URL_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

export type UploadPdfResult = {
  document: DocumentRow;
  storagePath: string;
  fileUrl: string;
};

export type UploadPdfOptions = {
  userId?: string | null;
  /** When true, store a signed URL instead of the public URL. */
  useSignedUrl?: boolean;
};

function assertPdfFile(file: File): void {
  if (!file || file.size === 0) {
    throw new PdfUploadError(
      "PDF 파일을 선택해 주세요.",
      "validation",
    );
  }
}

async function resolveFileUrl(
  storagePath: string,
  useSignedUrl: boolean,
): Promise<string> {
  const supabase = getSupabaseClient();
  const bucket = getPdfStorageBucket();

  if (useSignedUrl) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SEC);

    if (error || !data?.signedUrl) {
      throw new PdfUploadError(
        "파일 URL을 생성하지 못했습니다.",
        "storage",
        { cause: error },
      );
    }
    return data.signedUrl;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Uploads a PDF to Supabase Storage (`pdf-files`) and inserts a `documents` row.
 */
export async function uploadPdfAndCreateDocument(
  file: File,
  options: UploadPdfOptions = {},
): Promise<UploadPdfResult> {
  assertPdfFile(file);

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (error) {
    throw new PdfUploadError(
      "Supabase 연결 설정이 없습니다. .env.local 파일을 확인해 주세요.",
      "config",
      { cause: error },
    );
  }

  const bucket = getPdfStorageBucket();
  const storagePath = buildPdfStoragePath(file.name);
  const useSignedUrl =
    options.useSignedUrl ??
    process.env.NEXT_PUBLIC_SUPABASE_PDF_USE_SIGNED_URL === "true";

  let uploadError;
  try {
    const result = await supabase.storage.from(bucket).upload(storagePath, file, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });
    uploadError = result.error;
  } catch (error) {
    if (isNetworkFetchError(error)) {
      throw new PdfUploadError(
        "Supabase Storage에 연결하지 못했습니다. .env.local의 URL·anon 키를 확인하고 dev 서버를 재시작해 주세요.",
        "storage",
        { cause: error },
      );
    }
    throw error;
  }

  if (uploadError) {
    const message =
      uploadError.message === "Failed to fetch"
        ? "Supabase Storage에 연결하지 못했습니다. URL·키와 pdf-files 버킷 설정을 확인해 주세요."
        : uploadError.message || "Storage 업로드에 실패했습니다.";
    throw new PdfUploadError(message, "storage", { cause: uploadError });
  }

  const fileUrl = await resolveFileUrl(storagePath, useSignedUrl);

  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({
      user_id: options.userId ?? null,
      file_name: file.name,
      file_url: fileUrl,
    })
    .select()
    .single();

  if (insertError || !document) {
    await supabase.storage.from(bucket).remove([storagePath]);
    throw new PdfUploadError(
      insertError?.message || "문서 정보 저장에 실패했습니다.",
      "database",
      { cause: insertError },
    );
  }

  return {
    document,
    storagePath,
    fileUrl,
  };
}
