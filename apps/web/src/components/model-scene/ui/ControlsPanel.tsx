import { Minimize2, Pause, Play, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortcutBadge, ShortcutFlag } from "@/components/ui/shortcut-flag";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { scenarioIds, scenarios, timeline } from "@/src/lib/hydrosim/scenarios";

import { Metric } from "./Metric";

const CONTROLS_PANEL_HOTKEY = "M";

export function ControlsPanel() {
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const isMinimized = useSimulationStore((s) => s.controlsPanelMinimized);
  const scenario = useSimulationStore((s) => s.scenario);
  const step = useSimulationStore((s) => s.step);
  const setScenario = useSimulationStore((s) => s.setScenario);
  const setConfigOpen = useSimulationStore((s) => s.setConfigOpen);
  const toggleControlsPanelMinimized = useSimulationStore(
    (s) => s.toggleControlsPanelMinimized,
  );
  const togglePlayback = useSimulationStore((s) => s.togglePlayback);

  const selectedScenario = scenarios[scenario];

  if (isMinimized) {
    return (
      <Card className="absolute right-3 bottom-3 z-10 rounded-[10px] border-border/80 bg-background/90 p-2 shadow-xl backdrop-blur-sm sm:right-auto sm:left-4">
        <ShortcutFlag hotkey={CONTROLS_PANEL_HOTKEY} />
        <CardContent className="flex items-center gap-1.5 p-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="icon"
                className="size-10 rounded-[8px]"
                onClick={togglePlayback}
                aria-label={
                  isPlaying ? "Pausar simulacion" : "Iniciar simulacion"
                }
              >
                {isPlaying ? <Pause /> : <Play />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPlaying ? "Pausar simulacion" : "Iniciar simulacion"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-[8px]"
                onClick={() => setConfigOpen(true)}
                aria-label="Configurar modelo"
              >
                <Settings />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configurar modelo</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute right-3 bottom-3 left-3 z-10 gap-3 rounded-[10px] border-border/80 bg-background/90 p-3 shadow-xl backdrop-blur-sm sm:right-auto sm:left-4 sm:w-[340px]">
      <CardHeader className="flex items-center justify-between gap-3 p-0">
        <div>
          <CardTitle className="text-sm">Panel de control</CardTitle>
          <p className="text-xs text-muted-foreground">
            {timeline[step]} - paso {step + 1}/{timeline.length}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-[8px]"
                onClick={toggleControlsPanelMinimized}
                aria-label="Minimizar panel de control"
              >
                <Minimize2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Minimizar panel <ShortcutBadge hotkey={CONTROLS_PANEL_HOTKEY} />
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-[8px]"
                onClick={() => setConfigOpen(true)}
                aria-label="Configurar modelo"
              >
                <Settings />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configurar modelo</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0">
        <div className="grid grid-cols-3 gap-1.5">
          {scenarioIds.map((scenarioId) => (
            <Button
              key={scenarioId}
              variant={scenario === scenarioId ? "default" : "outline"}
              size="sm"
              className="h-11 flex-col items-start gap-0.5 rounded-[8px] px-2 text-left"
              onClick={() => setScenario(scenarioId)}
            >
              <span className="w-full truncate text-xs">
                {scenarios[scenarioId].badge}
              </span>
              <span className="w-full truncate text-[0.68rem] font-normal opacity-80">
                {scenarios[scenarioId].oni} ONI
              </span>
            </Button>
          ))}
        </div>

        <div className="rounded-[8px] border border-border bg-card/80 p-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">
                {selectedScenario.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Reserva {selectedScenario.reserve}% - ONI {selectedScenario.oni}
              </p>
            </div>
            <Badge
              variant={
                selectedScenario.reserve <= 15 ? "destructive" : "outline"
              }
              className="shrink-0 rounded-[6px]"
            >
              {selectedScenario.reserve <= 15 ? "PNR" : selectedScenario.badge}
            </Badge>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-[4px] bg-muted">
            <div
              className="h-full rounded-[4px] bg-primary transition-all"
              style={{ width: `${selectedScenario.reserve}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <Metric label="Entrada" value={selectedScenario.inflow} />
            <Metric label="Demanda" value={selectedScenario.demand} />
          </div>
          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="icon"
            className="size-10 rounded-[8px]"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pausar simulacion" : "Iniciar simulacion"}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
