import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  Home,
  Joystick,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SolarTrackerVisualization } from "@/components/solar/SolarTrackerVisualization";
import { Metric, Panel, StatusBadge } from "@/components/solar/ui-bits";
import { engine, useSolar } from "@/lib/solar/useSolar";

export const Route = createFileRoute("/control")({
  head: () => ({
    meta: [
      { title: "Manual Control — SunTrack Pro" },
      {
        name: "description",
        content: "Manually jog the dual-axis solar tracker, set azimuth and elevation, center, park or e-stop.",
      },
      { property: "og:title", content: "Manual Control — SunTrack Pro" },
      { property: "og:description", content: "Full manual control panel for the solar tracking hardware." },
    ],
  }),
  component: ControlPage,
});

function ControlPage() {
  const s = useSolar();
  const st = s.settings;
  const locked = s.emergencyStop;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Manual Control</h1>
        <p className="text-sm text-muted-foreground">
          Limits: AZ {st.minAzimuth}°–{st.maxAzimuth}° · EL {st.minElevation}°–{st.maxElevation}°
        </p>
      </div>

      {locked && (
        <div className="rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <strong className="text-destructive">EMERGENCY STOP ACTIVE.</strong> All motors halted. Press{" "}
          <Button size="sm" className="mx-1 h-7" onClick={() => engine.resume()}>
            Resume System
          </Button>{" "}
          to re-enable movement.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SolarTrackerVisualization />

        <div className="space-y-4">
          <Panel title="Mode" icon={<Joystick className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {(["auto", "manual"] as const).map((m) => (
                <Button
                  key={m}
                  variant={s.mode === m ? "default" : "secondary"}
                  onClick={() => engine.setMode(m)}
                >
                  {m === "auto" ? "Auto Tracking" : "Manual Control"}
                </Button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Metric label="Panel azimuth" value={s.panel.azimuth.toFixed(1)} unit="°" tone="info" />
              <Metric label="Panel elevation" value={s.panel.elevation.toFixed(1)} unit="°" tone="info" />
            </div>
          </Panel>

          <Panel title="Jog control">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Horizontal axis
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="secondary" disabled={locked} onClick={() => engine.nudge("azimuth", -10)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" disabled={locked} onClick={() => engine.stopAxis("azimuth")}>
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" disabled={locked} onClick={() => engine.nudge("azimuth", 10)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Vertical axis
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="secondary" disabled={locked} onClick={() => engine.nudge("elevation", 5)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" disabled={locked} onClick={() => engine.stopAxis("elevation")}>
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" disabled={locked} onClick={() => engine.nudge("elevation", -5)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Azimuth</span>
                  <span className="font-mono text-solar">{s.target.azimuth.toFixed(0)}°</span>
                </div>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  disabled={locked}
                  value={[s.target.azimuth]}
                  onValueChange={([v]) => engine.setPanel({ azimuth: v })}
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Elevation</span>
                  <span className="font-mono text-solar">{s.target.elevation.toFixed(0)}°</span>
                </div>
                <Slider
                  min={0}
                  max={90}
                  step={1}
                  disabled={locked}
                  value={[s.target.elevation]}
                  onValueChange={([v]) => engine.setPanel({ elevation: v })}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" disabled={locked} onClick={() => engine.centerPanel()} className="gap-1.5">
                <Crosshair className="h-4 w-4" /> Center Panel
              </Button>
              <Button variant="secondary" disabled={locked} onClick={() => engine.resetPosition()} className="gap-1.5">
                <Home className="h-4 w-4" /> Reset Position
              </Button>
              {s.emergencyStop ? (
                <Button onClick={() => engine.resume()}>Resume System</Button>
              ) : (
                <Button variant="destructive" onClick={() => engine.emergencyStop()}>
                  Emergency Stop
                </Button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge tone={s.motors.azimuth === "IDLE" ? "muted" : "warning"}>
                AZ motor: {s.motors.azimuth}
              </StatusBadge>
              <StatusBadge tone={s.motors.elevation === "IDLE" ? "muted" : "warning"}>
                EL motor: {s.motors.elevation}
              </StatusBadge>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}