import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  hint?: string;
  /** false면 상단 라벨을 input과 연결하지 않음 (커스텀 파일 업로드 등) */
  associateLabel?: boolean;
};

export function FormField({
  id,
  label,
  children,
  hint,
  associateLabel = true,
}: FormFieldProps) {
  const LabelTag = associateLabel ? "label" : "span";
  const labelProps = associateLabel ? { htmlFor: id } : {};

  return (
    <div className="flex flex-col gap-1.5">
      <LabelTag
        {...labelProps}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </LabelTag>
      {children}
      {hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";
