import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AlertLevel, HealthLevel } from "@/lib/solar/types";

export function Panel({
  title,
  icon,
  actions,
  children,
  className,
}: {
  title?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-surface p-4 sm:p-5", className)}>
      {(title || actions) && (
        <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon ? <span className="shrink-0 text-primary">{icon}</span> : null}
            <h2 className="truncate text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </h2>
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  unit,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "default" | "solar" | "success" | "info" | "danger";
}) {
  const toneClass = {
    default: "text-foreground",
    solar: "text-solar",
    success: "text-success",
    info: "text-info",
    danger: "text-destructive",
  }[tone];
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] bg-background/40 px-3 py-2">
      <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("truncate font-display text-lg font-semibold tabular-nums", toneClass)}>
        {value}
        {unit ? <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span> : null}
      </div>
    </div>
  );
}

export function RadialProgress({
  value,
  label,
  size = 150,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const tone = pct >= 95 ? "var(--success)" : pct >= 70 ? "var(--solar)" : "var(--destructive)";
  return (
    <div className="relative mx-auto grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 400ms ease, stroke 400ms ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold tabular-nums">{pct.toFixed(1)}%</div>
        {label ? <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div> : null}
      </div>
    </div>
  );
}

export function StatusDot({ level }: { level: HealthLevel }) {
  const color = level === "ok" ? "bg-success" : level === "warn" ? "bg-warning" : "bg-destructive";
  return (
    <span className="relative grid h-3 w-3 shrink-0 place-items-center">
      <span className={cn("absolute h-3 w-3 rounded-full opacity-40 animate-pulse-ring", color)} />
      <span className={cn("h-2 w-2 rounded-full", color)} />
    </span>
  );
}

export function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "success" | "warning" | "info" | "danger" | "muted";
}) {
  const map = {
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    info: "bg-info/15 text-info border-info/30",
    danger: "bg-destructive/15 text-destructive border-destructive/30",
    muted: "bg-muted text-muted-foreground border-border",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        map,
      )}
    >
      {children}
    </span>
  );
}

export const alertTone: Record<AlertLevel, "success" | "warning" | "info" | "danger"> = {
  success: "success",
  warning: "warning",
  info: "info",
  error: "danger",
};

export function Gauge({ value, max = 1023, tone }: { value: number; max?: number; tone: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: tone }}
      />
    </div>
  );
}