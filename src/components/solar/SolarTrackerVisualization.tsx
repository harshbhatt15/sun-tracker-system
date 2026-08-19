import { formatClock } from "@/lib/solar/types";
import { useSolar } from "@/lib/solar/useSolar";
import { cn } from "@/lib/utils";

export function SolarTrackerVisualization({ className }: { className?: string }) {
  const s = useSolar();
  const sunP = (s.sun.azimuth - 78) / 204;
  const sunX = 8 + Math.min(1, Math.max(0, sunP)) * 84; // %
  const sunY = 88 - Math.max(0, s.sun.elevation / 90) * 76; // %
  const yaw = s.panel.azimuth - 180;
  const tilt = 90 - s.panel.elevation;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius-xl)] border border-border",
        className,
      )}
      style={{
        aspectRatio: "16 / 10",
        backgroundImage: s.night ? "var(--gradient-night)" : "var(--gradient-sky)",
        transition: "background-image 1s ease",
      }}
    >
      {/* stars at night */}
      {s.night && (
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-foreground/70"
              style={{
                left: `${(i * 37) % 97}%`,
                top: `${(i * 53) % 60}%`,
                opacity: 0.3 + ((i * 17) % 60) / 100,
              }}
            />
          ))}
        </div>
      )}

      {/* sun arc guide */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 8 88 Q 50 -8 92 88"
          fill="none"
          stroke="oklch(1 0 0 / 0.25)"
          strokeWidth="0.3"
          strokeDasharray="2 2"
        />
      </svg>

      {/* sun */}
      {!s.night && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-linear"
          style={{ left: `${sunX}%`, top: `${sunY}%` }}
        >
          <div className="relative grid place-items-center">
            <span className="absolute h-16 w-16 rounded-full bg-solar/40 animate-pulse-ring" />
            <span className="absolute h-20 w-20 rounded-full bg-solar/20 blur-xl" />
            <span
              className="sun-glow relative block h-10 w-10 rounded-full animate-spin-slow"
              style={{ backgroundImage: "var(--gradient-solar)" }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: "0 0 0 4px oklch(0.88 0.16 88 / 0.35)" }}
              />
            </span>
          </div>
        </div>
      )}

      {/* sun→panel light ray */}
      {!s.night && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1={sunX}
            y1={sunY}
            x2={50}
            y2={72}
            stroke={s.aligned ? "oklch(0.82 0.17 72 / 0.85)" : "oklch(0.82 0.17 72 / 0.3)"}
            strokeWidth={s.aligned ? 0.7 : 0.35}
            strokeDasharray="3 2"
          />
        </svg>
      )}

      {/* ground */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22%]"
        style={{
          backgroundImage: s.night
            ? "linear-gradient(180deg, oklch(0.22 0.03 259), oklch(0.16 0.02 259))"
            : "linear-gradient(180deg, oklch(0.42 0.06 160), oklch(0.28 0.04 160))",
        }}
      />

      {/* tracker hardware */}
      <div
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2"
        style={{ perspective: "900px" }}
      >
        <div
          className="flex flex-col items-center transition-transform duration-300 ease-out"
          style={{ transform: `rotateY(${yaw}deg)`, transformStyle: "preserve-3d" }}
        >
          {/* panel plate */}
          <div
            className="relative rounded-md border border-foreground/30 transition-transform duration-300 ease-out"
            style={{
              width: "clamp(120px, 26vw, 230px)",
              height: "clamp(72px, 16vw, 140px)",
              transformOrigin: "bottom center",
              transform: `rotateX(${tilt}deg)`,
              backgroundImage: "linear-gradient(150deg, oklch(0.5 0.13 258), oklch(0.3 0.1 262))",
              boxShadow: s.aligned ? "var(--shadow-glow)" : "var(--shadow-elevated)",
            }}
          >
            <div className="absolute inset-[6%] grid grid-cols-4 grid-rows-3 gap-[3px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-[2px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, oklch(0.62 0.14 250 / 0.95), oklch(0.34 0.11 262))",
                    opacity: s.night ? 0.5 : 0.7 + s.irradiance * 0.3,
                  }}
                />
              ))}
            </div>
          </div>

          {/* elevation joint / motor */}
          <div className="relative -mt-1 grid place-items-center">
            <span
              className={cn(
                "block h-4 w-4 rounded-full border border-foreground/40 bg-secondary",
                s.motors.elevation !== "IDLE" &&
                  s.motors.elevation !== "STOPPED" &&
                  "animate-spin-slow",
              )}
            />
          </div>

          {/* mast */}
          <div className="h-10 w-3 rounded-sm bg-gradient-to-b from-secondary to-muted sm:h-14" />

          {/* azimuth motor */}
          <div className="relative grid place-items-center">
            <span
              className={cn(
                "block h-5 w-8 rounded-sm border border-foreground/30 bg-secondary",
                s.motors.azimuth !== "IDLE" && s.motors.azimuth !== "STOPPED" && "animate-pulse",
              )}
            />
          </div>
          {/* base */}
          <div className="h-2 w-20 rounded-b-lg bg-muted shadow-[var(--shadow-elevated)]" />
        </div>
      </div>

      {/* overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3 text-xs">
        <div className="rounded-lg bg-background/70 px-3 py-2 font-mono backdrop-blur">
          <div className="text-muted-foreground">SUN</div>
          <div>
            AZ {s.sun.azimuth.toFixed(0)}° · EL {Math.max(0, s.sun.elevation).toFixed(0)}°
          </div>
          <div className="text-muted-foreground">
            {formatClock(s.sunriseMinutes)} → {formatClock(s.sunsetMinutes)}
          </div>
        </div>
        <div className="rounded-lg bg-background/70 px-3 py-2 text-right font-mono backdrop-blur">
          <div className="text-muted-foreground">PANEL</div>
          <div>
            AZ {s.panel.azimuth.toFixed(0)}° · EL {s.panel.elevation.toFixed(0)}°
          </div>
          <div className={s.aligned ? "text-success" : "text-warning"}>
            {s.night ? "NIGHT MODE" : s.aligned ? "SUN ALIGNED" : "ADJUSTING"}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-2 left-3 rounded-lg bg-background/70 px-3 py-1 font-mono text-xs backdrop-blur">
        {formatClock(s.simMinutes)} · {s.speed}× {s.simulating ? "" : "(paused)"}
      </div>
    </div>
  );
}
