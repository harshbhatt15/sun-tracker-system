/** Deterministic synthetic history so the Energy page charts work offline. */
export interface DayPoint {
  label: string;
  power: number;
  energy: number;
  sunlight: number;
}

function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function buildRange(days: 1 | 7 | 30, todayEnergy: number): DayPoint[] {
  if (days === 1) {
    return Array.from({ length: 13 }, (_, i) => {
      const hour = 6 + i;
      const p = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
      return {
        label: `${String(hour).padStart(2, "0")}:00`,
        power: Number((p * 52 * (0.9 + seeded(i) * 0.2)).toFixed(1)),
        energy: Number((todayEnergy * (i / 12)).toFixed(3)),
        sunlight: Number((p * 980).toFixed(0)),
      };
    });
  }
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const f = 0.72 + seeded(i + days) * 0.4;
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      power: Number((38 * f).toFixed(1)),
      energy: Number((0.72 * f).toFixed(2)),
      sunlight: Number((820 * f).toFixed(0)),
    };
  });
}
