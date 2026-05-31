const PDF_BUCKET = "pdf-files";

export function getPdfStorageBucket(): string {
  return PDF_BUCKET;
}

/** Storage object key: `{timestamp}_{fileName}` inside bucket `pdf-files`. */
export function buildPdfStoragePath(fileName: string, timestampMs = Date.now()): string {
  const safeName = sanitizeStorageFileName(fileName);
  return `${timestampMs}_${safeName}`;
}

export function sanitizeStorageFileName(fileName: string): string {
  const baseName = fileName.replace(/^.*[\\/]/, "").trim();
  const sanitized = baseName
    .replace(/[^\w.\-()\uAC00-\uD7A3\s]/g, "_")
    .replace(/\s+/g, "_");

  if (!sanitized) {
    return "document.pdf";
  }
  return sanitized.toLowerCase().endsWith(".pdf")
    ? sanitized
    : `${sanitized}.pdf`;
}
