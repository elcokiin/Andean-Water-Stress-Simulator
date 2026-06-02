import { formatForDisplay } from "@tanstack/react-hotkeys";
import type * as React from "react";

import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

const cornerClassNames = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "right-0 bottom-0",
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
