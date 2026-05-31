import { useEffect, useState } from "react";
import {
  CalendarClock,
  Gauge,
  Maximize2,
  Minimize2,
  Waves,
  CloudRain,
  Users,
  Zap,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { ShortcutsPanel } from "./ShortcutsPanel";
import { scenarioIds, scenarios } from "./model-data";
import type { ConfigTab, Scenario, ScenarioId } from "./model-data";

export function ModelConfigDialog({
  configTab,
  isExpanded,
  open,
  scenario,
  selectedScenario,
  onConfigTabChange,
  onOpenChange,
  onScenarioChange,
  onToggleExpanded,
}: {
  configTab: ConfigTab;
  isExpanded: boolean;
  open: boolean;
  scenario: ScenarioId;
  selectedScenario: Scenario;
  onConfigTabChange: (tab: ConfigTab) => void;
  onOpenChange: (open: boolean) => void;
  onScenarioChange: (scenario: ScenarioId) => void;
  onToggleExpanded: () => void;
}) {
  const [oniValue, setOniValue] = useState(parseFloat(selectedScenario.oni));
  const [rainValue, setRainValue] = useState(85);
  const [demandValue, setDemandValue] = useState(120);
  const [efficiencyValue, setEfficiencyValue] = useState(62);

  useEffect(() => {
    setOniValue(parseFloat(selectedScenario.oni));
  }, [selectedScenario]);

  const sidebarItems = [
    { id: "scenarios", icon: Gauge, label: "Escenarios Rápidos" },
    { id: "climate", icon: CloudRain, label: "Clima y Entorno" },
    { id: "demand", icon: Users, label: "Demanda Poblacional" },
    { id: "infrastructure", icon: Zap, label: "Infraestructura" },
    { id: "shortcuts", icon: CalendarClock, label: "Atajos y Atributos" },
  ] as const;

  // Usa configTab como estado de navegación del Sidebar.
  // Mapeamos los viejos tabs ('parameters') a los nuevos por ahora,
  // o los tratamos como pestañas adicionales en este rediseño.
  const activeTab = configTab === "parameters" ? "climate" : configTab;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          isExpanded
            ? "!h-[calc(100vh-2rem)] !max-h-[calc(100vh-2rem)] !w-[calc(100vw-2rem)] !max-w-[calc(100vw-2rem)] sm:!max-w-[calc(100vw-2rem)]"
            : "h-[min(760px,calc(100vh-2rem))] sm:max-w-4xl",
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-start gap-3 pr-8">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2"
              onClick={onToggleExpanded}
            >
              {isExpanded ? <Minimize2 /> : <Maximize2 />}
            </Button>
            <div className="min-w-0">
              <DialogTitle className="text-xl">
                Configuración del Simulador
              </DialogTitle>
              <DialogDescription>
                Ajusta las variables de la dinámica de sistemas para
                previsualizar diferentes escenarios en tiempo real.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Layout Maestro-Detalle (Sidebar a la izquierda, Contenido a la derecha) */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Menú Lateral */}
          <div className="w-56 shrink-0 border-r border-border bg-muted/30">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-1 p-4">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onConfigTabChange(item.id as ConfigTab)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      activeTab === item.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Área de Contenido Principal */}
          <div className="flex-1 bg-background">
            <ScrollArea className="h-full">
              <div className="p-6">
                {/* 1. SECCIÓN DE ESCENARIOS */}
                {activeTab === "scenarios" && (
                  <div className="animate-in fade-in-50 space-y-6">
                    <div>
                      <h3 className="mb-1 text-lg font-semibold">
                        Escenarios Predefinidos
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Selecciona una configuración rápida para cargar los
                        parámetros preestablecidos.
                      </p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {scenarioIds.map((scenarioId) => (
                          <button
                            key={scenarioId}
                            onClick={() => onScenarioChange(scenarioId)}
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
                          <p className="text-lg font-semibold">
                            {selectedScenario.reserve}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entrada</p>
                          <p className="text-lg font-semibold">
                            {selectedScenario.inflow}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Demanda</p>
                          <p className="text-lg font-semibold">
                            {selectedScenario.demand}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Índice ONI</p>
                          <p className="text-lg font-semibold">
                            {selectedScenario.oni}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SECCIÓN CLIMA (NUEVO DISEÑO CON SLIDERS) */}
                {activeTab === "climate" && (
                  <div className="animate-in fade-in-50 space-y-8">
                    <div>
                      <h3 className="mb-1 text-lg font-semibold">
                        Clima y Entorno Ambiental
                      </h3>
                      <p className="mb-6 text-sm text-muted-foreground">
                        Ajusta las variables de la naturaleza que afectan la
                        entrada de agua al embalse.
                      </p>
                    </div>

                    {/* Slider 1: Índice ONI */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="oni"
                          className="flex items-center gap-2 text-base"
                        >
                          Índice Oceánico del Niño (ONI)
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                Valores positivos (+0.5 en adelante) indican
                                presencia del Fenómeno de El Niño (sequía en la
                                región). Valores negativos indican La Niña
                                (lluvias).
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

                    {/* Slider 2: Precipitaciones */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="rain"
                          className="flex items-center gap-2 text-base"
                        >
                          Precipitación Base
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                Precipitación mensual promedio que recarga el
                                embalse mediante escorrentía en la cuenca.
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
                )}

                {/* 3. DEMANDA POBLACIONAL */}
                {activeTab === "demand" && (
                  <div className="animate-in fade-in-50 space-y-8">
                    <div>
                      <h3 className="mb-1 text-lg font-semibold">
                        Demanda y Consumo
                      </h3>
                      <p className="mb-6 text-sm text-muted-foreground">
                        Ajusta las métricas de consumo de la población y las
                        políticas de racionamiento.
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
                                Consumo diario estimado por habitante en la
                                región, considerando usos residenciales y
                                comerciales básicos.
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

                    {/* Switch Policy */}
                    <div className="mt-6 flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold">
                          Política de Racionamiento Activa
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Fuerza la reducción de la demanda en un 30% si la
                          reserva baja del 20%.
                        </p>
                      </div>
                      <Switch defaultChecked={scenario === "extreme"} />
                    </div>
                  </div>
                )}

                {/* INFRAESTRUCTURA (Ejemplo rápido) */}
                {activeTab === "infrastructure" && (
                  <div className="animate-in fade-in-50 space-y-8">
                    <div>
                      <h3 className="mb-1 text-lg font-semibold">
                        Infraestructura
                      </h3>
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
                                Porcentaje de agua que llega efectivamente a los
                                hogares. El resto se pierde en fugas de la red
                                de acueducto.
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
                        El restante 38% se asume como pérdida técnica (fugas en
                        tuberías).
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. ATAJOS */}
                {activeTab === "shortcuts" && (
                  <div className="animate-in fade-in-50">
                    <ShortcutsPanel />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-muted/10 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Descartar cambios
          </Button>
          <Button onClick={() => onOpenChange(false)}>Guardar y Simular</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
