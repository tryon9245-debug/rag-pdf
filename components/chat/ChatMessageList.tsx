import type { ChatMessage } from "./types";

type ChatMessageListProps = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 py-4 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <ChatIcon />
        </span>
        <p className="mt-4 text-xs font-medium text-slate-700">
          문서에 대해 궁금한 점을 질문해 보세요
        </p>
        <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500">
          질문하면 업로드한 문서를 바탕으로 답변합니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <li
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-md",
                isUser
                  ? "rounded-br-md bg-indigo-600 text-white shadow-indigo-600/20"
                  : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-slate-200/80",
              ].join(" ")}
            >
              {message.content}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ChatIcon() {
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
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.41a.75.75 0 01-1.037-1.037A5.972 5.972 0 013.34 16.445 9.764 9.764 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}
