export type Gender = "" | "male" | "female" | "other";

/** 화면·폼 state용 PDF 메타데이터 (직렬화 가능) */
export type SelectedPdfMeta = {
  name: string;
  sizeBytes: number;
  sizeLabel: string;
  lastModified: number;
  stateKey: string;
};

/**
 * 파일 선택 직후 전달되는 전체 정보.
 * file은 React state 대신 ConsultationForm의 pdfFileRef에 보관합니다.
 */
export type SelectedPdfFile = SelectedPdfMeta & {
  file: File;
};

export type ConsultationFormData = {
  selectedPdf: SelectedPdfMeta | null;
  name: string;
  age: string;
  gender: Gender;
  occupation: string;
};

export const initialConsultationFormData: ConsultationFormData = {
  selectedPdf: null,
  name: "",
  age: "",
  gender: "",
  occupation: "",
};
