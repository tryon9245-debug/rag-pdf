import type { ConsultationFormData } from "@/components/landing/types";
import {
  CONSULTATION_SESSION_KEY,
  type ConsultationSession,
} from "./types";

/** 세션 없을 때 /chat 에서 쓰는 임시 데이터 */
export const MOCK_CONSULTATION_SESSION: ConsultationSession = {
  pdfFileName: "sample-document.pdf",
  name: "홍길동",
  age: "32",
  gender: "male",
  occupation: "회사원",
};

export function formDataToSession(
  formData: ConsultationFormData,
): ConsultationSession {
  return {
    pdfFileName: formData.selectedPdf?.name ?? MOCK_CONSULTATION_SESSION.pdfFileName,
    name: formData.name.trim() || MOCK_CONSULTATION_SESSION.name,
    age: formData.age.trim() || MOCK_CONSULTATION_SESSION.age,
    gender: formData.gender || MOCK_CONSULTATION_SESSION.gender,
    occupation:
      formData.occupation.trim() || MOCK_CONSULTATION_SESSION.occupation,
  };
}

export function saveConsultationSession(session: ConsultationSession): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(CONSULTATION_SESSION_KEY, JSON.stringify(session));
}

export function loadConsultationSession(): ConsultationSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(CONSULTATION_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as ConsultationSession;
  } catch {
    return null;
  }
}

export function getConsultationSessionForChat(): ConsultationSession {
  return loadConsultationSession() ?? MOCK_CONSULTATION_SESSION;
}
