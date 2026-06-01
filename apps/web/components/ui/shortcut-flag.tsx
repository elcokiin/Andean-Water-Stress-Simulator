import { formatForDisplay } from "@tanstack/react-hotkeys";
import type * as React from "react";

import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

const cornerClassNames = {
  "top-left": "top-1 left-1",
  "top-right": "top-1 right-1",
  "bottom-left": "bottom-1 left-1",
  "bottom-right": "right-1 bottom-1",
} as const;

type ShortcutCorner = keyof typeof cornerClassNames;

type ShortcutBadgeProps = React.ComponentProps<typeof Kbd> & {
  hotkey: string;
};

function ShortcutBadge({ className, hotkey, ...props }: ShortcutBadgeProps) {
  return (
    <Kbd className={cn("font-mono", className)} {...props}>
      {formatForDisplay(hotkey)}
    </Kbd>
  );
}

type ShortcutFlagProps = ShortcutBadgeProps & {
  corner?: ShortcutCorner;
};

function ShortcutFlag({
  className,
  corner = "top-right",
  hotkey,
  ...props
}: ShortcutFlagProps) {
  return (
    <ShortcutBadge
      className={cn(
        "absolute z-20 shadow-sm",
        cornerClassNames[corner],
        className,
      )}
      hotkey={hotkey}
      {...props}
    />
  );
}

export { ShortcutBadge, ShortcutFlag };
