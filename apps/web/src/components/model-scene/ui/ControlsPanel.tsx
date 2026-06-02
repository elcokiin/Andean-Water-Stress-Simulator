import { Minimize2, Pause, Play, RotateCcw, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShortcutBadge, ShortcutFlag } from "@/components/ui/shortcut-flag";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SIMULATION_SPEED_MAX,
  SIMULATION_SPEED_MIN,
  SIMULATION_SPEED_STEP,
  useSimulationStore,
} from "@/lib/stores/simulation-store";
import {
  buildDisplayMetrics,
  formatM3PerSecond,
  formatMcm,
  formatPct,
  getCityProfile,
  PNR_THRESHOLD_PCT,
} from "@/src/lib/hydrosim/engine";
import { scenarioIds, scenarios, timeline } from "@/src/lib/hydrosim/scenarios";

import { Metric } from "./Metric";

const CONTROLS_PANEL_HOTKEY = "P";
const CONFIG_HOTKEY = "C";
const PLAYBACK_HOTKEY = "Space";
const RESET_HOTKEY = "R";
const compactFlagClassName =
  "h-3.5 min-w-3.5 rounded-[3px] px-0.5 text-[0.5rem]";

export function ControlsPanel() {
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const isMinimized = useSimulationStore((s) => s.controlsPanelMinimized);
  const showShortcutHints = useSimulationStore((s) => s.showShortcutHints);
  const scenario = useSimulationStore((s) => s.scenario);
  const simState = useSimulationStore((s) => s.simState);
  const reservoir = useSimulationStore((s) => s.reservoir);
  const simulationSpeed = useSimulationStore((s) => s.simulationSpeed);
  const setScenario = useSimulationStore((s) => s.setScenario);
  const setConfigOpen = useSimulationStore((s) => s.setConfigOpen);
  const setSimulationSpeed = useSimulationStore((s) => s.setSimulationSpeed);
  const toggleControlsPanelMinimized = useSimulationStore(
    (s) => s.toggleControlsPanelMinimized,
  );
  const togglePlayback = useSimulationStore((s) => s.togglePlayback);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  const city = getCityProfile(reservoir);
  const metrics = buildDisplayMetrics(simState, null, city);
  const selectedScenario = scenarios[scenario];
  const isPnr = metrics.reservoirPct <= PNR_THRESHOLD_PCT;
  const isCollapse = metrics.collapse;
  const isCalibrationStep = simState.month === 0 && scenario === "baseline";
  const timelineLabel = isCalibrationStep
    ? timeline[1]
    : timeline[
        Math.min(Math.floor(simState.month / 12) + 1, timeline.length - 1)
      ];
  const simulationSpeedLabel = Number.isInteger(simulationSpeed)
    ? simulationSpeed.toFixed(0)
    : simulationSpeed.toFixed(2).replace(/0$/, "");

  if (isMinimized) {
    return (
      <Card className="absolute right-3 bottom-3 z-10 rounded-[10px] border-border/80 bg-background/90 p-2 shadow-xl backdrop-blur-sm sm:right-auto sm:left-4">
        <ShortcutFlag
          hidden={!showShortcutHints}
          hotkey={CONTROLS_PANEL_HOTKEY}
        />
        <CardContent className="flex items-center gap-1.5 p-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="icon"
                className="relative size-10 rounded-[8px]"
                onClick={togglePlayback}
                aria-label={
                  isPlaying ? "Pausar simulacion" : "Iniciar simulacion"
                }
              >
                <ShortcutFlag
                  className={compactFlagClassName}
                  hidden={!showShortcutHints}
                  hotkey={PLAYBACK_HOTKEY}
                />
                {isPlaying ? <Pause /> : <Play />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPlaying ? "Pausar simulacion" : "Iniciar simulacion"}{" "}
              <ShortcutBadge
                hidden={!showShortcutHints}
                hotkey={PLAYBACK_HOTKEY}
              />
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative size-10 rounded-[8px]"
                onClick={() => setConfigOpen(true)}
                aria-label="Configurar modelo"
                data-tour="config-button"
              >
                <ShortcutFlag
                  className={compactFlagClassName}
                  hidden={!showShortcutHints}
                  hotkey={CONFIG_HOTKEY}
                />
                <Settings />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Configurar modelo{" "}
              <ShortcutBadge
                hidden={!showShortcutHints}
                hotkey={CONFIG_HOTKEY}
              />
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="absolute right-3 bottom-3 left-3 z-10 gap-3 rounded-[10px] border-border/80 bg-background/90 p-3 shadow-xl backdrop-blur-sm sm:right-auto sm:left-4 sm:w-[360px]"
      data-tour="controls-panel"
    >
      <CardHeader className="flex items-center justify-between gap-3 p-0">
        <div className="min-w-0">
          <CardTitle className="text-sm">Panel de control</CardTitle>
          <p className="text-xs text-muted-foreground">
            {timelineLabel} - mes {simState.month} de la corrida
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-[8px]"
                onClick={toggleControlsPanelMinimized}
                aria-label="Minimizar panel de control"
              >
                <ShortcutFlag
                  className={compactFlagClassName}
                  hidden={!showShortcutHints}
                  hotkey={CONTROLS_PANEL_HOTKEY}
                />
                <Minimize2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Minimizar panel{" "}
              <ShortcutBadge
                hidden={!showShortcutHints}
                hotkey={CONTROLS_PANEL_HOTKEY}
              />
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-[8px]"
                onClick={() => setConfigOpen(true)}
                aria-label="Configurar modelo"
                data-tour="config-button"
              >
                <ShortcutFlag
                  className={compactFlagClassName}
                  hidden={!showShortcutHints}
                  hotkey={CONFIG_HOTKEY}
                />
                <Settings />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Configurar modelo{" "}
              <ShortcutBadge
                hidden={!showShortcutHints}
                hotkey={CONFIG_HOTKEY}
              />
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0">
        <div className="grid grid-cols-3 gap-1.5" data-tour="scenario-selector">
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

        <div
          className="rounded-[8px] border border-border bg-card/80 p-2.5"
          data-tour="reservoir-status"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">
                {selectedScenario.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Reserva {metrics.reservoirPct.toFixed(1)}% - ONI{" "}
                {useSimulationStore.getState().oniValue > 0
                  ? `+${useSimulationStore.getState().oniValue.toFixed(1)}`
                  : useSimulationStore.getState().oniValue.toFixed(1)}
              </p>
            </div>
            <Badge
              variant={isPnr || isCollapse ? "destructive" : "outline"}
              className="shrink-0 rounded-[6px]"
            >
              {isCollapse ? "Colapso" : isPnr ? "PNR" : selectedScenario.badge}
            </Badge>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-[4px] bg-muted">
            <div
              className={`h-full rounded-[4px] transition-all ${
                isPnr ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${Math.max(metrics.reservoirPct, 0)}%` }}
            />
          </div>
          <div
            aria-hidden
            className="mt-1 h-px w-full bg-destructive/60"
            style={{ marginLeft: `${PNR_THRESHOLD_PCT}%`, width: "1px" }}
          />
        </div>

        <div
          className="grid grid-cols-2 gap-1.5 text-xs"
          data-tour="flow-metrics"
        >
          <Metric
            label="Entrada"
            value={`${formatMcm(metrics.inflowMcmPerMonth)} Mm³/mes`}
            hint={`${formatM3PerSecond(metrics.inflowM3PerSecond)} m³/s`}
          />
          <Metric
            label="Extraccion"
            value={`${formatMcm(metrics.extractionMcmPerMonth)} Mm³/mes`}
            hint={`${formatM3PerSecond(metrics.extractionM3PerSecond)} m³/s`}
          />
          <Metric
            label="Demanda"
            value={`${formatMcm(metrics.totalDemandMcmPerMonth)} Mm³/mes`}
            hint="Dom + ind + agr"
          />
          <Metric
            label="Evaporacion"
            value={`${formatMcm(metrics.evaporationMcmPerMonth)} Mm³/mes`}
            hint={
              metrics.fireImpactPct > 0
                ? `Fuego ${formatPct(metrics.fireImpactPct, 0)}`
                : `Riesgo ${formatPct(metrics.fireProbabilityPct, 0)}`
            }
          />
          <Metric
            label="Páramo"
            value={formatPct(metrics.paramoCoverage * 100, 1)}
            hint={metrics.paramoCoverage < 0.4 ? "Degradado" : "Sano"}
          />
          <Metric
            label="Acuifero"
            value={formatPct(metrics.aquiferLevel * 100, 0)}
            hint="Nivel relativo"
          />
        </div>

        <div className="rounded-[8px] border border-border bg-card/80 p-2.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Label
              htmlFor="simulation-speed"
              className="text-xs font-medium text-foreground"
            >
              Velocidad de simulacion
            </Label>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {simulationSpeedLabel}x
            </span>
          </div>
          <Slider
            id="simulation-speed"
            value={[simulationSpeed]}
            min={SIMULATION_SPEED_MIN}
            max={SIMULATION_SPEED_MAX}
            step={SIMULATION_SPEED_STEP}
            onValueChange={(value) => setSimulationSpeed(value[0])}
            aria-label="Velocidad de simulacion"
            className="w-full"
          />
          <div className="mt-1.5 flex justify-between text-[0.68rem] text-muted-foreground">
            <span>Lenta</span>
            <span>Normal</span>
            <span>Rapida</span>
          </div>
        </div>

        <div
          className="grid grid-cols-[1fr_auto_auto] items-center gap-2"
          data-tour="playback-controls"
        >
          <Button
            variant={isPlaying ? "secondary" : "default"}
            className="relative h-10 rounded-[8px]"
            onClick={togglePlayback}
            disabled={metrics.collapse}
            aria-label={isPlaying ? "Pausar simulacion" : "Iniciar simulacion"}
          >
            <ShortcutFlag
              className={compactFlagClassName}
              hidden={!showShortcutHints}
              hotkey={PLAYBACK_HOTKEY}
            />
            {isPlaying ? (
              <>
                <Pause /> Pausar
              </>
            ) : (
              <>
                <Play /> Simular
              </>
            )}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative size-10 rounded-[8px]"
                onClick={resetSimulation}
                aria-label="Reiniciar simulacion"
              >
                <ShortcutFlag
                  className={compactFlagClassName}
                  hidden={!showShortcutHints}
                  hotkey={RESET_HOTKEY}
                />
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Reiniciar al estado inicial{" "}
              <ShortcutBadge
                hidden={!showShortcutHints}
                hotkey={RESET_HOTKEY}
              />
            </TooltipContent>
          </Tooltip>
          <div className="text-right text-xs text-muted-foreground tabular-nums">
            mes {simState.month}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
