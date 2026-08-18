export type TrackingMode = "auto" | "manual";

export type AzMotorState = "IDLE" | "ROTATING LEFT" | "ROTATING RIGHT" | "STOPPED" | "ERROR";
export type ElMotorState = "IDLE" | "MOVING UP" | "MOVING DOWN" | "STOPPED" | "ERROR";

export type HealthLevel = "ok" | "warn" | "error";

export type AlertLevel = "info" | "success" | "warning" | "error";

export interface SystemAlert {
  id: string;
  level: AlertLevel;
  message: string;
  at: number;
}

export interface Angles {
  azimuth: number;
  elevation: number;
}

export interface SensorReadings {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface PowerReadings {
  voltage: number;
  current: number;
  power: number;
  energyToday: number;
  energyTotal: number;
}

export interface Settings {
  autoTracking: boolean;
  deadband: number;
  trackingInterval: number;
  maxAzimuth: number;
  minAzimuth: number;
  maxElevation: number;
  minElevation: number;
  nightModeEnabled: boolean;
  nightAzimuth: number;
  nightElevation: number;
  systemName: string;
  location: string;
  units: "metric" | "imperial";
  simulationMode: boolean;
  esp32Ip: string;
  sensorConfig: string;
  motorConfig: string;
}

export interface HistorySample {
  t: number;
  clock: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  power: number;
  irradiance: number;
  efficiency: number;
}

export interface SolarState {
  online: boolean;
  simMinutes: number;
  speed: number;
  simulating: boolean;
  mode: TrackingMode;
  emergencyStop: boolean;
  night: boolean;
  sun: Angles;
  panel: Angles;
  target: Angles;
  sensors: SensorReadings;
  motors: { azimuth: AzMotorState; elevation: ElMotorState };
  power: PowerReadings;
  aligned: boolean;
  azError: number;
  elError: number;
  efficiency: number;
  irradiance: number;
  sunriseMinutes: number;
  sunsetMinutes: number;
  lastUpdate: number;
  alerts: SystemAlert[];
  health: Record<string, HealthLevel>;
  settings: Settings;
  history: HistorySample[];
  demoActive: boolean;
  demoStep: number;
}

export const DEFAULT_SETTINGS: Settings = {
  autoTracking: true,
  deadband: 25,
  trackingInterval: 500,
  maxAzimuth: 340,
  minAzimuth: 20,
  maxElevation: 90,
  minElevation: 5,
  nightModeEnabled: true,
  nightAzimuth: 180,
  nightElevation: 10,
  systemName: "SunTrack Pro",
  location: "Ahmedabad, IN",
  units: "metric",
  simulationMode: true,
  esp32Ip: "192.168.1.42",
  sensorConfig: "4x LDR (GPIO 32,33,34,35)",
  motorConfig: "2x SG90 servo (GPIO 18,19)",
};

export const HEALTH_KEYS = [
  "ESP32 Connection",
  "LDR Sensors",
  "Azimuth Motor",
  "Elevation Motor",
  "Solar Panel",
  "Power Sensor",
  "Internet Connection",
] as const;

export function formatClock(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = Math.floor(m % 60);
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}