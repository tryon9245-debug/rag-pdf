const PDF_BUCKET = "pdf-files";

export function getPdfStorageBucket(): string {
  return PDF_BUCKET;
}

/** Storage object key: ASCII-only `{timestamp}-{random}.pdf` inside bucket `pdf-files`. */
export function buildPdfStoragePath(fileName: string, timestampMs = Date.now()): string {
  const extension = getPdfExtension(fileName);
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12);
  return `${timestampMs}-${randomId}${extension}`;
}

function getPdfExtension(fileName: string): ".pdf" {
  const baseName = fileName.replace(/^.*[\\/]/, "").trim();
  return baseName.toLowerCase().endsWith(".pdf") ? ".pdf" : ".pdf";
}
