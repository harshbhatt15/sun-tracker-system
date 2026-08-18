import { createFileRoute } from "@tanstack/react-router";
import { Activity, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metric, Panel, StatusDot } from "@/components/solar/ui-bits";
import { HEALTH_KEYS } from "@/lib/solar/types";
import { engine, useSolar } from "@/lib/solar/useSolar";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "System Health — SunTrack Pro" },
      {
        name: "description",
        content: "Health status of the ESP32 link, LDR sensors, tracker motors, panel and power sensor.",
      },
      { property: "og:title", content: "System Health — SunTrack Pro" },
      { property: "og:description", content: "Subsystem diagnostics for the solar tracking controller." },
    ],
  }),
  component: HealthPage,
});

const labels = { ok: "Operational", warn: "Warning", error: "Error" } as const;

function HealthPage() {
  const s = useSolar();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold">System Health</h1>
          <p className="text-sm text-muted-foreground">
            Last update {new Date(s.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => engine.injectSensorFault()} className="gap-1.5">
          <Wrench className="h-4 w-4" /> Toggle sensor fault
        </Button>
      </div>

      <Panel title="Subsystems" icon={<Activity className="h-4 w-4" />}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {HEALTH_KEYS.map((k) => {
            const level = s.health[k] ?? "ok";
            return (
              <li
                key={k}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/40 px-3 py-2.5"
              >
                <span className="min-w-0 truncate text-sm">{k}</span>
                <span className="flex items-center gap-2 text-xs">
                  <StatusDot level={level} />
                  <span
                    className={
                      level === "ok" ? "text-success" : level === "warn" ? "text-warning" : "text-destructive"
                    }
                  >
                    {labels[level]}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Runtime telemetry">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Metric label="Mode" value={s.mode === "auto" ? "AUTO" : "MANUAL"} tone="info" />
          <Metric label="AZ motor" value={s.motors.azimuth} />
          <Metric label="EL motor" value={s.motors.elevation} />
          <Metric label="Efficiency" value={s.efficiency.toFixed(1)} unit="%" tone="solar" />
          <Metric label="Irradiance" value={(s.irradiance * 1000).toFixed(0)} unit="W/m²" />
          <Metric label="Voltage" value={s.power.voltage.toFixed(2)} unit="V" />
          <Metric label="Firmware link" value={s.settings.simulationMode ? "SIMULATED" : s.settings.esp32Ip} />
          <Metric label="Alerts" value={s.alerts.length} />
        </div>
      </Panel>
    </div>
  );
}