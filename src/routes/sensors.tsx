import { createFileRoute } from "@tanstack/react-router";
import { Gauge as GaugeIcon } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gauge, Metric, Panel, StatusBadge } from "@/components/solar/ui-bits";
import { useSolar } from "@/lib/solar/useSolar";

export const Route = createFileRoute("/sensors")({
  head: () => ({
    meta: [
      { title: "Sensor Data — SunTrack Pro" },
      {
        name: "description",
        content:
          "Live LDR sensor readings, sensor health and light-difference analytics for the solar tracker.",
      },
      { property: "og:title", content: "Sensor Data — SunTrack Pro" },
      {
        property: "og:description",
        content: "Four-LDR array readings with animated gauges and live charts.",
      },
    ],
  }),
  component: SensorsPage,
});

const sensorMeta = [
  { key: "left", label: "LDR Left", color: "var(--solar)" },
  { key: "right", label: "LDR Right", color: "var(--info)" },
  { key: "top", label: "LDR Top", color: "var(--success)" },
  { key: "bottom", label: "LDR Bottom", color: "var(--destructive)" },
] as const;

function SensorsPage() {
  const s = useSolar();
  const values = sensorMeta.map((m) => s.sensors[m.key]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const diff = max - min;
  const health = values.some((v) => v === 0) ? "danger" : diff > 300 ? "warning" : "success";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Sensor Data</h1>
        <p className="text-sm text-muted-foreground">Four-LDR array · 10-bit ADC (0–1023)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sensorMeta.map((m) => (
          <Panel key={m.key} title={m.label} icon={<GaugeIcon className="h-4 w-4" />}>
            <div
              className="font-display text-4xl font-bold tabular-nums"
              style={{ color: m.color }}
            >
              {s.sensors[m.key]}
            </div>
            <div className="mt-3">
              <Gauge value={s.sensors[m.key]} tone={m.color} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {((s.sensors[m.key] / 1023) * 100).toFixed(0)}% of full scale
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel title="Analytics">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Average light" value={avg.toFixed(0)} tone="solar" />
            <Metric label="Max sensor" value={max} />
            <Metric label="Min sensor" value={min} />
            <Metric
              label="Difference"
              value={diff}
              tone={diff > s.settings.deadband ? "danger" : "success"}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge tone={health}>
              Sensor health:{" "}
              {health === "success" ? "good" : health === "warning" ? "imbalanced" : "fault"}
            </StatusBadge>
            <StatusBadge tone="muted">Deadband: {s.settings.deadband}</StatusBadge>
          </div>
        </Panel>

        <Panel title="Live sensor readings">
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={s.history}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="clock" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis domain={[0, 1023]} stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Legend />
                {sensorMeta.map((m) => (
                  <Line
                    key={m.key}
                    type="monotone"
                    dataKey={m.key}
                    name={m.label}
                    stroke={m.color}
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
