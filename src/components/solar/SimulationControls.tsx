import { Pause, Play, Presentation, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_STEPS } from "@/lib/solar/engine";
import { engine, useSolar } from "@/lib/solar/useSolar";
import { Panel } from "./ui-bits";

export function SimulationControls() {
  const s = useSolar();
  return (
    <Panel title="Day Simulation" icon={<Play className="h-4 w-4" />}>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => engine.setSimulating(!s.simulating)} className="gap-1.5">
          {s.simulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {s.simulating ? "Pause Simulation" : "Simulate Sun"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => engine.resetDay()} className="gap-1.5">
          <RotateCcw className="h-4 w-4" /> Reset Day
        </Button>
        <Button
          size="sm"
          variant={s.demoActive ? "destructive" : "outline"}
          onClick={() => (s.demoActive ? engine.stopDemo() : engine.startDemo())}
          className="gap-1.5"
        >
          <Presentation className="h-4 w-4" /> {s.demoActive ? "Stop Demo" : "Project Demo Mode"}
        </Button>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Simulation speed</div>
        <div className="flex flex-wrap gap-2">
          {[1, 5, 10, 50].map((sp) => (
            <button
              key={sp}
              onClick={() => engine.setSpeed(sp)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                s.speed === sp
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {sp}×
            </button>
          ))}
        </div>
      </div>

      {s.demoActive && (
        <ol className="mt-4 space-y-1.5">
          {DEMO_STEPS.map((step, i) => (
            <li
              key={step}
              className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
                i === s.demoStep
                  ? "bg-primary/15 text-solar"
                  : i < s.demoStep
                    ? "text-success"
                    : "text-muted-foreground"
              }`}
            >
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-current text-[9px]">
                {i + 1}
              </span>
              <span className="min-w-0 truncate">{step}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}