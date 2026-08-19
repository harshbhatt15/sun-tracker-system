import { SimulatedHardware } from "./hardware";
import {
  DEFAULT_SETTINGS,
  HEALTH_KEYS,
  formatClock,
  type AlertLevel,
  type Angles,
  type HealthLevel,
  type Settings,
  type SolarState,
  type TrackingMode,
} from "./types";

const STORAGE_KEY = "suntrackpro.v1";
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function sunAt(minutes: number, sunrise: number, sunset: number): Angles {
  if (minutes <= sunrise || minutes >= sunset) return { azimuth: 90, elevation: -6 };
  const p = (minutes - sunrise) / (sunset - sunrise);
  return {
    azimuth: 78 + p * 204,
    elevation: Math.sin(Math.PI * p) * 74,
  };
}

function initialHealth(): Record<string, HealthLevel> {
  return Object.fromEntries(HEALTH_KEYS.map((k) => [k, "ok" as HealthLevel]));
}

function createInitialState(): SolarState {
  const sunriseMinutes = 6 * 60 + 10;
  const sunsetMinutes = 18 * 60 + 40;
  const simMinutes = 9 * 60 + 30;
  const sun = sunAt(simMinutes, sunriseMinutes, sunsetMinutes);
  return {
    online: true,
    simMinutes,
    speed: 5,
    simulating: true,
    mode: "auto",
    emergencyStop: false,
    night: false,
    sun,
    panel: { azimuth: sun.azimuth - 12, elevation: Math.max(5, sun.elevation - 8) },
    target: { ...sun },
    sensors: { left: 700, right: 660, top: 780, bottom: 560 },
    motors: { azimuth: "IDLE", elevation: "IDLE" },
    power: { voltage: 18.6, current: 2.45, power: 45.57, energyToday: 0.82, energyTotal: 128.4 },
    aligned: false,
    azError: 12,
    elError: 8,
    efficiency: 88,
    irradiance: 0.8,
    sunriseMinutes,
    sunsetMinutes,
    lastUpdate: Date.now(),
    alerts: [],
    health: initialHealth(),
    settings: { ...DEFAULT_SETTINGS },
    history: [],
    demoActive: false,
    demoStep: 0,
  };
}

export const DEMO_STEPS = [
  "Sunrise detected",
  "Sun begins moving",
  "Sensors detect sunlight",
  "Tracker starts",
  "Panel rotates toward Sun",
  "Panel aligned with Sun",
  "Power generation rising",
  "Panel following Sun",
  "Sunset",
  "Night mode active",
  "Parked at night position",
];

class SolarEngine {
  private state: SolarState = createInitialState();
  private listeners = new Set<() => void>();
  private raf: ReturnType<typeof setInterval> | null = null;
  private lastTick = 0;
  private lastSample = 0;
  private lastPersist = 0;
  private faultySensor: "left" | "right" | "top" | "bottom" | null = null;
  private hardware = new SimulatedHardware();
  private wasAligned = false;
  private hydrated = false;

  getSnapshot = () => this.state;

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    this.start();
    return () => {
      this.listeners.delete(cb);
      if (this.listeners.size === 0) this.stop();
    };
  };

  private set(patch: Partial<SolarState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  // ---------- persistence ----------
  hydrate() {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<SolarState>;
      this.set({
        settings: { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) },
        panel: saved.panel ?? this.state.panel,
        simMinutes: saved.simMinutes ?? this.state.simMinutes,
        speed: saved.speed ?? this.state.speed,
        mode: (saved.mode as TrackingMode) ?? this.state.mode,
        alerts: (saved.alerts ?? []).slice(0, 30),
        power: saved.power
          ? { ...this.state.power, energyTotal: saved.power.energyTotal ?? 128.4 }
          : this.state.power,
      });
    } catch {
      /* ignore corrupt storage */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    const { settings, panel, simMinutes, speed, mode, alerts, power } = this.state;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          settings,
          panel,
          simMinutes,
          speed,
          mode,
          alerts: alerts.slice(0, 30),
          power,
        }),
      );
    } catch {
      /* storage full / unavailable */
    }
  }

  // ---------- loop ----------
  private start() {
    if (this.raf) return;
    this.hydrate();
    this.lastTick = performance.now();
    this.raf = setInterval(() => this.tick(), 120);
  }

  private stop() {
    if (this.raf) clearInterval(this.raf);
    this.raf = null;
  }

  private tick() {
    const now = performance.now();
    const dt = Math.min(0.5, (now - this.lastTick) / 1000);
    this.lastTick = now;
    const s = this.state;
    const st = s.settings;

    // --- sun / clock ---
    let simMinutes = s.simMinutes;
    if (s.simulating && !s.emergencyStop) simMinutes = (simMinutes + dt * s.speed) % 1440;
    const sun = sunAt(simMinutes, s.sunriseMinutes, s.sunsetMinutes);
    const night = st.nightModeEnabled && sun.elevation <= 0;
    const irradiance = Math.max(0, Math.sin((Math.max(0, sun.elevation) * Math.PI) / 148));

    // --- hardware read ---
    const reading = this.hardware.read({
      sun,
      panel: s.panel,
      irradiance,
      night,
      faultySensor: this.faultySensor,
    });
    const sensors = reading.sensors;

    // --- tracking logic (sensor comparison, dual axis) ---
    let target = s.target;
    let motors = { ...s.motors };

    if (s.emergencyStop) {
      motors = { azimuth: "STOPPED", elevation: "STOPPED" };
      target = { ...s.panel };
    } else if (night) {
      target = { azimuth: st.nightAzimuth, elevation: st.nightElevation };
    } else if (s.mode === "auto" && st.autoTracking) {
      const dAz = sensors.right - sensors.left;
      const dEl = sensors.top - sensors.bottom;
      const stepAz =
        Math.abs(dAz) > st.deadband ? Math.sign(dAz) * Math.min(6, Math.abs(dAz) / 30) : 0;
      const stepEl =
        Math.abs(dEl) > st.deadband ? Math.sign(dEl) * Math.min(6, Math.abs(dEl) / 30) : 0;
      target = {
        azimuth: clamp(s.panel.azimuth + stepAz, st.minAzimuth, st.maxAzimuth),
        elevation: clamp(s.panel.elevation + stepEl, st.minElevation, st.maxElevation),
      };
    }
    this.hardware.write(target);

    // --- motor simulation: smooth slew toward target ---
    let panel = { ...s.panel };
    if (!s.emergencyStop) {
      const rate = (12 + s.speed * 1.4) * dt;
      const dAz = target.azimuth - panel.azimuth;
      const dEl = target.elevation - panel.elevation;
      const moveAz = clamp(dAz, -rate, rate);
      const moveEl = clamp(dEl, -rate, rate);
      panel = {
        azimuth: clamp(panel.azimuth + moveAz, st.minAzimuth, st.maxAzimuth),
        elevation: clamp(panel.elevation + moveEl, st.minElevation, st.maxElevation),
      };
      motors = {
        azimuth: Math.abs(dAz) < 0.25 ? "IDLE" : moveAz > 0 ? "ROTATING RIGHT" : "ROTATING LEFT",
        elevation: Math.abs(dEl) < 0.25 ? "IDLE" : moveEl > 0 ? "MOVING UP" : "MOVING DOWN",
      };
      if (this.faultySensor) motors.azimuth = s.mode === "auto" ? "ERROR" : motors.azimuth;
    }

    // --- alignment + efficiency ---
    const azError = Math.abs(sun.azimuth - panel.azimuth);
    const elError = Math.abs(sun.elevation - panel.elevation);
    const angular = Math.sqrt(azError * azError + elError * elError);
    const aligned = !night && angular < 3;
    const efficiency = night
      ? 0
      : Number(
          clamp(100 * Math.max(0, Math.cos((angular * Math.PI) / 180) ** 1.4), 0, 100).toFixed(1),
        );

    // --- power ---
    const alignmentGain = night ? 0 : clamp(efficiency / 100, 0, 1);
    const voltage = reading.voltage;
    const current = Number((reading.current * (0.45 + 0.55 * alignmentGain)).toFixed(2));
    const power = Number((voltage * current).toFixed(2));
    const dtSimHours = (dt * s.speed) / 60;
    const energyToday = Number(
      (simMinutes < s.simMinutes ? 0 : s.power.energyToday + (power * dtSimHours) / 1000).toFixed(
        3,
      ),
    );
    const energyTotal = Number((s.power.energyTotal + (power * dtSimHours) / 1000).toFixed(3));

    // --- history ---
    let history = s.history;
    if (now - this.lastSample > 900) {
      this.lastSample = now;
      history = [
        ...s.history,
        {
          t: simMinutes,
          clock: formatClock(simMinutes),
          left: sensors.left,
          right: sensors.right,
          top: sensors.top,
          bottom: sensors.bottom,
          power,
          irradiance: Number((irradiance * 1000).toFixed(0)),
          efficiency,
        },
      ].slice(-90);
    }

    // --- health ---
    const health = { ...s.health };
    health["LDR Sensors"] = this.faultySensor
      ? "error"
      : irradiance < 0.12 && !night
        ? "warn"
        : "ok";
    health["Azimuth Motor"] = motors.azimuth === "ERROR" ? "error" : "ok";
    health["Solar Panel"] = night ? "warn" : "ok";
    health["Power Sensor"] = voltage < 1 && !night ? "warn" : "ok";

    this.set({
      simMinutes,
      sun,
      night,
      irradiance,
      sensors,
      target,
      panel,
      motors,
      aligned,
      azError: Number(azError.toFixed(1)),
      elError: Number(elError.toFixed(1)),
      efficiency,
      power: { voltage, current, power, energyToday, energyTotal },
      history,
      health,
      lastUpdate: Date.now(),
      demoStep: s.demoActive ? this.demoStepFor(simMinutes, aligned, night) : s.demoStep,
    });

    // --- event driven alerts ---
    if (aligned && !this.wasAligned)
      this.pushAlert("success", "Solar panel successfully aligned with the Sun.");
    if (!aligned && this.wasAligned && !night)
      this.pushAlert("info", "Sun moved — adjusting panel position.");
    this.wasAligned = aligned;
    if (night && !s.night)
      this.pushAlert("info", "Night mode activated. Moving to parking position.");
    if (!night && s.night) this.pushAlert("info", "Sunrise detected. Solar tracking resumed.");
    if (!night && irradiance < 0.1 && s.irradiance >= 0.1)
      this.pushAlert("warning", "Low sunlight detected.");
    if (panel.azimuth > st.maxAzimuth - 5 && s.panel.azimuth <= st.maxAzimuth - 5)
      this.pushAlert("warning", "Panel approaching azimuth limit.");

    if (now - this.lastPersist > 3000) {
      this.lastPersist = now;
      this.persist();
    }
  }

  private demoStepFor(minutes: number, aligned: boolean, night: boolean) {
    const { sunriseMinutes, sunsetMinutes } = this.state;
    if (minutes < sunriseMinutes) return 0;
    if (minutes > sunsetMinutes + 25) return 10;
    if (minutes > sunsetMinutes) return 9;
    if (night) return 9;
    const p = (minutes - sunriseMinutes) / (sunsetMinutes - sunriseMinutes);
    if (p < 0.03) return 1;
    if (p < 0.06) return 2;
    if (p < 0.1) return 3;
    if (!aligned && p < 0.2) return 4;
    if (p < 0.3) return 5;
    if (p < 0.45) return 6;
    if (p < 0.97) return 7;
    return 8;
  }

  // ---------- commands ----------
  pushAlert(level: AlertLevel, message: string) {
    const alerts = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        level,
        message,
        at: Date.now(),
      },
      ...this.state.alerts,
    ].slice(0, 40);
    this.set({ alerts });
  }

  dismissAlert(id: string) {
    this.set({ alerts: this.state.alerts.filter((a) => a.id !== id) });
  }

  clearAlerts() {
    this.set({ alerts: [] });
  }

  setMode(mode: TrackingMode) {
    this.set({ mode });
    this.pushAlert(
      "info",
      mode === "auto" ? "Automatic solar tracking started." : "Manual control enabled.",
    );
  }

  toggleMode() {
    this.setMode(this.state.mode === "auto" ? "manual" : "auto");
  }

  emergencyStop() {
    this.set({
      emergencyStop: true,
      simulating: false,
      motors: { azimuth: "STOPPED", elevation: "STOPPED" },
    });
    this.pushAlert("error", "EMERGENCY STOP engaged. All motors halted.");
  }

  resume() {
    this.set({
      emergencyStop: false,
      simulating: true,
      motors: { azimuth: "IDLE", elevation: "IDLE" },
    });
    this.pushAlert("success", "System resumed. Motors re-enabled.");
  }

  setSpeed(speed: number) {
    this.set({ speed });
  }

  setSimulating(simulating: boolean) {
    if (this.state.emergencyStop) return;
    this.set({ simulating });
  }

  resetDay() {
    this.set({
      simMinutes: this.state.sunriseMinutes - 20,
      power: { ...this.state.power, energyToday: 0 },
      history: [],
    });
    this.pushAlert("info", "Day simulation reset to pre-sunrise.");
  }

  /** Manual: absolute set (sliders) */
  setPanel(next: Partial<Angles>) {
    if (this.state.emergencyStop) return;
    const st = this.state.settings;
    const target = {
      azimuth: clamp(next.azimuth ?? this.state.target.azimuth, st.minAzimuth, st.maxAzimuth),
      elevation: clamp(
        next.elevation ?? this.state.target.elevation,
        st.minElevation,
        st.maxElevation,
      ),
    };
    this.set({ mode: "manual", target });
  }

  /** Manual: relative nudge (jog buttons) */
  nudge(axis: "azimuth" | "elevation", delta: number) {
    const current = this.state.target[axis];
    this.setPanel({ [axis]: current + delta } as Partial<Angles>);
  }

  stopAxis(axis: "azimuth" | "elevation") {
    if (this.state.emergencyStop) return;
    this.set({ mode: "manual", target: { ...this.state.target, [axis]: this.state.panel[axis] } });
  }

  centerPanel() {
    this.setPanel({ azimuth: 180, elevation: 45 });
    this.pushAlert("info", "Panel centered (180° / 45°).");
  }

  resetPosition() {
    this.setPanel({
      azimuth: this.state.settings.nightAzimuth,
      elevation: this.state.settings.nightElevation,
    });
    this.pushAlert("info", "Panel moved to home / parking position.");
  }

  updateSettings(patch: Partial<Settings>) {
    this.set({ settings: { ...this.state.settings, ...patch } });
    this.persist();
  }

  injectSensorFault() {
    if (this.faultySensor) {
      this.faultySensor = null;
      this.pushAlert("success", "Left LDR sensor recovered.");
    } else {
      this.faultySensor = "left";
      this.pushAlert("error", "Left LDR sensor is not responding.");
      this.pushAlert("error", "Motor movement timeout on azimuth axis.");
    }
  }

  startDemo() {
    this.set({
      demoActive: true,
      demoStep: 0,
      mode: "auto",
      emergencyStop: false,
      simulating: true,
      speed: 50,
      simMinutes: this.state.sunriseMinutes - 15,
      power: { ...this.state.power, energyToday: 0 },
      history: [],
    });
    this.pushAlert("info", "Demonstration mode started — full day cycle.");
  }

  stopDemo() {
    this.set({ demoActive: false, speed: 5 });
    this.pushAlert("info", "Demonstration mode stopped.");
  }

  factoryReset() {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    this.faultySensor = null;
    this.state = createInitialState();
    this.listeners.forEach((l) => l());
    this.pushAlert("warning", "System reset to factory defaults.");
  }
}

export const engine = new SolarEngine();
