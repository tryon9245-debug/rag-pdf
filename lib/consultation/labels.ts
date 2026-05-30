import type { Gender } from "@/components/landing/types";

const GENDER_LABELS: Record<Exclude<Gender, "">, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
};

export function formatGenderLabel(gender: Gender): string {
  if (!gender) {
    return "미입력";
  }
  return GENDER_LABELS[gender];
}
