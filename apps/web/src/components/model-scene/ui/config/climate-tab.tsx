import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import {
  buildDisplayMetrics,
  formatMcm,
  formatPct,
  getCityProfile,
} from "@/src/lib/hydrosim/engine";

export function ClimateTab() {
  const oniValue = useSimulationStore((s) => s.oniValue);
  const rainValue = useSimulationStore((s) => s.rainValue);
  const runoffCoefficient = useSimulationStore((s) => s.runoffCoefficient);
  const fireProbability = useSimulationStore((s) => s.fireProbability);
  const evaporationFactor = useSimulationStore((s) => s.evaporationFactor);
  const fogIntensity = useSimulationStore((s) => s.fogIntensity);
  const simState = useSimulationStore((s) => s.simState);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const setOniValue = useSimulationStore((s) => s.setOniValue);
  const setRainValue = useSimulationStore((s) => s.setRainValue);
  const setRunoffCoefficient = useSimulationStore(
    (s) => s.setRunoffCoefficient,
  );
  const setFireProbability = useSimulationStore((s) => s.setFireProbability);
  const setEvaporationFactor = useSimulationStore(
    (s) => s.setEvaporationFactor,
  );
  const setFogIntensity = useSimulationStore((s) => s.setFogIntensity);
  const metrics = buildDisplayMetrics(
    simState,
    null,
    getCityProfile(reservoir),
  );

  return (
    <div className="animate-in fade-in-50 space-y-8">
      <div>
        <h3 className="mb-1 text-lg font-semibold">
          Clima y Entorno Ambiental
        </h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Ajusta las variables de la naturaleza que afectan la entrada de agua
          al embalse.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="oni" className="flex items-center gap-2 text-base">
            Índice Oceánico del Niño (ONI)
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Valores positivos (+0.5 en adelante) indican presencia del
                  Fenómeno de El Niño (sequía en la región). Valores negativos
                  indican La Niña (lluvias).
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <span className="font-mono text-sm text-muted-foreground">
            {oniValue > 0 ? `+${oniValue}` : oniValue}
          </span>
        </div>
        <Slider
          value={[oniValue]}
          onValueChange={(val) => setOniValue(val[0])}
          max={3}
          min={-3}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Fuerte La Niña (-3)</span>
          <span>Neutral (0)</span>
          <span>Fuerte El Niño (+3)</span>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="rain" className="flex items-center gap-2 text-base">
            Precipitación Base
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Precipitación mensual promedio que recarga el embalse mediante
                  escorrentía en la cuenca.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <span className="font-mono text-sm text-muted-foreground">
            {rainValue} mm/mes
          </span>
        </div>
        <Slider
          value={[rainValue]}
          onValueChange={(val) => setRainValue(val[0])}
          max={300}
          min={0}
          step={5}
          className="w-full"
        />
      </div>

      <div className="grid gap-5 pt-4 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base">
              Coeficiente de escorrentía
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Fracción de la lluvia efectiva que entra al embalse como
                    caudal superficial.
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <span className="font-mono text-sm text-muted-foreground">
              {formatPct(runoffCoefficient * 100, 0)}
            </span>
          </div>
          <Slider
            value={[runoffCoefficient]}
            onValueChange={(val) => setRunoffCoefficient(val[0])}
            max={1}
            min={0.05}
            step={0.01}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base">
              Factor de evaporación
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Multiplicador aplicado a la evaporación mensual calculada
                    por ONI y área de cuenca.
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <span className="font-mono text-sm text-muted-foreground">
              x{evaporationFactor.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[evaporationFactor]}
            onValueChange={(val) => setEvaporationFactor(val[0])}
            max={2.5}
            min={0.25}
            step={0.05}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-base">
            Probabilidad mensual de incendio
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Probabilidad usada cada mes de simulación. Si el sorteo
                  ocurre, el impacto se calcula con un generador congruencial
                  multiplicativo y afecta páramo y embalse.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <span className="font-mono text-sm text-muted-foreground">
            {formatPct(fireProbability * 100, 0)}
          </span>
        </div>
        <Slider
          value={[fireProbability]}
          onValueChange={(val) => setFireProbability(val[0])}
          max={1}
          min={0}
          step={0.01}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Sin incendios</span>
          <span>Riesgo medio</span>
          <span>Seguro mensual</span>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Entrada calculada</p>
          <p className="font-mono text-sm">
            {formatMcm(metrics.inflowMcmPerMonth)} Mm³/mes
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Evaporación</p>
          <p className="font-mono text-sm">
            {formatMcm(metrics.evaporationMcmPerMonth)} Mm³/mes
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Impacto del incendio</p>
          <p className="font-mono text-sm">
            {metrics.fireImpactPct > 0
              ? formatPct(metrics.fireImpactPct, 0)
              : "Sin evento"}
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="fog" className="flex items-center gap-2 text-base">
            Niebla de horizonte
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Controla la densidad visual que oculta los límites del terreno
                  y del canvas en los bordes de la vista.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <span className="font-mono text-sm text-muted-foreground">
            {Math.round(fogIntensity * 100)}%
          </span>
        </div>
        <Slider
          id="fog"
          value={[fogIntensity]}
          onValueChange={(val) => setFogIntensity(val[0])}
          max={1.5}
          min={0}
          step={0.05}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Sin niebla</span>
          <span>Normal</span>
          <span>Densa</span>
        </div>
      </div>
    </div>
  );
}
