import { useSyncExternalStore } from "react";
import { engine } from "./engine";
import type { SolarState } from "./types";

const server = engine.getSnapshot();

export function useSolar(): SolarState {
  return useSyncExternalStore(engine.subscribe, engine.getSnapshot, () => server);
}

export { engine };