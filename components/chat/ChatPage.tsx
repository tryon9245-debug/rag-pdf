"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageCard, PageShell } from "@/components/layout/PageShell";
import { getConsultationSessionForChat } from "@/lib/consultation/session";
import type { ConsultationSession } from "@/lib/consultation/types";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSessionInfo } from "./ChatSessionInfo";
import type { ChatMessage } from "./types";

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatPage() {
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setSession(getConsultationSessionForChat());
  }, []);

  const handleQuestionSubmit = (question: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        role: "user",
        content: question,
        createdAt: Date.now(),
      },
    ]);
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
              AI 문서 상담 서비스
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              업로드한 문서를 바탕으로 상담을 진행합니다
            </p>
          </div>
          <span className="h-10 w-10 shrink-0" aria-hidden />
        </header>

        <ChatSessionInfo session={session} />

        <main className="mt-4 flex h-36 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50">
          <ChatMessageList messages={messages} />
        </main>

        <ChatInput onSubmit={handleQuestionSubmit} />
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
