import { createFileRoute } from "@tanstack/react-router";
import { Compass, Sun } from "lucide-react";
import { SolarTrackerVisualization } from "@/components/solar/SolarTrackerVisualization";
import { SimulationControls } from "@/components/solar/SimulationControls";
import { Metric, Panel, RadialProgress, StatusBadge } from "@/components/solar/ui-bits";
import { useSolar } from "@/lib/solar/useSolar";
import { formatClock } from "@/lib/solar/types";

export const Route = createFileRoute("/tracking")({
  head: () => ({
    meta: [
      { title: "Live Tracking — SunTrack Pro" },
      {
        name: "description",
        content:
          "Watch the dual-axis solar panel rotate toward the Sun in real time with live azimuth and elevation data.",
      },
      { property: "og:title", content: "Live Tracking — SunTrack Pro" },
      {
        property: "og:description",
        content: "Animated live solar tracker visualization and telemetry.",
      },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  const s = useSolar();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Live Tracking</h1>
        <p className="text-sm text-muted-foreground">
          Dual-axis tracker following the Sun · simulated clock {formatClock(s.simMinutes)}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <SolarTrackerVisualization />
          <SimulationControls />
        </div>

        <div className="space-y-4">
          <Panel title="Sun" icon={<Sun className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Azimuth" value={s.sun.azimuth.toFixed(1)} unit="°" tone="solar" />
              <Metric
                label="Elevation"
                value={Math.max(0, s.sun.elevation).toFixed(1)}
                unit="°"
                tone="solar"
              />
              <Metric label="Sunrise" value={formatClock(s.sunriseMinutes)} />
              <Metric label="Sunset" value={formatClock(s.sunsetMinutes)} />
            </div>
          </Panel>

          <Panel title="Panel" icon={<Compass className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Azimuth" value={s.panel.azimuth.toFixed(1)} unit="°" tone="info" />
              <Metric label="Elevation" value={s.panel.elevation.toFixed(1)} unit="°" tone="info" />
              <Metric label="Target AZ" value={s.target.azimuth.toFixed(1)} unit="°" />
              <Metric label="Target EL" value={s.target.elevation.toFixed(1)} unit="°" />
            </div>
          </Panel>

          <Panel title="Error & Status">
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Azimuth error" value={s.azError.toFixed(1)} unit="°" />
              <Metric label="Elevation error" value={s.elError.toFixed(1)} unit="°" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge
                tone={
                  s.emergencyStop ? "danger" : s.night ? "info" : s.aligned ? "success" : "warning"
                }
              >
                {s.emergencyStop
                  ? "Tracking error / E-stop"
                  : s.night
                    ? "Night mode"
                    : s.aligned
                      ? "Sun aligned"
                      : "Adjusting position"}
              </StatusBadge>
              <StatusBadge tone="muted">AZ motor: {s.motors.azimuth}</StatusBadge>
              <StatusBadge tone="muted">EL motor: {s.motors.elevation}</StatusBadge>
            </div>
            <div className="mt-4">
              <RadialProgress value={s.efficiency} label="Tracking efficiency" size={140} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
