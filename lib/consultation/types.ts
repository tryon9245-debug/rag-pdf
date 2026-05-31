import type { Gender } from "@/components/landing/types";

/** /chat 페이지에 표시·전달하는 상담 세션 (임시, sessionStorage) */
export type ConsultationSession = {
  pdfFileName: string;
  /** Supabase `documents.id` after upload */
  documentId?: string;
  /** Storage public or signed URL saved in `documents.file_url` */
  fileUrl?: string;
  name: string;
  age: string;
  gender: Gender;
  occupation: string;
};

export const CONSULTATION_SESSION_KEY = "consultation-session";
