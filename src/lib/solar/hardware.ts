import type { Angles, SensorReadings } from "./types";

/**
 * Hardware abstraction layer.
 *
 * The tracking logic and UI only ever talk to a `HardwareSource`. Today the
 * only implementation is `SimulatedHardware`; later an `Esp32Hardware`
 * (REST / WebSocket / MQTT) can be dropped in without touching the UI.
 */
export interface HardwareReading {
  sensors: SensorReadings;
  voltage: number;
  current: number;
}

export interface HardwareSource {
  readonly kind: "simulated" | "esp32";
  read(input: {
    sun: Angles;
    panel: Angles;
    irradiance: number;
    night: boolean;
    faultySensor: "left" | "right" | "top" | "bottom" | null;
  }): HardwareReading;
  /** Command the tracker (simulated motors move the panel in the engine). */
  write(target: Angles): void;
}

const noise = (amp: number) => (Math.random() - 0.5) * 2 * amp;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export class SimulatedHardware implements HardwareSource {
  readonly kind = "simulated" as const;
  private commanded: Angles = { azimuth: 180, elevation: 10 };

  write(target: Angles) {
    this.commanded = target;
  }

  lastCommand(): Angles {
    return this.commanded;
  }

  read({
    sun,
    panel,
    irradiance,
    night,
    faultySensor,
  }: {
    sun: Angles;
    panel: Angles;
    irradiance: number;
    night: boolean;
    faultySensor: "left" | "right" | "top" | "bottom" | null;
  }): HardwareReading {
    const azErr = sun.azimuth - panel.azimuth;
    const elErr = sun.elevation - panel.elevation;

    // Base light on the sensor module scales with irradiance (0..1)
    const base = night ? 18 + noise(6) : 120 + irradiance * 760;

    // A misalignment shifts light toward the sensor on that side.
    const azShift = clamp(azErr * 5.5, -260, 260);
    const elShift = clamp(elErr * 5.5, -260, 260);

    const build = (v: number) => clamp(Math.round(v + noise(night ? 4 : 12)), 0, 1023);

    const readings: SensorReadings = {
      left: build(base - azShift),
      right: build(base + azShift),
      top: build(base + elShift),
      bottom: build(base - elShift),
    };
    if (faultySensor) readings[faultySensor] = 0;

    const avg = (readings.left + readings.right + readings.top + readings.bottom) / 4;
    const alignFactor = Math.max(
      0,
      Math.cos((Math.abs(azErr) * Math.PI) / 180) * 0.6 +
        Math.cos((Math.abs(elErr) * Math.PI) / 180) * 0.4,
    );

    const voltage = night ? Math.max(0, 0.4 + noise(0.2)) : 15.5 + (avg / 1023) * 5.2 + noise(0.15);
    const current = night ? 0 : Math.max(0, (avg / 1023) * 3.1 * alignFactor + noise(0.05));

    return {
      sensors: readings,
      voltage: Number(voltage.toFixed(2)),
      current: Number(current.toFixed(2)),
    };
  }
}