export function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0 rounded-[8px] border border-border bg-card/70 px-2 py-1.5">
      <p className="truncate text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-xs font-semibold text-foreground">{value}</p>
      {hint ? (
        <p className="truncate text-[0.65rem] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
