import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSimulationStore } from "@/lib/stores/simulation-store";

export function InfrastructureTab() {
  const efficiencyValue = useSimulationStore((s) => s.efficiencyValue);
  const setEfficiencyValue = useSimulationStore((s) => s.setEfficiencyValue);

  return (
    <div className="animate-in fade-in-50 space-y-8">
      <div>
        <h3 className="mb-1 text-lg font-semibold">Infraestructura</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Parámetros físicos del sistema de acueducto.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-base">
            Eficiencia de la red (fugas)
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Porcentaje de agua que llega efectivamente a los hogares. El
                  resto se pierde en fugas de la red de acueducto.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <span className="font-mono text-sm text-muted-foreground">
            {efficiencyValue}%
          </span>
        </div>
        <Slider
          value={[efficiencyValue]}
          onValueChange={(val) => setEfficiencyValue(val[0])}
          max={100}
          min={30}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          El restante 38% se asume como pérdida técnica (fugas en tuberías).
        </p>
      </div>
    </div>
  );
}
