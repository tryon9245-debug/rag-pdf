import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="text-center">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
        <span aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          AI 문서 기반 상담 서비스
        </h1>
        <Link
          href="/chat"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
          aria-label="정보 입력 없이 상담 화면으로 이동"
          title="정보 입력 없이 상담하기"
        >
          <ArrowRightIcon />
        </Link>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
        PDF 문서를 업로드하고 맞춤형 상담을 받아보세요
      </p>
    </header>
  );
}

function ArrowRightIcon() {
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
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );
}
