import { createFileRoute } from "@tanstack/react-router";
import { Moon, RotateCcw, Settings as SettingsIcon, Sliders, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/solar/ui-bits";
import { engine, useSolar } from "@/lib/solar/useSolar";
import type { Settings } from "@/lib/solar/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SunTrack Pro" },
      {
        name: "description",
        content: "Configure tracking deadband, axis limits, night parking position and hardware connection.",
      },
      { property: "og:title", content: "Settings — SunTrack Pro" },
      { property: "og:description", content: "Tracking, night, system and hardware configuration." },
    ],
  }),
  component: SettingsPage,
});

function NumberField({
  label,
  value,
  field,
  min,
  max,
  unit,
}: {
  label: string;
  value: number;
  field: keyof Settings;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label} {unit ? `(${unit})` : ""}
      </Label>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => engine.updateSettings({ [field]: Number(e.target.value) } as Partial<Settings>)}
      />
    </div>
  );
}

function TextField({ label, value, field }: { label: string; value: string; field: keyof Settings }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => engine.updateSettings({ [field]: e.target.value } as Partial<Settings>)}
      />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-md)] bg-background/40 px-3 py-2.5">
      <span className="min-w-0 truncate text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SettingsPage() {
  const s = useSolar();
  const st = s.settings;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Saved locally — applied to the simulation immediately</p>
        </div>
        <Button size="sm" variant="destructive" onClick={() => engine.factoryReset()} className="gap-1.5">
          <RotateCcw className="h-4 w-4" /> Factory reset
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Tracking settings" icon={<Sliders className="h-4 w-4" />}>
          <div className="space-y-2">
            <ToggleRow
              label="Automatic tracking"
              checked={st.autoTracking}
              onChange={(v) => engine.updateSettings({ autoTracking: v })}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <NumberField label="Sensor deadband" field="deadband" value={st.deadband} min={1} max={300} />
            <NumberField
              label="Tracking interval"
              field="trackingInterval"
              value={st.trackingInterval}
              unit="ms"
              min={100}
              max={5000}
            />
            <NumberField label="Min azimuth" field="minAzimuth" value={st.minAzimuth} min={0} max={360} unit="°" />
            <NumberField label="Max azimuth" field="maxAzimuth" value={st.maxAzimuth} min={0} max={360} unit="°" />
            <NumberField
              label="Min elevation"
              field="minElevation"
              value={st.minElevation}
              min={0}
              max={90}
              unit="°"
            />
            <NumberField
              label="Max elevation"
              field="maxElevation"
              value={st.maxElevation}
              min={0}
              max={90}
              unit="°"
            />
          </div>
        </Panel>

        <Panel title="Night settings" icon={<Moon className="h-4 w-4" />}>
          <ToggleRow
            label="Night mode & parking"
            checked={st.nightModeEnabled}
            onChange={(v) => engine.updateSettings({ nightModeEnabled: v })}
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <NumberField
              label="Night parking azimuth"
              field="nightAzimuth"
              value={st.nightAzimuth}
              min={0}
              max={360}
              unit="°"
            />
            <NumberField
              label="Night parking elevation"
              field="nightElevation"
              value={st.nightElevation}
              min={0}
              max={90}
              unit="°"
            />
          </div>
        </Panel>

        <Panel title="System settings" icon={<SettingsIcon className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="System name" field="systemName" value={st.systemName} />
            <TextField label="Location" field="location" value={st.location} />
          </div>
          <div className="mt-3 space-y-2">
            <ToggleRow
              label={`Measurement units: ${st.units === "metric" ? "Metric" : "Imperial"}`}
              checked={st.units === "metric"}
              onChange={(v) => engine.updateSettings({ units: v ? "metric" : "imperial" })}
            />
            <ToggleRow
              label="Simulation mode (no hardware)"
              checked={st.simulationMode}
              onChange={(v) => engine.updateSettings({ simulationMode: v })}
            />
          </div>
        </Panel>

        <Panel title="Hardware settings" icon={<Wifi className="h-4 w-4" />}>
          <div className="space-y-3">
            <TextField label="ESP32 IP address" field="esp32Ip" value={st.esp32Ip} />
            <TextField label="Sensor configuration" field="sensorConfig" value={st.sensorConfig} />
            <TextField label="Motor configuration" field="motorConfig" value={st.motorConfig} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Stored locally. When simulation mode is off the hardware layer will target this endpoint.
          </p>
        </Panel>
      </div>
    </div>
  );
}