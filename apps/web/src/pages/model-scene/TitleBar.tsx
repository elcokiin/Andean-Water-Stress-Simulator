import { ArrowLeft, HelpCircle, Moon, Sun, Waves } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/lib/theme-provider";
import { useSimulationStore } from "@/lib/stores/simulation-store";

export function TitleBar() {
  const { theme, toggle } = useTheme();
  const setConfigOpen = useSimulationStore((s) => s.setConfigOpen);

  return (
    <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-[10px] border border-border bg-background/85 px-3 py-2 shadow-lg backdrop-blur-sm sm:px-5">
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
