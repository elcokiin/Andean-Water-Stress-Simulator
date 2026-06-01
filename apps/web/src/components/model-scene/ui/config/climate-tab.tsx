import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSimulationStore } from "@/lib/stores/simulation-store";

export function ClimateTab() {
  const oniValue = useSimulationStore((s) => s.oniValue);
  const rainValue = useSimulationStore((s) => s.rainValue);
  const setOniValue = useSimulationStore((s) => s.setOniValue);
  const setRainValue = useSimulationStore((s) => s.setRainValue);

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
    </div>
  );
}
