import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  Home,
  Joystick,
  Lock,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SolarTrackerVisualization } from "@/components/solar/SolarTrackerVisualization";
import { Metric, Panel, StatusBadge } from "@/components/solar/ui-bits";
import { engine, useSolar } from "@/lib/solar/useSolar";
import { useAuth } from "@/lib/auth/AuthContext";

export const Route = createFileRoute("/control")({
  head: () => ({
    meta: [
      { title: "Manual Control — SunTrack Pro" },
      {
        name: "description",
        content:
          "Manually jog the dual-axis solar tracker, set azimuth and elevation, center, park or e-stop.",
      },
      { property: "og:title", content: "Manual Control — SunTrack Pro" },
      {
        property: "og:description",
        content: "Full manual control panel for the solar tracking hardware.",
      },
    ],
  }),
  component: ControlPage,
});

function ControlPage() {
  const s = useSolar();
  const st = s.settings;
  const locked = s.emergencyStop;
  const { executeProtectedAction, isAuthenticated } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Manual Control</h1>
          <p className="text-sm text-muted-foreground">
            Limits: AZ {st.minAzimuth}°–{st.maxAzimuth}° · EL {st.minElevation}°–{st.maxElevation}°
          </p>
        </div>
        {!isAuthenticated && (
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-solar" />
            <span>Authorization required to execute controls</span>
          </span>
        )}
      </div>

      {locked && (
        <div className="rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <strong className="text-destructive">EMERGENCY STOP ACTIVE.</strong> All motors halted.
          Press{" "}
          <Button
            size="sm"
            className="mx-1 h-7 cursor-pointer"
            onClick={() => executeProtectedAction(() => engine.resume(), "Resume System Movement")}
          >
            Resume System
          </Button>{" "}
          to re-enable movement.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SolarTrackerVisualization />

        <div className="space-y-4">
          <Panel
            title="Mode"
            icon={<Joystick className="h-4 w-4" />}
            actions={
              !isAuthenticated ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Lock className="h-3 w-3 text-solar" /> Auth on change
                </span>
              ) : null
            }
          >
            <div className="grid grid-cols-2 gap-2">
              {(["auto", "manual"] as const).map((m) => (
                <Button
                  key={m}
                  variant={s.mode === m ? "default" : "secondary"}
                  onClick={() =>
                    executeProtectedAction(
                      () => engine.setMode(m),
                      `Switch to ${m.toUpperCase()} Tracking Mode`,
                    )
                  }
                  className="cursor-pointer"
                >
                  {m === "auto" ? "Auto Tracking" : "Manual Control"}
                </Button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Metric
                label="Panel azimuth"
                value={s.panel.azimuth.toFixed(1)}
                unit="°"
                tone="info"
              />
              <Metric
                label="Panel elevation"
                value={s.panel.elevation.toFixed(1)}
                unit="°"
                tone="info"
              />
            </div>
          </Panel>

          <Panel
            title="Jog control"
            actions={
              !isAuthenticated ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Lock className="h-3 w-3 text-solar" /> Protected
                </span>
              ) : null
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Horizontal axis
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    disabled={locked}
                    onClick={() =>
                      executeProtectedAction(
                        () => engine.nudge("azimuth", -10),
                        "Jog Azimuth Left -10°",
                      )
                    }
                    className="cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    disabled={locked}
                    onClick={() =>
                      executeProtectedAction(
                        () => engine.stopAxis("azimuth"),
                        "Halt Azimuth Axis Motor",
                      )
                    }
                    className="cursor-pointer"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={locked}
                    onClick={() =>
                      executeProtectedAction(
                        () => engine.nudge("azimuth", 10),
                        "Jog Azimuth Right +10°",
                      )
                    }
                    className="cursor-pointer"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Vertical axis
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    disabled={locked}
                    onClick={() =>
                      executeProtectedAction(
                        () => engine.nudge("elevation", 5),
                        "Jog Elevation Up +5°",
                      )
                    }
                    className="cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    disabled={locked}
                    onClick={() =>
                      executeProtectedAction(
                        () => engine.stopAxis("elevation"),
                        "Halt Elevation Axis Motor",
                      )
                    }
                    className="cursor-pointer"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={locked}
                    onClick={() =>
                      executeProtectedAction(
                        () => engine.nudge("elevation", -5),
                        "Jog Elevation Down -5°",
                      )
                    }
                    className="cursor-pointer"
                  >
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
                  onValueChange={(v) => {
                    if (isAuthenticated) {
                      engine.setPanel({ azimuth: v[0] ?? 0 });
                    } else {
                      executeProtectedAction(
                        () => engine.setPanel({ azimuth: v[0] ?? 0 }),
                        `Set Target Azimuth to ${v[0] ?? 0}°`,
                      );
                    }
                  }}
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
                  onValueChange={(v) => {
                    if (isAuthenticated) {
                      engine.setPanel({ elevation: v[0] ?? 0 });
                    } else {
                      executeProtectedAction(
                        () => engine.setPanel({ elevation: v[0] ?? 0 }),
                        `Set Target Elevation to ${v[0] ?? 0}°`,
                      );
                    }
                  }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={locked}
                onClick={() =>
                  executeProtectedAction(
                    () => engine.centerPanel(),
                    "Center Solar Panel (Az 180°, El 45°)",
                  )
                }
                className="gap-1.5 cursor-pointer"
              >
                <Crosshair className="h-4 w-4" /> Center Panel
              </Button>
              <Button
                variant="secondary"
                disabled={locked}
                onClick={() =>
                  executeProtectedAction(() => engine.resetPosition(), "Reset Panel Orientation")
                }
                className="gap-1.5 cursor-pointer"
              >
                <Home className="h-4 w-4" /> Reset Position
              </Button>

              {/* Emergency Stop is ALWAYS IMMEDIATE */}
              {s.emergencyStop ? (
                <Button
                  onClick={() =>
                    executeProtectedAction(() => engine.resume(), "Resume System Movement")
                  }
                  className="cursor-pointer"
                >
                  Resume System
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => engine.emergencyStop()}
                  className="cursor-pointer"
                  title="Immediate Emergency Stop (No auth required)"
                >
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
