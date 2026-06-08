import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  imageClassName?: string;
};

export function AppLogo({ className, imageClassName }: AppLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] shadow-sm ring-1 ring-border/30",
        className,
      )}
      aria-hidden="true"
    >
      <img
        src="/favicon.svg"
        alt=""
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </span>
  );
}
