import { useEffect, useRef } from "react";

import { useSimulationStore } from "@/lib/stores/simulation-store";
import {
  createInitialState,
  getCityProfile,
  snapshotToEntry,
  step,
  toSimState,
} from "@/src/lib/hydrosim/engine";
import { scenarioIds, scenarios } from "@/src/lib/hydrosim/scenarios";
import type { ReservoirId, ScenarioId } from "@/src/lib/hydrosim/types";
import { SCENARIO_ONI } from "@/lib/stores/simulation-store";
import type { SimState } from "@/src/lib/hydrosim/engine";

const TICK_MS = 700;

function buildInitialForScenario(
  scenario: ScenarioId,
  reservoir: ReservoirId,
): SimState {
  const startReserve = scenarios[scenario].reserve;
  const city = getCityProfile(reservoir);
  return {
    ...createInitialState(city, scenario),
    reservoirPct: startReserve,
  };
}

function buildSimStateFromHistory(
  scenario: ScenarioId,
  reservoir: ReservoirId,
  lastEntry: ReturnType<
    ReturnType<typeof useSimulationStore.getState>["history"][ScenarioId]["at"]
  >,
): SimState {
  if (lastEntry) return toSimState(lastEntry);
  return buildInitialForScenario(scenario, reservoir);
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
  const lastAppliedReservoir = useRef<ReservoirId | null>(null);

  useEffect(() => {
    if (lastAppliedReservoir.current === null) {
      lastAppliedReservoir.current = reservoir;
      lastAppliedScenario.current = scenario;
      return;
    }
    if (lastAppliedReservoir.current !== reservoir) {
      lastAppliedReservoir.current = reservoir;
      lastAppliedScenario.current = scenario;
      useSimulationStore.getState().clearAllHistory();
      setSimState(buildInitialForScenario(scenario, reservoir));
      return;
    }
    if (lastAppliedScenario.current !== scenario) {
      lastAppliedScenario.current = scenario;
      const lastEntry = useSimulationStore.getState().history[scenario].at(-1);
      setSimState(buildSimStateFromHistory(scenario, reservoir, lastEntry));
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

      const sharedParams = {
        rainMm: current.rainValue,
        demandLpcd: current.demandValue,
        efficiencyPct: current.efficiencyValue,
        rationingActive: current.rationingActive,
      };

      let activeNext: SimState | null = null;
      const nextHistoryEntries: Record<
        ScenarioId,
        ReturnType<typeof snapshotToEntry> | null
      > = {
        baseline: null,
        moderate: null,
        extreme: null,
      };

      for (const s of scenarioIds) {
        const prev =
          current.history[s].at(-1) ?? buildInitialForScenario(s, reservoir);
        const oni = s === current.scenario ? current.oniValue : SCENARIO_ONI[s];
        const next = step(prev, { oni, ...sharedParams }, city);
        nextHistoryEntries[s] = snapshotToEntry(next);
        if (s === current.scenario) activeNext = next;
      }

      useSimulationStore.setState((state) => {
        const newHistory = { ...state.history };
        for (const s of scenarioIds) {
          const entry = nextHistoryEntries[s];
          if (!entry) continue;
          newHistory[s] = [...newHistory[s], entry].slice(-600);
        }
        return {
          simState: activeNext ?? state.simState,
          history: newHistory,
        };
      });
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
