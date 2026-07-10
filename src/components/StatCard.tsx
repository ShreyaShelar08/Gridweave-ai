interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  accent?: "solar" | "grid" | "success" | "danger" | "neutral";
  sub?: string;
}

const accentMap: Record<NonNullable<StatCardProps["accent"]>, string> = {
  solar: "text-solar",
  grid: "text-grid",
  success: "text-success",
  danger: "text-danger",
  neutral: "text-text",
};

export default function StatCard({
  label,
  value,
  unit,
  accent = "neutral",
  sub,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-dim">
        {label}
      </p>
      <p className={`mt-1.5 font-mono-num text-2xl font-medium tabular-nums ${accentMap[accent]}`}>
        {value}
        {unit && <span className="ml-1 text-sm text-text-muted">{unit}</span>}
      </p>
      {sub && <p className="mt-1 text-[12px] text-text-muted">{sub}</p>}
    </div>
  );
}