import { formatGenderLabel } from "@/lib/consultation/labels";
import type { ConsultationSession } from "@/lib/consultation/types";

type ChatSessionInfoProps = {
  session: ConsultationSession;
};

export function ChatSessionInfo({ session }: ChatSessionInfoProps) {
  const items = [
    { label: "업로드된 파일", value: session.pdfFileName },
    { label: "이름", value: session.name },
    { label: "나이", value: session.age },
    { label: "성별", value: formatGenderLabel(session.gender) },
    { label: "직업", value: session.occupation },
  ] as const;

  return (
    <section className="mt-4 shrink-0">
      <h2 className="text-sm font-medium text-slate-700">상담 정보</h2>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm"
          >
            <dt className="text-xs text-slate-500">{item.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900 break-all">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
