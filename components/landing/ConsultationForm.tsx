"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { toPdfUploadErrorMessage } from "@/lib/documents/errors";
import { extractPdfTextFromFile } from "@/lib/documents/extractPdfText";
import { uploadPdfAndCreateDocument } from "@/lib/documents/uploadPdf";
import { backfillDocumentEmbeddingsFromApi } from "@/lib/embeddings/backfillDocumentEmbeddingsClient";
import { formDataToSession, saveConsultationSession } from "@/lib/consultation/session";
import { createConsultationUser } from "@/lib/users/createUser";
import { FormField, inputClassName } from "./FormField";
import { PdfUploadField } from "./PdfUploadField";
import {
  initialConsultationFormData,
  type ConsultationFormData,
  type Gender,
  type SelectedPdfFile,
} from "./types";

const GENDER_OPTIONS: { value: Exclude<Gender, "">; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "other", label: "기타" },
];

type SubmitStep = "idle" | "uploading" | "chunking" | "embedding";

const SUBMIT_STEP_LABEL: Record<SubmitStep, string> = {
  idle: "상담 시작하기",
  uploading: "PDF 업로드 중 (1/3)",
  chunking: "업로드 파일 청킹 중 (2/3)",
  embedding: "임베딩 중 (3/3)",
};

export function ConsultationForm() {
  const router = useRouter();
  /** PDF File 원본 — formData와 별도로 ref에 보관 (React state 직렬화 이슈 방지) */
  const pdfFileRef = useRef<File | null>(null);
  const [formData, setFormData] = useState<ConsultationFormData>(
    initialConsultationFormData,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = <K extends keyof ConsultationFormData>(
    key: K,
    value: ConsultationFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePdfChange = (selected: SelectedPdfFile | null) => {
    pdfFileRef.current = selected?.file ?? null;
    const meta = selected
      ? {
          name: selected.name,
          sizeBytes: selected.sizeBytes,
          sizeLabel: selected.sizeLabel,
          lastModified: selected.lastModified,
          stateKey: selected.stateKey,
        }
      : null;

    flushSync(() => {
      setFormData((prev) => ({ ...prev, selectedPdf: meta }));
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const file = pdfFileRef.current;
    if (!file || !formData.selectedPdf) {
      const message = "PDF 파일을 선택해 주세요.";
      setSubmitError(message);
      window.alert(message);
      return;
    }

    setIsSubmitting(true);
    setSubmitStep("uploading");
    try {
      const user = await createConsultationUser(formData);
      const { document, fileUrl } = await uploadPdfAndCreateDocument(file, {
        userId: user.id,
      });
      let chunksSaved = 0;

      try {
        setSubmitStep("chunking");
        const extraction = await extractPdfTextFromFile(file, document.id);
        chunksSaved = extraction.chunksSaved ?? 0;
        console.log("[pdf-text-extraction:client]", {
          documentId: document.id,
          textLength: extraction.textLength,
          chunksSaved,
        });
      } catch (error) {
        console.error("[pdf-text-extraction:client:error]", error);
      }

      if (chunksSaved > 0) {
        try {
          setSubmitStep("embedding");
          const embedding = await backfillDocumentEmbeddingsFromApi(
            document.id,
            chunksSaved,
          );
          console.log("[embedding-backfill:client]", {
            documentId: document.id,
            processed: embedding.processed,
            failed: embedding.failed,
          });
        } catch (error) {
          console.error("[embedding-backfill:client:error]", error);
        }
      }

      saveConsultationSession({
        ...formDataToSession(formData),
        documentId: document.id,
        fileUrl,
      });
      router.push(`/chat?documentId=${encodeURIComponent(document.id)}`);
    } catch (error) {
      const message = toPdfUploadErrorMessage(error);
      setSubmitError(message);
      window.alert(message);
    } finally {
      setIsSubmitting(false);
      setSubmitStep("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <PdfUploadField
        selectedPdf={formData.selectedPdf}
        onPdfChange={handlePdfChange}
      />

      <FormField id="name" label="이름">
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="이름을 입력하세요"
          className={inputClassName}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="age" label="나이">
          <input
            id="age"
            type="number"
            min={1}
            inputMode="numeric"
            value={formData.age}
            onChange={(e) => updateField("age", e.target.value)}
            placeholder="나이"
            className={inputClassName}
          />
        </FormField>

        <FormField id="gender" label="성별">
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => updateField("gender", e.target.value as Gender)}
            className={inputClassName}
          >
            <option value="" disabled>
              선택하세요
            </option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="occupation" label="직업">
        <input
          id="occupation"
          type="text"
          value={formData.occupation}
          onChange={(e) => updateField("occupation", e.target.value)}
          placeholder="직업을 입력하세요"
          className={inputClassName}
        />
      </FormField>

      {submitError ? (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? SUBMIT_STEP_LABEL[submitStep] : SUBMIT_STEP_LABEL.idle}
      </button>
    </form>
  );
}
