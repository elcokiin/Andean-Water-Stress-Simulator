import { useEffect, useState } from "react";
import { Flame, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { formatMcm, formatPct } from "@/src/lib/hydrosim/engine";

export function FireEventToast() {
  const fireEvent = useSimulationStore((s) => s.simState.fireEvent);
  const [dismissedEventId, setDismissedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!fireEvent) return undefined;
    const timeout = window.setTimeout(() => {
      setDismissedEventId(fireEvent.id);
    }, 9000);
    return () => window.clearTimeout(timeout);
  }, [fireEvent]);

  if (!fireEvent || dismissedEventId === fireEvent.id) return null;

  const reservoirLossMcm = fireEvent.reservoirLossM3 / 1_000_000;
  const paramoLossPct = fireEvent.paramoLoss * 100;

  return (
    <div className="pointer-events-none absolute top-20 right-3 z-20 w-[min(420px,calc(100vw-1.5rem))] sm:right-4">
      <div className="pointer-events-auto overflow-hidden rounded-[10px] border border-destructive/30 bg-background/95 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-3 border-b border-destructive/20 bg-destructive/10 px-4 py-3">
          <div className="mt-0.5 rounded-[8px] bg-destructive/15 p-2 text-destructive">
            <Flame className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Incendio de páramo detectado
            </p>
            <p className="text-xs text-muted-foreground">
              Mes {fireEvent.month} - impacto{" "}
              {formatPct(fireEvent.impact * 100, 0)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDismissedEventId(fireEvent.id)}
            aria-label="Cerrar aviso de incendio"
          >
            <X />
          </Button>
        </div>
        <div className="space-y-2 px-4 py-3 text-sm">
          <p>
            El sorteo mensual quedó por debajo de la probabilidad configurada:
            roll {formatPct(fireEvent.roll * 100, 1)} frente a{" "}
            {formatPct(fireEvent.probability * 100, 1)}.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-[8px] border border-border bg-muted/30 p-2">
              <p className="text-muted-foreground">Pérdida del embalse</p>
              <p className="font-mono text-sm">
                {formatMcm(reservoirLossMcm)} Mm³
              </p>
            </div>
            <div className="rounded-[8px] border border-border bg-muted/30 p-2">
              <p className="text-muted-foreground">Pérdida de páramo</p>
              <p className="font-mono text-sm">{formatPct(paramoLossPct, 1)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            La pérdida de cobertura reduce la retención de agua de la cuenca y
            el volumen perdido acelera la caída del embalse en la corrida.
          </p>
        </div>
      </div>
    </div>
  );
}
