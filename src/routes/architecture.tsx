import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Cpu } from "lucide-react";
import { Panel } from "@/components/solar/ui-bits";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Hardware Architecture — SunTrack Pro" },
      {
        name: "description",
        content:
          "Block diagram of the SunTrack Pro dual-axis tracker: LDR array, ESP32, tracking algorithm, motors, panel and dashboard.",
      },
      { property: "og:title", content: "Hardware Architecture — SunTrack Pro" },
      { property: "og:description", content: "How the sensors, controller, motors and dashboard connect." },
    ],
  }),
  component: ArchitecturePage,
});

const blocks = [
  { title: "SUN", note: "Solar irradiance source" },
  { title: "LDR SENSOR ARRAY", note: "4× LDR (left / right / top / bottom)" },
  { title: "ESP32 MICROCONTROLLER", note: "ADC sampling @ 10-bit, Wi-Fi telemetry" },
  { title: "TRACKING ALGORITHM", note: "Differential comparison + deadband" },
  { title: "AZIMUTH + ELEVATION MOTORS", note: "Dual-axis servo / stepper drive" },
  { title: "SOLAR PANEL", note: "Rotated to face maximum irradiance" },
  { title: "POWER SENSOR", note: "Voltage & current sensing (INA219)" },
  { title: "SUNTRACK PRO WEB DASHBOARD", note: "This monitoring & control interface" },
];

const steps = [
  ["Detect Sunlight", "LDR sensors measure light intensity from four directions."],
  ["Compare Sensors", "The controller compares opposing sensor pairs."],
  ["Calculate Direction", "The system determines where the strongest sunlight comes from."],
  ["Move Panel", "Motors rotate the panel toward the Sun on both axes."],
  ["Confirm Alignment", "When the difference is inside the deadband, motors stop."],
  ["Generate Energy", "The aligned panel captures more light and generates more power."],
];

function ArchitecturePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Hardware Architecture</h1>
        <p className="text-sm text-muted-foreground">
          Data path from the Sun to this dashboard — designed so the simulated layer can be swapped for a real
          ESP32 over REST, WebSocket or MQTT.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Block diagram" icon={<Cpu className="h-4 w-4" />}>
          <ol className="space-y-1">
            {blocks.map((b, i) => (
              <li key={b.title}>
                <div
                  className="rounded-[var(--radius-md)] border border-border bg-background/50 px-3 py-2.5 transition-transform hover:-translate-y-0.5"
                  style={{ animation: `fade-in 0.5s ease-out ${i * 0.08}s both` }}
                >
                  <div className="truncate font-display text-sm font-bold text-solar">{b.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{b.note}</div>
                </div>
                {i < blocks.length - 1 && (
                  <div className="grid place-items-center py-1 text-primary">
                    <ArrowDown className="h-4 w-4 animate-pulse" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-4">
          <Panel title="How it works">
            <ol className="space-y-3">
              {steps.map(([title, body], i) => (
                <li key={title} className="flex gap-3">
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-xs font-bold text-primary-foreground"
                    style={{ backgroundImage: "var(--gradient-solar)" }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{title}</div>
                    <p className="text-xs text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Software layers">
            <div className="space-y-2 font-mono text-xs">
              {[
                "Hardware Data Layer  (SimulatedHardware | Esp32Hardware)",
                "Tracking Logic       (differential compare + deadband + limits)",
                "Application State    (simulation engine store + localStorage)",
                "Dashboard / UI       (React + TypeScript + Tailwind)",
              ].map((line) => (
                <div key={line} className="rounded-md bg-background/60 px-3 py-2">
                  {line}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}