import { Waves } from "lucide-react";

import { useSimulationStore } from "@/lib/stores/simulation-store";
import {
  buildDisplayMetrics,
  formatM3PerSecond,
  formatMcm,
  formatPct,
  getCityProfile,
  PNR_THRESHOLD_PCT,
} from "@/src/lib/hydrosim/engine";
import { scenarioIds, scenarios } from "@/src/lib/hydrosim/scenarios";
import { cn } from "@/lib/utils";

export function ScenariosTab() {
  const scenario = useSimulationStore((s) => s.scenario);
  const setScenario = useSimulationStore((s) => s.setScenario);
  const simState = useSimulationStore((s) => s.simState);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const city = getCityProfile(reservoir);
  const metrics = buildDisplayMetrics(simState, null, city);
  const selectedScenario = scenarios[scenario];
  const isPnr = metrics.reservoirPct <= PNR_THRESHOLD_PCT;

  return (
    <div className="animate-in fade-in-50 space-y-6">
      <div>
        <h3 className="mb-1 text-lg font-semibold">Escenarios Predefinidos</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Selecciona una configuración rápida para cargar los parámetros
          preestablecidos.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {scenarioIds.map((scenarioId) => (
            <button
              key={scenarioId}
              onClick={() => setScenario(scenarioId)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all hover:bg-accent/50",
                scenario === scenarioId
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-border",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: scenarios[scenarioId].color,
                  }}
                />
                <span className="font-medium">
                  {scenarios[scenarioId].name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Reserva inicial: {scenarios[scenarioId].reserve}% | ONI:{" "}
                {scenarios[scenarioId].oni}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Waves className="h-4 w-4 text-primary" />
          Lectura en vivo
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Reserva</p>
            <p
              className={cn(
                "text-lg font-semibold tabular-nums",
                isPnr && "text-destructive",
              )}
            >
              {metrics.reservoirPct.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Entrada</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatMcm(metrics.inflowMcmPerMonth)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                Mm³/mes
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatM3PerSecond(metrics.inflowM3PerSecond)} m³/s
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Extraccion</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatMcm(metrics.extractionMcmPerMonth)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                Mm³/mes
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatM3PerSecond(metrics.extractionM3PerSecond)} m³/s
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Balance neto</p>
            <p
              className={cn(
                "text-lg font-semibold tabular-nums",
                metrics.netBalanceMcmPerMonth < 0
                  ? "text-destructive"
                  : "text-primary",
              )}
            >
              {formatMcm(metrics.netBalanceMcmPerMonth)} Mm³/mes
            </p>
            <p className="text-xs text-muted-foreground">
              ONI {useSimulationStore.getState().oniValue > 0 ? "+" : ""}
              {useSimulationStore.getState().oniValue.toFixed(1)}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Páramo</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatPct(metrics.paramoCoverage * 100, 1)}
            </p>
            <p className="text-xs text-muted-foreground">cobertura</p>
          </div>
          <div>
            <p className="text-muted-foreground">Acuifero</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatPct(metrics.aquiferLevel * 100, 0)}
            </p>
            <p className="text-xs text-muted-foreground">nivel relativo</p>
          </div>
          <div>
            <p className="text-muted-foreground">Poblacion</p>
            <p className="text-lg font-semibold tabular-nums">
              {Math.round(metrics.population).toLocaleString("es-CO")}
            </p>
            <p className="text-xs text-muted-foreground">habitantes</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mes simulado</p>
            <p className="text-lg font-semibold tabular-nums">
              {metrics.month}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.collapse
                ? "Colapso del sistema"
                : isPnr
                  ? "Punto de no retorno"
                  : "Sistema estable"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Estado inicial del escenario: {selectedScenario.name} - reserva{" "}
          {selectedScenario.reserve}%, ONI {selectedScenario.oni}.
        </p>
      </div>
    </div>
  );
}
