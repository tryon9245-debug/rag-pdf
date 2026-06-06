"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageCard, PageShell } from "@/components/layout/PageShell";
import { createRagAnswer } from "@/lib/chat/ragAnswer";
import { getConsultationSessionForChat } from "@/lib/consultation/session";
import type { ConsultationSession } from "@/lib/consultation/types";
import { getDocumentById } from "@/lib/documents/getDocument";
import type { DocumentRow } from "@/lib/supabase/types";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSessionInfo } from "./ChatSessionInfo";
import type { ChatMessage } from "./types";

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type DocumentLookupState = {
  document: DocumentRow | null;
  error: string | null;
  isLoading: boolean;
};

export function ChatPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId")?.trim() || null;
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [documentLookup, setDocumentLookup] = useState<DocumentLookupState>({
    document: null,
    error: null,
    isLoading: false,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    setSession(getConsultationSessionForChat());
  }, []);

  useEffect(() => {
    if (!documentId) {
      setDocumentLookup({
        document: null,
        error: null,
        isLoading: false,
      });
      return;
    }

    let isCurrent = true;
    setDocumentLookup({
      document: null,
      error: null,
      isLoading: true,
    });

    getDocumentById(documentId)
      .then((document) => {
        if (!isCurrent) {
          return;
        }
        setDocumentLookup({
          document,
          error: null,
          isLoading: false,
        });
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }
        const message =
          error instanceof Error && error.message
            ? error.message
            : "문서 정보를 조회하지 못했습니다.";
        setDocumentLookup({
          document: null,
          error: message,
          isLoading: false,
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [documentId]);

  const appendMessage = (message: Omit<ChatMessage, "id" | "createdAt">) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        ...message,
        createdAt: Date.now(),
      },
    ]);
  };

  const handleQuestionSubmit = (question: string) => {
    appendMessage({ role: "user", content: question });
    setIsAnswering(true);

    createRagAnswer(question)
      .then((result) => {
        if (result.ok) {
          appendMessage({ role: "assistant", content: result.answer });
          return;
        }

        appendMessage({ role: "assistant", content: result.error });
      })
      .catch((error: unknown) => {
        console.error("[rag-answer:client:error]", error);
        appendMessage({
          role: "assistant",
          content: "답변 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        });
      })
      .finally(() => {
        setIsAnswering(false);
      });
  };

  if (!session) {
    return (
      <PageShell fitViewport>
        <PageCard className="py-12 text-center text-sm text-slate-500">
          불러오는 중…
        </PageCard>
      </PageShell>
    );
  }

  const displayedSession: ConsultationSession = {
    ...session,
    documentId: documentLookup.document?.id ?? documentId ?? session.documentId,
    fileUrl: documentLookup.document?.file_url ?? session.fileUrl,
    pdfFileName: documentLookup.isLoading
      ? "문서 정보를 불러오는 중…"
      : documentLookup.error
        ? documentLookup.error
        : documentLookup.document?.file_name ?? session.pdfFileName,
  };
  const uploadFileStatus = documentLookup.isLoading
    ? "loading"
    : documentLookup.error
      ? "error"
      : "ready";

  return (
    <PageShell fitViewport>
      <PageCard className="flex max-h-full min-h-0 flex-col overflow-hidden">
        <header className="flex shrink-0 items-start gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
            aria-label="홈으로 돌아가기"
          >
            <BackIcon />
          </Link>
          <div className="min-w-0 flex-1 pt-0.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              AI 문서 기반 상담 서비스
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              업로드한 문서를 바탕으로 상담을 진행합니다
            </p>
          </div>
          <span className="h-10 w-10 shrink-0" aria-hidden />
        </header>

        <ChatSessionInfo
          session={displayedSession}
          uploadFileStatus={uploadFileStatus}
        />

        <main className="mt-4 flex h-36 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50">
          <ChatMessageList messages={messages} />
        </main>

        <ChatInput onSubmit={handleQuestionSubmit} disabled={isAnswering} />
      </PageCard>
    </PageShell>
  );
}

function BackIcon() {
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
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
      />
    </svg>
  );
}
