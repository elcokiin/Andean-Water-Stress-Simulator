import { useEffect, useRef } from "react";

import { useSimulationStore } from "@/lib/stores/simulation-store";
import {
  createInitialState,
  getCityProfile,
  step,
} from "@/src/lib/hydrosim/engine";
import { scenarioIds, scenarios } from "@/src/lib/hydrosim/scenarios";
import type { ScenarioId } from "@/src/lib/hydrosim/types";

const TICK_MS = 700;

function buildInitialForScenario(
  scenario: ScenarioId,
  reservoir: "tunja" | "duitama" | "sogamoso",
) {
  const startReserve = scenarios[scenario].reserve;
  const city = getCityProfile(reservoir);
  return {
    ...createInitialState(city, scenario),
    reservoirPct: startReserve,
  };
}

export function useSimulationEngine() {
  const scenario = useSimulationStore((s) => s.scenario);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const oniValue = useSimulationStore((s) => s.oniValue);
  const rainValue = useSimulationStore((s) => s.rainValue);
  const demandValue = useSimulationStore((s) => s.demandValue);
  const efficiencyValue = useSimulationStore((s) => s.efficiencyValue);
  const rationingActive = useSimulationStore((s) => s.rationingActive);
  const setSimState = useSimulationStore((s) => s.setSimState);
  const simState = useSimulationStore((s) => s.simState);
  const lastAppliedScenario = useRef<ScenarioId | null>(null);
  const lastAppliedReservoir = useRef<typeof reservoir | null>(null);
  const lastSimStateRef = useRef(simState);

  useEffect(() => {
    lastSimStateRef.current = simState;
  }, [simState]);

  useEffect(() => {
    if (
      lastAppliedScenario.current !== scenario ||
      lastAppliedReservoir.current !== reservoir
    ) {
      lastAppliedScenario.current = scenario;
      lastAppliedReservoir.current = reservoir;
      setSimState(buildInitialForScenario(scenario, reservoir));
    }
  }, [scenario, reservoir, setSimState]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const city = getCityProfile(reservoir);
    const id = window.setInterval(() => {
      const current = useSimulationStore.getState();
      if (current.simState.collapse) {
        useSimulationStore.setState({ isPlaying: false });
        return;
      }
      const next = step(
        current.simState,
        {
          oni: current.oniValue,
          rainMm: current.rainValue,
          demandLpcd: current.demandValue,
          efficiencyPct: current.efficiencyValue,
          rationingActive: current.rationingActive,
        },
        city,
      );
      setSimState(next);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [
    isPlaying,
    reservoir,
    oniValue,
    rainValue,
    demandValue,
    efficiencyValue,
    rationingActive,
    setSimState,
  ]);

  return {
    isPlaying,
    scenario,
    reservoir,
    simState,
    scenarios,
    scenarioIds,
  };
}
