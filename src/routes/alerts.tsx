import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Trash2, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { alertTone, Panel, StatusBadge } from "@/components/solar/ui-bits";
import { engine, useSolar } from "@/lib/solar/useSolar";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "System Alerts — SunTrack Pro" },
      {
        name: "description",
        content: "Live alerts and notifications from the SunTrack Pro dual-axis solar tracker.",
      },
      { property: "og:title", content: "System Alerts — SunTrack Pro" },
      { property: "og:description", content: "Tracking, sensor and motor alerts with timestamps." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const s = useSolar();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold">Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground">System events with timestamps</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => engine.injectSensorFault()} className="gap-1.5">
            <Zap className="h-4 w-4" /> Simulate fault
          </Button>
          <Button size="sm" variant="secondary" onClick={() => engine.clearAlerts()} className="gap-1.5">
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      <Panel title={`${s.alerts.length} alerts`} icon={<BellRing className="h-4 w-4" />}>
        {s.alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No alerts. System nominal.</p>
        ) : (
          <ul className="space-y-2">
            {s.alerts.map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={alertTone[a.level]}>{a.level}</StatusBadge>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {new Date(a.at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{a.message}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => engine.dismissAlert(a.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}