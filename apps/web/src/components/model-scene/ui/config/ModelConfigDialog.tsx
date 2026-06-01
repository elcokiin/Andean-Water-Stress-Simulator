import { useEffect } from "react";
import {
  CalendarClock,
  CloudRain,
  Gauge,
  Maximize2,
  Minimize2,
  Users,
  Zap,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShortcutBadge, ShortcutFlag } from "@/components/ui/shortcut-flag";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { scenarios } from "@/src/lib/hydrosim/scenarios";
import type { ConfigTab } from "@/src/lib/hydrosim/types";

import { ShortcutsPanel } from "../ShortcutsPanel";
import { ScenariosTab } from "./scenarios-tab";
import { ClimateTab } from "./climate-tab";
import { DemandTab } from "./demand-tab";
import { InfrastructureTab } from "./infrastructure-tab";

const EXPAND_DIALOG_HOTKEY = "Mod+E";
const DISCARD_HOTKEY = "Escape";
const SAVE_HOTKEY = "Mod+Enter";
const compactFlagClassName = "h-4 min-w-4 rounded-[4px] px-1 text-[0.6rem]";

export function ModelConfigDialog() {
  const configTab = useSimulationStore((s) => s.configTab);
  const isExpanded = useSimulationStore((s) => s.isDialogExpanded);
  const open = useSimulationStore((s) => s.configOpen);
  const scenario = useSimulationStore((s) => s.scenario);
  const setConfigTab = useSimulationStore((s) => s.setConfigTab);
  const setConfigOpen = useSimulationStore((s) => s.setConfigOpen);
  const toggleDialogExpanded = useSimulationStore(
    (s) => s.toggleDialogExpanded,
  );
  const setOniValue = useSimulationStore((s) => s.setOniValue);

  const selectedScenario = scenarios[scenario];

  useEffect(() => {
    setOniValue(parseFloat(selectedScenario.oni));
  }, [selectedScenario, setOniValue]);

  const sidebarItems = [
    {
      id: "scenarios",
      icon: Gauge,
      label: "Escenarios Rápidos",
      hotkey: "Mod+1",
    },
    {
      id: "climate",
      icon: CloudRain,
      label: "Clima y Entorno",
      hotkey: "Mod+2",
    },
    {
      id: "demand",
      icon: Users,
      label: "Demanda Poblacional",
      hotkey: "Mod+3",
    },
    {
      id: "infrastructure",
      icon: Zap,
      label: "Infraestructura",
      hotkey: "Mod+4",
    },
    {
      id: "shortcuts",
      icon: CalendarClock,
      label: "Atajos y Atributos",
      hotkey: "Mod+5",
    },
  ] as const;

  const activeTab = configTab === "parameters" ? "climate" : configTab;

  const renderTab = () => {
    switch (activeTab) {
      case "scenarios":
        return <ScenariosTab />;
      case "climate":
        return <ClimateTab />;
      case "demand":
        return <DemandTab />;
      case "infrastructure":
        return <InfrastructureTab />;
      case "shortcuts":
        return <ShortcutsPanel />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setConfigOpen}>
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
              className="relative -ml-2"
              onClick={toggleDialogExpanded}
              aria-label={isExpanded ? "Restaurar dialogo" : "Expandir dialogo"}
            >
              <ShortcutFlag
                className={compactFlagClassName}
                hotkey={EXPAND_DIALOG_HOTKEY}
              />
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

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="w-56 shrink-0 border-r border-border bg-muted/30">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-1 p-4">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfigTab(item.id as ConfigTab)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      activeTab === item.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <ShortcutBadge className="shrink-0" hotkey={item.hotkey} />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 bg-background">
            <ScrollArea className="h-full">
              <div className="p-6">{renderTab()}</div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-muted/10 px-6 py-4">
          <Button variant="outline" onClick={() => setConfigOpen(false)}>
            Descartar cambios
            <ShortcutBadge hotkey={DISCARD_HOTKEY} />
          </Button>
          <Button onClick={() => setConfigOpen(false)}>
            Guardar y Simular
            <ShortcutBadge hotkey={SAVE_HOTKEY} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
