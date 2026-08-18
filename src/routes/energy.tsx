import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Metric, Panel } from "@/components/solar/ui-bits";
import { buildRange } from "@/lib/solar/historical";
import { useSolar } from "@/lib/solar/useSolar";

export const Route = createFileRoute("/energy")({
  head: () => ({
    meta: [
      { title: "Energy Monitoring — SunTrack Pro" },
      {
        name: "description",
        content: "Voltage, current, power and energy yield charts for the SunTrack Pro solar tracking system.",
      },
      { property: "og:title", content: "Energy Monitoring — SunTrack Pro" },
      { property: "og:description", content: "Interactive power, energy and sunlight charts with time filters." },
    ],
  }),
  component: EnergyPage,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
};

function EnergyPage() {
  const s = useSolar();
  const [range, setRange] = useState<1 | 7 | 30>(1);
  const data = buildRange(range, s.power.energyToday);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold">Energy Monitoring</h1>
          <p className="text-sm text-muted-foreground">Power = Voltage × Current, computed live</p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-border">
          {([1, 7, 30] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {r === 1 ? "Today" : `${r} Days`}
            </button>
          ))}
        </div>
      </div>

      <Panel title="Electrical measurements" icon={<Zap className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          <Metric label="Voltage" value={s.power.voltage.toFixed(2)} unit="V" tone="info" />
          <Metric label="Current" value={s.power.current.toFixed(2)} unit="A" tone="info" />
          <Metric label="Power" value={s.power.power.toFixed(2)} unit="W" tone="solar" />
          <Metric label="Energy today" value={s.power.energyToday.toFixed(3)} unit="kWh" tone="success" />
          <Metric label="Total energy" value={s.power.energyTotal.toFixed(2)} unit="kWh" tone="success" />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Power vs time">
          <div className="h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="pwr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--solar)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--solar)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} unit="W" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="power" stroke="var(--solar)" fill="url(#pwr)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Energy generated">
          <div className="h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} unit="kWh" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="energy" fill="var(--success)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Sunlight vs time" className="xl:col-span-2">
          <div className="h-[240px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} unit="W/m²" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="sunlight" stroke="var(--info)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Live power stream" className="xl:col-span-2">
          <div className="h-[240px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={s.history}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="clock" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} unit="W" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="var(--solar)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}