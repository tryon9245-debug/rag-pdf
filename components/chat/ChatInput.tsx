"use client";

import { type FormEvent, useState } from "react";
import { inputClassName } from "@/components/landing/FormField";

type ChatInputProps = {
  onSubmit: (question: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSubmit(trimmed);
    setQuestion("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 shrink-0">
      <label htmlFor="chat-question" className="text-sm font-medium text-slate-700">
        질문
      </label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-end">
        <textarea
          id="chat-question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="문서에 대해 질문해 보세요..."
          disabled={disabled}
          className={`${inputClassName} min-h-[6.5rem] resize-none sm:flex-1`}
        />
        <button
          type="submit"
          disabled={disabled || !question.trim()}
          className="w-full shrink-0 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:shadow-none sm:w-auto sm:py-2.5"
        >
          질문하기
        </button>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        Enter로 전송 · Shift+Enter로 줄바꿈
      </p>
    </form>
  );
}
