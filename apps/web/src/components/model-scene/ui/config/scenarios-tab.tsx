import { Waves } from "lucide-react";

import { useSimulationStore } from "@/lib/stores/simulation-store";
import { scenarioIds, scenarios } from "@/src/lib/hydrosim/scenarios";
import { cn } from "@/lib/utils";

export function ScenariosTab() {
  const scenario = useSimulationStore((s) => s.scenario);
  const setScenario = useSimulationStore((s) => s.setScenario);

  const selectedScenario = scenarios[scenario];

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
                Reserva: {scenarios[scenarioId].reserve}% | ONI:{" "}
                {scenarios[scenarioId].oni}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Waves className="h-4 w-4 text-primary" />
          Lectura actual
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Reserva</p>
            <p className="text-lg font-semibold">{selectedScenario.reserve}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Entrada</p>
            <p className="text-lg font-semibold">{selectedScenario.inflow}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Demanda</p>
            <p className="text-lg font-semibold">{selectedScenario.demand}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Índice ONI</p>
            <p className="text-lg font-semibold">{selectedScenario.oni}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
