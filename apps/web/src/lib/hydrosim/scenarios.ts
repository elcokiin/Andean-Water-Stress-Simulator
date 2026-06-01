import type { ScenarioId, Scenario } from "./types";

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
