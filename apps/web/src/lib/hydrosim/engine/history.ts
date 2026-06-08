import { snapshot } from "./model";
import type { SimSnapshot, SimState } from "./types";
import type { ScenarioId } from "@/src/lib/hydrosim/types";

export type HistoryEntry = SimSnapshot;
export type HistoryBuffer = SimSnapshot[];
export type HistoryMap = Record<ScenarioId, HistoryBuffer>;

export const HISTORY_CAPACITY = 600;

export function createEmptyHistory(): HistoryMap {
  return { baseline: [], moderate: [], extreme: [] };
}

export function pushHistory(
  buffer: HistoryBuffer,
  entry: HistoryEntry,
  capacity: number = HISTORY_CAPACITY,
): HistoryBuffer {
  if (buffer.length < capacity) {
    return [...buffer, entry];
  }
  return [...buffer.slice(buffer.length - capacity + 1), entry];
}

export function clearHistoryBuffer(): HistoryBuffer {
  return [];
}

export function toSimState(entry: HistoryEntry): SimState {
  const { date: _date, ...state } = entry;
  void _date;
  return state;
}

export function snapshotToEntry(state: SimState): HistoryEntry {
  return snapshot(state);
}
