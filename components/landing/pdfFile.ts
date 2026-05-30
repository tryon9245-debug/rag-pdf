import type { SelectedPdfFile } from "./types";

const PDF_MIME = "application/pdf";
const PDF_EXTENSION = ".pdf";

const PDF_MIME_TYPES = new Set([
  PDF_MIME,
  "application/x-pdf",
  "application/acrobat",
  "application/vnd.pdf",
]);

export function isPdfFile(file: File): boolean {
  const hasPdfExtension = file.name.toLowerCase().endsWith(PDF_EXTENSION);
  if (hasPdfExtension) {
    return true;
  }
  return PDF_MIME_TYPES.has(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function createSelectedPdfFile(file: File): SelectedPdfFile {
  const sizeLabel = formatFileSize(file.size);
  return {
    file,
    name: file.name,
    sizeBytes: file.size,
    sizeLabel,
    lastModified: file.lastModified,
    stateKey: `${file.name}-${file.size}-${file.lastModified}`,
  };
}
