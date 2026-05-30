import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  /** true면 뷰포트 높이에 맞춰 페이지 스크롤 방지 */
  fitViewport?: boolean;
};

/** 랜딩·상담 화면 공통 콘텐츠 폭 */
export const PAGE_CONTENT_WIDTH_CLASS = "w-full max-w-lg";

export function PageShell({
  children,
  mainClassName = "",
  fitViewport = false,
}: PageShellProps) {
  return (
    <div
      className={[
        "flex flex-1 flex-col items-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-10 sm:px-6 sm:py-16",
        fitViewport ? "h-dvh max-h-dvh min-h-0 overflow-hidden" : "min-h-full w-full",
      ].join(" ")}
    >
      <main
        className={[
          "flex flex-col justify-center",
          PAGE_CONTENT_WIDTH_CLASS,
          fitViewport ? "min-h-0 flex-1" : "flex-1",
          mainClassName,
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

export function PageCard({ children, className = "" }: PageCardProps) {
  return (
    <div
      className={[
        "w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
