import { formatForDisplay } from "@tanstack/react-hotkeys";
import { Keyboard } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { shortcutGroups } from "@/src/lib/hydrosim/shortcuts";

export function ShortcutsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Keyboard aria-hidden="true" />
          Atajos de teclado
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Navegacion y control rapido del modelo, tomado del patron del
          simulador PRNG.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {shortcutGroups.map((group) => (
          <Card key={group.label} className="gap-2">
            <CardHeader>
              <CardTitle className="text-sm">{group.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {group.shortcuts.map(([keys, description]) => (
                <div
                  key={keys}
                  className="grid grid-cols-[8.5rem_1fr] items-center gap-3 rounded-lg border border-border bg-card/70 px-3 py-2 text-sm"
                >
                  <kbd className="truncate rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-foreground">
                    {formatForDisplay(keys)}
                  </kbd>
                  <span className="min-w-0 text-xs text-muted-foreground">
                    {description}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
