export type ScenarioId = "baseline" | "moderate" | "extreme";

export type ConfigTab =
  | "scenarios"
  | "parameters"
  | "shortcuts"
  | "climate"
  | "demand"
  | "infrastructure";

export type ShortcutAction =
  | "toggle-play"
  | "step-forward"
  | "step-back"
  | "restart"
  | "open-config"
  | "close-config"
  | "open-shortcuts-tab"
  | "tab-scenarios"
  | "tab-parameters"
  | "tab-shortcuts"
  | "toggle-expand"
  | "save-config";

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
