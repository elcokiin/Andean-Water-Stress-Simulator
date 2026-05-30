import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Float,
  Grid,
  OrbitControls,
  Sphere,
} from "@react-three/drei";
import {
  ArrowLeft,
  CalendarClock,
  Gauge,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ScenarioId = "baseline" | "moderate" | "extreme";

const scenarios: Record<
  ScenarioId,
  {
    name: string;
    badge: string;
    reserve: number;
    inflow: string;
    demand: string;
    oni: string;
    color: string;
    emissive: string;
  }
> = {
  baseline: {
    name: "Linea base",
    badge: "Calibracion",
    reserve: 68,
    inflow: "Promedio historico",
    demand: "Sin racionamiento",
    oni: "0.0",
    color: "#38bdf8",
    emissive: "#0f766e",
  },
  moderate: {
    name: "El Nino moderado",
    badge: "Estres",
    reserve: 38,
    inflow: "-35% entrada",
    demand: "Control parcial",
    oni: "+1.4",
    color: "#facc15",
    emissive: "#a16207",
  },
  extreme: {
    name: "El Nino extraordinario",
    badge: "Critico",
    reserve: 14,
    inflow: "-60% entrada",
    demand: "Racionamiento",
    oni: "+2.6",
    color: "#fb7185",
    emissive: "#be123c",
  },
};

const timeline = [
  "2000 calibracion",
  "2024 presente",
  "2030 tension",
  "2035 umbral",
] as const;

export default function ModelScene() {
  const [scenario, setScenario] = useState<ScenarioId>("baseline");
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(1);
  const [configOpen, setConfigOpen] = useState(false);
  const selectedScenario = scenarios[scenario];

  const reservoirScale = useMemo(
    () => Math.max(selectedScenario.reserve / 68, 0.24),
    [selectedScenario.reserve],
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative h-screen w-screen overflow-hidden bg-background font-sans">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 2.5, 6], fov: 45 }}>
            <color attach="background" args={["#06131b"]} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[8, 10, 6]} intensity={1.1} />
            <Environment preset="city" />
            <Grid
              infiniteGrid
              fadeDistance={26}
              fadeStrength={4}
              cellColor="#2dd4bf"
              sectionColor="#0284c7"
            />
            <Float speed={1.4} rotationIntensity={0.32} floatIntensity={0.55}>
              <Sphere args={[1, 64, 64]} position={[0, 1.15, 0]}>
                <meshStandardMaterial
                  color={selectedScenario.color}
                  emissive={selectedScenario.emissive}
                  emissiveIntensity={0.55}
                  wireframe
                />
              </Sphere>
              <Sphere
                args={[0.72 * reservoirScale, 48, 48]}
                position={[0, 1.15, 0]}
              >
                <meshStandardMaterial
                  color={selectedScenario.color}
                  emissive={selectedScenario.color}
                  emissiveIntensity={0.18}
                  transparent
                  opacity={0.38}
                  roughness={0.22}
                />
              </Sphere>
            </Float>
            <OrbitControls
              autoRotate={isPlaying}
              autoRotateSpeed={0.55}
              enableDamping
              makeDefault
            />
          </Canvas>
        </div>

        <TitleBar onOpenHelp={() => setConfigOpen(true)} />

        <ControlsPanel
          isPlaying={isPlaying}
          scenario={scenario}
          selectedScenario={selectedScenario}
          step={step}
          onConfigOpen={() => setConfigOpen(true)}
          onScenarioChange={setScenario}
          onStepBack={() => setStep((value) => Math.max(value - 1, 0))}
          onStepForward={() =>
            setStep((value) => Math.min(value + 1, timeline.length - 1))
          }
          onTogglePlayback={() => setIsPlaying((value) => !value)}
          onReset={() => {
            setIsPlaying(false);
            setStep(0);
            setScenario("baseline");
          }}
        />

        <ModelConfigDialog
          open={configOpen}
          scenario={scenario}
          selectedScenario={selectedScenario}
          onOpenChange={setConfigOpen}
          onScenarioChange={setScenario}
        />
      </div>
    </TooltipProvider>
  );
}

function TitleBar({ onOpenHelp }: { onOpenHelp: () => void }) {
  return (
    <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/85 px-3 py-2 shadow-lg backdrop-blur-sm sm:px-5">
        <Button variant="ghost" size="icon-sm" asChild aria-label="Volver">
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex min-w-0 items-center gap-2">
          <Waves className="shrink-0 text-primary" aria-hidden="true" />
          <h1 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
            HydroSim - Modelo hidrico de Boyaca
          </h1>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onOpenHelp}
              aria-label="Abrir guia del modelo"
            >
              <HelpCircle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Guia del modelo</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function ControlsPanel({
  isPlaying,
  scenario,
  selectedScenario,
  step,
  onConfigOpen,
  onReset,
  onScenarioChange,
  onStepBack,
  onStepForward,
  onTogglePlayback,
}: {
  isPlaying: boolean;
  scenario: ScenarioId;
  selectedScenario: (typeof scenarios)[ScenarioId];
  step: number;
  onConfigOpen: () => void;
  onReset: () => void;
  onScenarioChange: (scenario: ScenarioId) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onTogglePlayback: () => void;
}) {
  return (
    <Card className="absolute right-3 bottom-3 left-3 z-10 gap-3 border-border/80 bg-background/90 p-4 shadow-xl backdrop-blur-sm sm:right-auto sm:left-4 sm:w-[360px]">
      <CardHeader className="flex-row items-center justify-between gap-3 p-0">
        <div>
          <CardTitle className="text-sm">Panel de control</CardTitle>
          <p className="text-xs text-muted-foreground">
            Escenarios y navegacion temporal
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onConfigOpen}>
          <Settings data-icon="inline-start" />
          Configurar
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-0">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(scenarios) as ScenarioId[]).map((scenarioId) => (
            <Button
              key={scenarioId}
              variant={scenario === scenarioId ? "default" : "outline"}
              size="sm"
              className="h-auto flex-col items-start gap-1 px-2 py-2 text-left"
              onClick={() => onScenarioChange(scenarioId)}
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

        <div className="grid grid-cols-3 gap-2 text-xs">
          <Metric label="Reserva" value={`${selectedScenario.reserve}%`} />
          <Metric label="Entrada" value={selectedScenario.inflow} />
          <Metric label="Demanda" value={selectedScenario.demand} />
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            aria-label="Reiniciar simulacion"
          >
            <RotateCcw />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onStepBack}
            disabled={step <= 0}
            aria-label="Paso anterior"
          >
            <SkipBack />
          </Button>
          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="icon"
            onClick={onTogglePlayback}
            aria-label={isPlaying ? "Pausar simulacion" : "Iniciar simulacion"}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onStepForward}
            disabled={step >= timeline.length - 1}
            aria-label="Siguiente paso"
          >
            <SkipForward />
          </Button>
          <div className="ml-auto text-right">
            <p className="text-xs font-medium text-foreground">
              {timeline[step]}
            </p>
            <p className="text-[0.68rem] text-muted-foreground">
              Paso {step + 1} / {timeline.length}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/45 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium">Estado del sistema</span>
            <Badge
              variant={
                selectedScenario.reserve <= 15 ? "destructive" : "outline"
              }
            >
              {selectedScenario.reserve <= 15 ? "PNR" : selectedScenario.badge}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {selectedScenario.name}: reserva simulada al{" "}
            {selectedScenario.reserve}% con ONI {selectedScenario.oni}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card/80 p-2">
      <p className="truncate text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ModelConfigDialog({
  open,
  scenario,
  selectedScenario,
  onOpenChange,
  onScenarioChange,
}: {
  open: boolean;
  scenario: ScenarioId;
  selectedScenario: (typeof scenarios)[ScenarioId];
  onOpenChange: (open: boolean) => void;
  onScenarioChange: (scenario: ScenarioId) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(720px,calc(100vh-2rem))] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuracion del modelo</DialogTitle>
          <DialogDescription>
            Base inicial para conectar el modelo real de dinamica de sistemas,
            sus escenarios y parametros de calibracion.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Gauge aria-hidden="true" />
                Escenario activo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {(Object.keys(scenarios) as ScenarioId[]).map((scenarioId) => (
                <Button
                  key={scenarioId}
                  variant={scenario === scenarioId ? "default" : "outline"}
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
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">Siguiente conexion</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            Esta interfaz deja preparado el terreno visual para reemplazar los
            valores mock por la salida real del modelo: stocks, flujos,
            auxiliares, politicas y series temporales.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={() => onOpenChange(false)}>Guardar base</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
