export class PdfUploadError extends Error {
  readonly code: "config" | "storage" | "database" | "validation";

  constructor(
    message: string,
    code: PdfUploadError["code"],
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "PdfUploadError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

import { isNetworkFetchError } from "@/lib/supabase/env";

function messageFromCause(cause: unknown): string | null {
  if (isNetworkFetchError(cause)) {
    return NETWORK_ERROR_MESSAGE;
  }
  if (cause instanceof Error && cause.message) {
    return cause.message;
  }
  return null;
}

const NETWORK_ERROR_MESSAGE =
  "Supabase 서버에 연결하지 못했습니다. .env.local의 Project URL·anon 키가 맞는지 확인하고, dev 서버를 재시작한 뒤 다시 시도해 주세요. (브라우저에서 Project URL이 열리는지도 확인해 보세요.)";

export function toPdfUploadErrorMessage(error: unknown): string {
  if (error instanceof PdfUploadError) {
    const fromCause = error.cause ? messageFromCause(error.cause) : null;
    if (fromCause && isNetworkFetchError(error.cause)) {
      return NETWORK_ERROR_MESSAGE;
    }
    return error.message;
  }
  if (isNetworkFetchError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }
  if (error instanceof Error && error.message) {
    if (isNetworkFetchError(error)) {
      return NETWORK_ERROR_MESSAGE;
    }
    return error.message;
  }
  return "PDF 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}
