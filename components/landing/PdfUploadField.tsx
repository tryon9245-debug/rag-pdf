"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { FormField } from "./FormField";
import { createSelectedPdfFile, isPdfFile } from "./pdfFile";
import type { SelectedPdfFile, SelectedPdfMeta } from "./types";

type PdfUploadFieldProps = {
  selectedPdf: SelectedPdfMeta | null;
  onPdfChange: (pdf: SelectedPdfFile | null) => void;
};

export function PdfUploadField({
  selectedPdf,
  onPdfChange,
}: PdfUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const hasFile = selectedPdf !== null;

  const readFileFromInput = (input: HTMLInputElement): File | undefined => {
    const file = input.files?.[0];
    if (file && file.size > 0) {
      return file;
    }
    return undefined;
  };

  const commitFile = (file: File) => {
    if (!isPdfFile(file)) {
      setSelectionError("PDF 파일만 선택할 수 있습니다.");
      return;
    }
    setSelectionError(null);
    onPdfChange(createSelectedPdfFile(file));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;

    const tryCommit = () => {
      const file = readFileFromInput(input);
      if (file) {
        commitFile(file);
      }
      // files가 비어 있어도 선택을 지우지 않음 (이전 버그 원인)
    };

    tryCommit();

    // 일부 브라우저는 change 직후 files가 비어 있다가 채워짐
    if (!readFileFromInput(input)) {
      requestAnimationFrame(tryCommit);
      window.setTimeout(tryCommit, 0);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectionError(null);
    onPdfChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDropZoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  return (
    <FormField id="pdf-upload-field" label="PDF 파일" associateLabel={false}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        tabIndex={-1}
        onChange={handleFileChange}
        aria-hidden
      />

      <div className="flex flex-col gap-3">
        <div
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={handleDropZoneKeyDown}
          className={[
            "relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
            hasFile
              ? "border-indigo-300 bg-indigo-50/60 hover:border-indigo-400 hover:bg-indigo-50"
              : "border-slate-200 bg-slate-50/80 hover:border-indigo-300 hover:bg-indigo-50/50",
          ].join(" ")}
        >
          {hasFile && selectedPdf ? (
            <>
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <CheckIcon className="h-3.5 w-3.5" />
                PDF 선택됨
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <PdfIcon />
              </span>
              <span className="max-w-full px-2 text-sm font-semibold text-slate-900 break-all">
                {selectedPdf.name}
              </span>
              <span className="rounded-md bg-white/80 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
                {selectedPdf.sizeLabel}
              </span>
              <span className="text-xs text-indigo-600">
                클릭하여 다른 PDF로 변경
              </span>
            </>
          ) : (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <PdfIcon />
              </span>
              <span className="text-sm font-medium text-slate-700">
                PDF 파일을 선택하세요
              </span>
              <span className="text-xs text-slate-500">
                클릭하여 업로드 · PDF만 지원
              </span>
            </>
          )}
        </div>

        <div
          id="pdf-file-status"
          role="status"
          aria-live="polite"
          className={[
            "flex items-start gap-3 rounded-lg border px-3.5 py-3",
            hasFile
              ? "border-emerald-200/80 bg-emerald-50/50"
              : "border-slate-200 bg-slate-50/80",
          ].join(" ")}
        >
          {hasFile && selectedPdf ? (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/80">
                  선택된 파일
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 break-all">
                  {selectedPdf.name}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  크기:{" "}
                  <span className="font-medium text-slate-800">
                    {selectedPdf.sizeLabel}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
              >
                선택 해제
              </button>
            </>
          ) : (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <EmptyFileIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500">선택된 파일 없음</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  위 영역을 클릭해 PDF 파일을 선택해 주세요.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {selectionError ? (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {selectionError}
        </p>
      ) : null}
    </FormField>
  );
}

function PdfIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function EmptyFileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
