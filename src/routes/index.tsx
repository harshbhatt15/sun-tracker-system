import { ClientTime } from "@/components/solar/ClientTime";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Compass, Gauge, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SolarTrackerVisualization } from "@/components/solar/SolarTrackerVisualization";
import { SimulationControls } from "@/components/solar/SimulationControls";
import { alertTone, Metric, Panel, RadialProgress, StatusBadge, StatusDot } from "@/components/solar/ui-bits";
import { formatClock, HEALTH_KEYS } from "@/lib/solar/types";
import { engine, useSolar } from "@/lib/solar/useSolar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SunTrack Pro — Solar Tracking Dashboard" },
      {
        name: "description",
        content:
          "Live monitoring and control dashboard for an intelligent dual-axis solar panel sun tracking system.",
      },
      { property: "og:title", content: "SunTrack Pro — Solar Tracking Dashboard" },
      {
        property: "og:description",
        content: "Sun position, panel orientation, LDR sensors, motors and energy yield in real time.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const s = useSolar();

  return (
    <div className="space-y-4">
      {/* Overview */}
      <section className="card-surface relative overflow-hidden p-5 sm:p-7">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-25 blur-3xl"
          style={{ backgroundImage: "var(--gradient-solar)" }}
        />
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          <span className="text-gradient-solar">SunTrack</span> Pro
        </h1>
        <p className="mt-1 font-display text-sm text-muted-foreground sm:text-base">
          Intelligent Solar Panel Sun Tracking &amp; Monitoring System
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          An automated dual-axis solar tracking system designed to continuously orient a solar panel toward the
          Sun for improved solar energy capture.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Metric label="Tracking efficiency" value={s.efficiency.toFixed(1)} unit="%" tone="solar" />
          <Metric label="Current power" value={s.power.power.toFixed(2)} unit="W" tone="success" />
          <Metric
            label="Sunlight intensity"
            value={(s.irradiance * 1000).toFixed(0)}
            unit="W/m²"
            tone="info"
          />
          <Metric label="Panel angle" value={`${s.panel.azimuth.toFixed(0)}° / ${s.panel.elevation.toFixed(0)}°`} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/tracking">Open Live Tracking</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/control">Manual Control</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => engine.startDemo()}>
            Run Project Demo
          </Button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <SolarTrackerVisualization />

          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="System status" icon={<Activity className="h-4 w-4" />}>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">System</span>
                  <span className="flex items-center gap-2">
                    <StatusDot level={s.emergencyStop ? "error" : "ok"} />
                    {s.emergencyStop ? "E-STOP" : "Online"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Tracking mode</span>
                  <span>{s.mode === "auto" ? "AUTO TRACKING" : "MANUAL CONTROL"}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Motors</span>
                  <span className="truncate font-mono text-xs">
                    {s.motors.azimuth} / {s.motors.elevation}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Sensors</span>
                  <span>{s.health["LDR Sensors"] === "ok" ? "All healthy" : "Check sensors"}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Last update</span>
                  <span className="font-mono text-xs"><ClientTime at={s.lastUpdate} /></span>
                </li>
              </ul>
            </Panel>

            <Panel title="Panel orientation" icon={<Compass className="h-4 w-4" />}>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Azimuth" value={s.panel.azimuth.toFixed(1)} unit="°" tone="info" />
                <Metric label="Elevation" value={s.panel.elevation.toFixed(1)} unit="°" tone="info" />
                <Metric label="Target azimuth" value={s.target.azimuth.toFixed(1)} unit="°" />
                <Metric label="Target elevation" value={s.target.elevation.toFixed(1)} unit="°" />
              </div>
            </Panel>

            <Panel title="Sun position" icon={<Sun className="h-4 w-4" />}>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Sun azimuth" value={s.sun.azimuth.toFixed(1)} unit="°" tone="solar" />
                <Metric
                  label="Sun elevation"
                  value={Math.max(0, s.sun.elevation).toFixed(1)}
                  unit="°"
                  tone="solar"
                />
                <Metric label="Sunrise" value={formatClock(s.sunriseMinutes)} />
                <Metric label="Sunset" value={formatClock(s.sunsetMinutes)} />
                <Metric label="Simulated time" value={formatClock(s.simMinutes)} />
                <Metric label="Day state" value={s.night ? "NIGHT" : "DAY"} tone={s.night ? "info" : "solar"} />
              </div>
            </Panel>

            <Panel title="Solar output" icon={<Zap className="h-4 w-4" />}>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Voltage" value={s.power.voltage.toFixed(2)} unit="V" />
                <Metric label="Current" value={s.power.current.toFixed(2)} unit="A" />
                <Metric label="Power" value={s.power.power.toFixed(2)} unit="W" tone="solar" />
                <Metric label="Today" value={s.power.energyToday.toFixed(3)} unit="kWh" tone="success" />
                <Metric label="Total" value={s.power.energyTotal.toFixed(2)} unit="kWh" tone="success" />
                <Metric label="Efficiency" value={s.efficiency.toFixed(1)} unit="%" />
              </div>
            </Panel>
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="Tracking efficiency">
            <RadialProgress value={s.efficiency} label="Sun alignment" />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <StatusBadge tone={s.night ? "info" : s.aligned ? "success" : "warning"}>
                {s.night ? "Night mode" : s.aligned ? "Sun aligned" : "Adjusting position"}
              </StatusBadge>
              <StatusBadge tone="muted">
                Δ AZ {s.azError.toFixed(1)}° · Δ EL {s.elError.toFixed(1)}°
              </StatusBadge>
            </div>
          </Panel>

          <Panel title="LDR sensors" icon={<Gauge className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Left" value={s.sensors.left} />
              <Metric label="Right" value={s.sensors.right} />
              <Metric label="Top" value={s.sensors.top} />
              <Metric label="Bottom" value={s.sensors.bottom} />
            </div>
            <Button asChild size="sm" variant="ghost" className="mt-3 w-full">
              <Link to="/sensors">View sensor dashboard</Link>
            </Button>
          </Panel>

          <SimulationControls />

          <Panel title="Recent alerts">
            {s.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts yet.</p>
            ) : (
              <ul className="space-y-2">
                {s.alerts.slice(0, 4).map((a) => (
                  <li key={a.id} className="rounded-md bg-background/40 px-3 py-2 text-xs">
                    <div className="mb-1 flex items-center gap-2">
                      <StatusBadge tone={alertTone[a.level]}>{a.level}</StatusBadge>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        <ClientTime at={a.at} />
                      </span>
                    </div>
                    <span>{a.message}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild size="sm" variant="ghost" className="mt-3 w-full">
              <Link to="/alerts">All alerts</Link>
            </Button>
          </Panel>

          <Panel title="System health">
            <ul className="space-y-1.5 text-sm">
              {HEALTH_KEYS.slice(0, 5).map((k) => (
                <li key={k} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-muted-foreground">{k}</span>
                  <StatusDot level={s.health[k] ?? "ok"} />
                </li>
              ))}
            </ul>
            <Button asChild size="sm" variant="ghost" className="mt-3 w-full">
              <Link to="/health">Full diagnostics</Link>
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
