import { useState } from "react";
import { BarChart3, Droplets, Minimize2, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortcutBadge, ShortcutFlag } from "@/components/ui/shortcut-flag";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { ReservoirChart } from "./ReservoirChart";
import { WaterBalanceChart } from "./WaterBalanceChart";
import { scenarios } from "@/src/lib/hydrosim/scenarios";

const CHARTS_HOTKEY = "G";
const compactFlagClassName =
  "h-3.5 min-w-3.5 rounded-[3px] px-0.5 text-[0.5rem]";
type ChartView = "reservoir" | "balance";

export function ChartsPanel() {
  const [chartView, setChartView] = useState<ChartView>("reservoir");
  const open = useSimulationStore((s) => s.chartsPanelOpen);
  const showShortcutHints = useSimulationStore((s) => s.showShortcutHints);
  const scenario = useSimulationStore((s) => s.scenario);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const history = useSimulationStore((s) => s.history);
  const toggleChartsPanel = useSimulationStore((s) => s.toggleChartsPanel);
  const activeHistory = history[scenario];

  if (!open) {
    return (
      <Card className="absolute top-3 right-3 z-10 rounded-[10px] border-border/80 bg-background/90 p-2 shadow-xl backdrop-blur-sm">
        <ShortcutFlag hidden={!showShortcutHints} hotkey={CHARTS_HOTKEY} />
        <CardContent className="flex items-center gap-1.5 p-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative size-10 rounded-[8px]"
                onClick={toggleChartsPanel}
                aria-label="Mostrar panel de graficas"
              >
                <ShortcutFlag
                  className={compactFlagClassName}
                  hidden={!showShortcutHints}
                  hotkey={CHARTS_HOTKEY}
                />
                <BarChart3 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Graficas de la simulacion{" "}
              <ShortcutBadge
                hidden={!showShortcutHints}
                hotkey={CHARTS_HOTKEY}
              />
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="absolute top-3 right-3 z-10 w-[390px] max-w-[calc(100vw-1.5rem)] gap-3 rounded-[10px] border-border/80 bg-background/90 p-3 shadow-xl backdrop-blur-sm"
      data-tour="charts-panel"
    >
      <CardHeader className="flex items-center justify-between gap-3 p-0">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="size-4" />
            Trayectorias
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {chartView === "reservoir"
              ? "Reserva simulada vs tiempo (meses)"
              : "Balance hidrico mensual en Mm3"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-[8px]"
                onClick={toggleChartsPanel}
                aria-label="Minimizar panel de graficas"
              >
                <ShortcutFlag
                  className={compactFlagClassName}
                  hidden={!showShortcutHints}
                  hotkey={CHARTS_HOTKEY}
                />
                <Minimize2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Minimizar{" "}
              <ShortcutBadge
                hidden={!showShortcutHints}
                hotkey={CHARTS_HOTKEY}
              />
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5 p-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Badge
              variant="outline"
              className="rounded-[6px] text-[0.65rem]"
              style={{
                borderColor: scenarios[scenario].color,
                color: scenarios[scenario].color,
              }}
            >
              {scenarios[scenario].name}
            </Badge>
            <span className="text-[0.65rem] text-muted-foreground">
              {activeHistory.length} muestras
            </span>
          </div>

          <ToggleGroup
            type="single"
            value={chartView}
            onValueChange={(value) => {
              if (!value) return;
              setChartView(value as ChartView);
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Seleccionar grafica"
            className="shrink-0"
          >
            <ToggleGroupItem
              value="reservoir"
              aria-label="Ver grafica de reserva"
              className="h-7 gap-1 px-2 text-[0.65rem]"
            >
              <Droplets className="size-3.5" />
              Reserva
            </ToggleGroupItem>
            <ToggleGroupItem
              value="balance"
              aria-label="Ver grafica de balance hidrico"
              className="h-7 gap-1 px-2 text-[0.65rem]"
            >
              <Scale className="size-3.5" />
              Balance
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {chartView === "reservoir" ? (
          <ReservoirChart
            entries={activeHistory}
            scenario={scenario}
            height={220}
          />
        ) : (
          <WaterBalanceChart
            entries={activeHistory}
            reservoir={reservoir}
            height={220}
          />
        )}

        <p className="text-[0.65rem] text-muted-foreground">
          {chartView === "reservoir"
            ? "La banda roja marca el PNR (15%). La banda verde marca la meta operativa (60%)."
            : "Entradas = caudal + recarga. Salidas = extraccion + evaporacion + filtracion."}
        </p>
      </CardContent>
    </Card>
  );
}
