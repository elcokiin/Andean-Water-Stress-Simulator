import { ArrowLeft, HelpCircle, Moon, Sun, Waves } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { getCitySceneConfig } from "@/src/lib/hydrosim/city-scenes";
import type { ReservoirId } from "@/src/lib/hydrosim/types";

const reservoirOptions: { id: ReservoirId; label: string }[] = [
  { id: "tunja", label: "Tunja" },
  { id: "duitama", label: "Duitama" },
  { id: "sogamoso", label: "Sogamoso" },
];

export function TitleBar() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const reservoir = useSimulationStore((s) => s.reservoir);
  const setReservoir = useSimulationStore((s) => s.setReservoir);
  const setConfigOpen = useSimulationStore((s) => s.setConfigOpen);
  const city = getCitySceneConfig(reservoir);

  return (
    <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2">
      <div className="flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-[10px] border border-border bg-background/85 px-3 py-2 shadow-lg backdrop-blur-sm sm:px-5">
        <Button variant="ghost" size="icon-sm" asChild aria-label="Volver">
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex min-w-0 items-center gap-2">
          <Waves className="shrink-0 text-primary" aria-hidden="true" />
          <h1 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
            {city.title}
          </h1>
        </div>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <ToggleGroup
          type="single"
          value={reservoir}
          onValueChange={(value) => {
            if (!value) return;

            const nextReservoir = value as ReservoirId;
            setReservoir(nextReservoir);
            navigate(
              nextReservoir === "tunja" ? "/model" : `/model/${nextReservoir}`,
            );
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Seleccionar embalse"
          className="shrink-0"
        >
          {reservoirOptions.map((option) => (
            <ToggleGroupItem
              key={option.id}
              value={option.id}
              aria-label={`Seleccionar ${option.label}`}
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setConfigOpen(true)}
              aria-label="Abrir guia del modelo"
            >
              <HelpCircle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Guia del modelo</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-5" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggle}
              aria-label={
                theme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
