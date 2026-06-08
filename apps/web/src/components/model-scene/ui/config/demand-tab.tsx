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
import {
  buildDisplayMetrics,
  formatMcm,
  getCityProfile,
} from "@/src/lib/hydrosim/engine";

export function DemandTab() {
  const demandValue = useSimulationStore((s) => s.demandValue);
  const industrialDemandValue = useSimulationStore(
    (s) => s.industrialDemandValue,
  );
  const agriculturalDemandValue = useSimulationStore(
    (s) => s.agriculturalDemandValue,
  );
  const birthRateAnnual = useSimulationStore((s) => s.birthRateAnnual);
  const migrationRateAnnual = useSimulationStore((s) => s.migrationRateAnnual);
  const rationingActive = useSimulationStore((s) => s.rationingActive);
  const simState = useSimulationStore((s) => s.simState);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const setDemandValue = useSimulationStore((s) => s.setDemandValue);
  const setIndustrialDemandValue = useSimulationStore(
    (s) => s.setIndustrialDemandValue,
  );
  const setAgriculturalDemandValue = useSimulationStore(
    (s) => s.setAgriculturalDemandValue,
  );
  const setBirthRateAnnual = useSimulationStore((s) => s.setBirthRateAnnual);
  const setMigrationRateAnnual = useSimulationStore(
    (s) => s.setMigrationRateAnnual,
  );
  const setRationingActive = useSimulationStore((s) => s.setRationingActive);
  const metrics = buildDisplayMetrics(
    simState,
    null,
    getCityProfile(reservoir),
  );

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

      <div className="grid gap-5 pt-4 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base">
              Demanda industrial
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Volumen mensual requerido por procesos industriales y
                    comerciales intensivos.
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <span className="font-mono text-sm text-muted-foreground">
              {industrialDemandValue.toFixed(2)} Mm³/mes
            </span>
          </div>
          <Slider
            value={[industrialDemandValue]}
            onValueChange={(val) => setIndustrialDemandValue(val[0])}
            max={2}
            min={0}
            step={0.02}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base">
              Demanda agrícola
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Volumen mensual destinado a riego, fincas periurbanas y usos
                    agropecuarios simplificados.
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <span className="font-mono text-sm text-muted-foreground">
              {agriculturalDemandValue.toFixed(2)} Mm³/mes
            </span>
          </div>
          <Slider
            value={[agriculturalDemandValue]}
            onValueChange={(val) => setAgriculturalDemandValue(val[0])}
            max={2}
            min={0}
            step={0.02}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-5 pt-4 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base">
              Tasa de natalidad
            </Label>
            <span className="font-mono text-sm text-muted-foreground">
              {(birthRateAnnual * 100).toFixed(2)}% anual
            </span>
          </div>
          <Slider
            value={[birthRateAnnual]}
            onValueChange={(val) => setBirthRateAnnual(val[0])}
            max={0.04}
            min={0}
            step={0.001}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base">
              Tasa de migración
            </Label>
            <span className="font-mono text-sm text-muted-foreground">
              {(migrationRateAnnual * 100).toFixed(2)}% anual
            </span>
          </div>
          <Slider
            value={[migrationRateAnnual]}
            onValueChange={(val) => setMigrationRateAnnual(val[0])}
            max={0.03}
            min={-0.02}
            step={0.001}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Población simulada</p>
          <p className="font-mono text-sm">
            {Math.round(metrics.population).toLocaleString("es-CO")} hab
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Demanda doméstica</p>
          <p className="font-mono text-sm">
            {formatMcm(metrics.domesticDemandMcmPerMonth)} Mm³/mes
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Demanda total</p>
          <p className="font-mono text-sm">
            {formatMcm(metrics.totalDemandMcmPerMonth)} Mm³/mes
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Pérdida en red</p>
          <p className="font-mono text-sm">
            {formatMcm(metrics.networkLossMcmPerMonth)} Mm³/mes
          </p>
        </div>
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
