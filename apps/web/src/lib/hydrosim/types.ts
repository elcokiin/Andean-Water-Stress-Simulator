export type ScenarioId = "baseline" | "moderate" | "extreme";

export type ConfigTab =
  | "scenarios"
  | "parameters"
  | "shortcuts"
  | "climate"
  | "demand"
  | "infrastructure";

export interface Scenario {
  name: string;
  badge: string;
  reserve: number;
  inflow: string;
  demand: string;
  oni: string;
  color: string;
  emissive: string;
}
