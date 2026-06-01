import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSimulationStore } from "@/lib/stores/simulation-store";

export function DemandTab() {
  const demandValue = useSimulationStore((s) => s.demandValue);
  const rationingActive = useSimulationStore((s) => s.rationingActive);
  const setDemandValue = useSimulationStore((s) => s.setDemandValue);
  const setRationingActive = useSimulationStore((s) => s.setRationingActive);

  return (
    <div className="animate-in fade-in-50 space-y-8">
      <div>
        <h3 className="mb-1 text-lg font-semibold">Demanda y Consumo</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Ajusta las métricas de consumo de la población y las políticas de
          racionamiento.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-base">
            Consumo per cápita (L/día)
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Consumo diario estimado por habitante en la región,
                  considerando usos residenciales y comerciales básicos.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <span className="font-mono text-sm text-muted-foreground">
            {demandValue} L
          </span>
        </div>
        <Slider
          value={[demandValue]}
          onValueChange={(val) => setDemandValue(val[0])}
          max={250}
          min={50}
          step={1}
          className="w-full"
        />
      </div>

      <div className="mt-6 flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base font-semibold">
            Política de Racionamiento Activa
          </Label>
          <p className="text-sm text-muted-foreground">
            Fuerza la reducción de la demanda en un 30% si la reserva baja del
            20%.
          </p>
        </div>
        <Switch
          checked={rationingActive}
          onCheckedChange={setRationingActive}
        />
      </div>
    </div>
  );
}
