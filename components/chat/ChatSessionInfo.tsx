import { formatGenderLabel } from "@/lib/consultation/labels";
import type { ConsultationSession } from "@/lib/consultation/types";

type ChatSessionInfoProps = {
  session: ConsultationSession;
  uploadFileStatus?: "ready" | "loading" | "error";
};

function InfoCard({
  label,
  value,
  className = "",
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={[
        "min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm",
        className,
      ].join(" ")}
    >
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`mt-0.5 truncate text-sm font-medium ${valueClassName}`}>
        {value}
      </dd>
    </div>
  );
}

export function ChatSessionInfo({
  session,
  uploadFileStatus = "ready",
}: ChatSessionInfoProps) {
  const uploadFileValueClassName =
    uploadFileStatus === "error"
      ? "text-red-600"
      : uploadFileStatus === "loading"
        ? "text-slate-500"
        : "text-slate-900";

  return (
    <section className="mt-4 shrink-0">
      <h2 className="text-sm font-medium text-slate-700">상담 정보</h2>
      <dl className="mt-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <InfoCard
            label="업로드된 파일"
            value={session.pdfFileName}
            valueClassName={uploadFileValueClassName}
          />
          <InfoCard label="이름" value={session.name} />
        </div>
        <div className="flex gap-2">
          <InfoCard label="나이" value={session.age} />
          <InfoCard label="성별" value={formatGenderLabel(session.gender)} />
          <InfoCard label="직업" value={session.occupation} />
        </div>
      </dl>
    </section>
  );
}
