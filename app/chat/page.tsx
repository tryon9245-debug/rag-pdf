import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatPage } from "@/components/chat/ChatPage";

export const metadata: Metadata = {
  title: "상담 | AI 문서 기반 상담 서비스",
  description: "업로드한 PDF 문서에 대해 AI 상담을 진행합니다.",
};

export default function ChatRoutePage() {
  return (
    <Suspense fallback={null}>
      <ChatPage />
    </Suspense>
  );
}
