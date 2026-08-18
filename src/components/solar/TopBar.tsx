import { Bell, Pause, Play, Power, ShieldAlert, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { engine, useSolar } from "@/lib/solar/useSolar";
import { formatClock } from "@/lib/solar/types";
import { StatusBadge, StatusDot } from "./ui-bits";

export function TopBar() {
  const s = useSolar();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger />
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-bold sm:text-base">{s.settings.systemName}</div>
            <div className="hidden truncate text-[11px] text-muted-foreground sm:block">
              {s.settings.location}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2 overflow-hidden">
          <span className="hidden font-mono text-sm tabular-nums text-solar sm:inline">
            {formatClock(s.simMinutes)}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-border px-2 py-1 text-[11px] md:inline-flex">
            <StatusDot level={s.online ? "ok" : "error"} />
            {s.settings.simulationMode ? "Simulated Link" : "ESP32 Link"}
          </span>
          <StatusBadge tone={s.night ? "info" : s.aligned ? "success" : "warning"}>
            {s.night ? "Night mode" : s.aligned ? "Sun aligned" : "Adjusting"}
          </StatusBadge>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden overflow-hidden rounded-full border border-border sm:flex">
            {(["auto", "manual"] as const).map((m) => (
              <button
                key={m}
                onClick={() => engine.setMode(m)}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  s.mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => engine.setSimulating(!s.simulating)}
            title={s.simulating ? "Pause simulation" : "Resume simulation"}
          >
            {s.simulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          {s.emergencyStop ? (
            <Button size="sm" onClick={() => engine.resume()} className="gap-1.5">
              <Power className="h-4 w-4" /> Resume
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => engine.emergencyStop()} className="gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">E-Stop</span>
            </Button>
          )}
          <Button asChild size="sm" variant="ghost" className="relative">
            <Link to="/alerts">
              <Bell className="h-4 w-4" />
              {s.alerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {s.alerts.length}
                </span>
              )}
            </Link>
          </Button>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-secondary">
            <User className="h-4 w-4" />
          </span>
        </div>
      </div>
    </header>
  );
}