import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  /** true면 뷰포트 높이에 맞춰 페이지 스크롤 방지 */
  fitViewport?: boolean;
};

export function PageShell({
  children,
  mainClassName = "",
  fitViewport = false,
}: PageShellProps) {
  return (
    <div
      className={[
        "flex flex-1 flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-10 sm:px-6 sm:py-16",
        fitViewport ? "h-dvh max-h-dvh min-h-0 overflow-hidden" : "min-h-full",
      ].join(" ")}
    >
      <main
        className={[
          "mx-auto flex w-full max-w-lg flex-col justify-center",
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
        "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
