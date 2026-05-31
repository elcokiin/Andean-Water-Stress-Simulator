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

export const scenarioIds = ["baseline", "moderate", "extreme"] as const;

export const scenarios: Record<ScenarioId, Scenario> = {
  baseline: {
    name: "Linea base",
    badge: "Calibracion",
    reserve: 68,
    inflow: "Promedio historico",
    demand: "Sin racionamiento",
    oni: "0.0",
    color: "#38bdf8",
    emissive: "#0f766e",
  },
  moderate: {
    name: "El Nino moderado",
    badge: "Estres",
    reserve: 38,
    inflow: "-35% entrada",
    demand: "Control parcial",
    oni: "+1.4",
    color: "#facc15",
    emissive: "#a16207",
  },
  extreme: {
    name: "El Nino extraordinario",
    badge: "Critico",
    reserve: 14,
    inflow: "-60% entrada",
    demand: "Racionamiento",
    oni: "+2.6",
    color: "#fb7185",
    emissive: "#be123c",
  },
};

export const timeline = [
  "2000 calibracion",
  "2024 presente",
  "2030 tension",
  "2035 umbral",
] as const;

export const shortcutGroups = [
  {
    label: "Simulacion",
    shortcuts: [
      ["Espacio", "Inicia o pausa la simulacion"],
      ["Flecha derecha", "Avanza un paso temporal"],
      ["Flecha izquierda", "Retrocede un paso temporal"],
      ["R", "Reinicia al escenario base"],
      ["C", "Abre o cierra la configuracion"],
      ["Esc", "Cierra la configuracion"],
    ],
  },
  {
    label: "Dialogo",
    shortcuts: [
      ["?", "Abre la referencia de atajos"],
      ["Ctrl + 1", "Abre Escenarios"],
      ["Ctrl + 2", "Abre Parametros"],
      ["Ctrl + 3", "Abre Atajos"],
      ["Ctrl + E", "Expande o restaura el dialogo"],
      ["Ctrl + Enter", "Guarda y cierra la base"],
    ],
  },
] as const;
