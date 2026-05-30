import {
  CalendarClock,
  Gauge,
  Maximize2,
  Minimize2,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { Metric } from "./Metric";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          isExpanded
            ? "!h-[calc(100vh-2rem)] !max-h-[calc(100vh-2rem)] !w-[calc(100vw-2rem)] !max-w-[calc(100vw-2rem)] sm:!max-w-[calc(100vw-2rem)]"
            : "h-[min(720px,calc(100vh-2rem))] sm:max-w-2xl",
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-start gap-3 pr-8">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2"
              onClick={onToggleExpanded}
              aria-label={
                isExpanded ? "Restaurar tamano del dialogo" : "Expandir dialogo"
              }
              title={isExpanded ? "Restaurar tamano" : "Expandir dialogo"}
            >
              {isExpanded ? <Minimize2 /> : <Maximize2 />}
            </Button>
            <div className="min-w-0">
              <DialogTitle>Configuracion del modelo</DialogTitle>
              <DialogDescription>
                Base inicial para conectar el modelo real de dinamica de
                sistemas, sus escenarios y parametros de calibracion.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={configTab}
          onValueChange={(value) => onConfigTabChange(value as ConfigTab)}
          className="min-h-0 flex-1 overflow-hidden"
        >
          <TabsList className="mx-6 mt-3 shrink-0">
            <TabsTrigger value="scenarios">Escenarios</TabsTrigger>
            <TabsTrigger value="parameters">Parametros</TabsTrigger>
            <TabsTrigger value="shortcuts">Atajos</TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="scenarios" className="mt-0">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <Card className="gap-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Gauge aria-hidden="true" />
                      Escenario activo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {scenarioIds.map((scenarioId) => (
                      <Button
                        key={scenarioId}
                        variant={
                          scenario === scenarioId ? "default" : "outline"
                        }
                        className="h-auto justify-start px-3 py-2 text-left"
                        onClick={() => onScenarioChange(scenarioId)}
                      >
                        <span className="flex min-w-0 flex-col items-start gap-1">
                          <span className="truncate text-sm font-semibold">
                            {scenarios[scenarioId].name}
                          </span>
                          <span className="truncate text-xs font-normal opacity-80">
                            Reserva {scenarios[scenarioId].reserve}% - ONI{" "}
                            {scenarios[scenarioId].oni}
                          </span>
                        </span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="gap-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Waves aria-hidden="true" />
                      Lectura del escenario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Metric
                      label="Reserva"
                      value={`${selectedScenario.reserve}%`}
                    />
                    <Metric label="Entrada" value={selectedScenario.inflow} />
                    <Metric label="Demanda" value={selectedScenario.demand} />
                    <Metric label="ONI" value={selectedScenario.oni} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="mt-0">
              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <Card className="gap-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <CalendarClock aria-hidden="true" />
                      Parametros pendientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 text-sm">
                    <Metric label="Reserva critica" value="15%" />
                    <Metric label="Recarga critica" value="< 20%" />
                    <Metric label="Eficiencia red" value="62%" />
                    <Metric label="Escenario" value={selectedScenario.badge} />
                  </CardContent>
                </Card>

                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                  <p className="font-medium text-foreground">
                    Siguiente conexion
                  </p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    Esta interfaz deja preparado el terreno visual para
                    reemplazar los valores mock por la salida real del modelo:
                    stocks, flujos, auxiliares, politicas y series temporales.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts" className="mt-0">
              <ShortcutsPanel />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={() => onOpenChange(false)}>Guardar base</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
