import { useEffect, useRef } from "react";
import { ArrowLeft, HelpCircle, Moon, Music, Sun, Waves } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShortcutBadge, ShortcutFlag } from "@/components/ui/shortcut-flag";
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

const CONFIG_HOTKEY = "C";
const SHORTCUTS_HOTKEY = "Shift+/";
const THEME_HOTKEY = "D";
const AUDIO_HOTKEY = "M";
const compactFlagClassName =
  "h-3.5 min-w-3.5 rounded-[3px] px-0.5 text-[0.5rem]";

export function TitleBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const reservoir = useSimulationStore((s) => s.reservoir);
  const setReservoir = useSimulationStore((s) => s.setReservoir);
  const ambientAudioEnabled = useSimulationStore((s) => s.ambientAudioEnabled);
  const toggleAmbientAudio = useSimulationStore((s) => s.toggleAmbientAudio);
  const setAmbientAudioEnabled = useSimulationStore(
    (s) => s.setAmbientAudioEnabled,
  );
  const showShortcutHints = useSimulationStore((s) => s.showShortcutHints);
  const setConfigOpen = useSimulationStore((s) => s.setConfigOpen);
  const city = getCitySceneConfig(reservoir);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!ambientAudioEnabled) {
      audio.pause();
      return;
    }

    void audio.play().catch(() => {
      setAmbientAudioEnabled(false);
    });
  }, [ambientAudioEnabled, setAmbientAudioEnabled]);

  return (
    <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2">
      <audio
        ref={audioRef}
        src="/nature.mp3"
        loop
        preload="auto"
        onError={() => setAmbientAudioEnabled(false)}
      />
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
              className="relative"
              onClick={() => setConfigOpen(true)}
              aria-label="Abrir guia del modelo"
            >
              <ShortcutFlag
                className={compactFlagClassName}
                hidden={!showShortcutHints}
                hotkey={CONFIG_HOTKEY}
              />
              <HelpCircle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Guia del modelo{" "}
            <ShortcutBadge hidden={!showShortcutHints} hotkey={CONFIG_HOTKEY} />
            <ShortcutBadge
              hidden={!showShortcutHints}
              hotkey={SHORTCUTS_HOTKEY}
            />
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-5" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={ambientAudioEnabled ? "secondary" : "ghost"}
              size="icon-sm"
              className="relative"
              onClick={toggleAmbientAudio}
              aria-label={
                ambientAudioEnabled
                  ? "Desactivar audio ambiente"
                  : "Activar audio ambiente"
              }
              aria-pressed={ambientAudioEnabled}
            >
              <ShortcutFlag
                className={compactFlagClassName}
                hidden={!showShortcutHints}
                hotkey={AUDIO_HOTKEY}
              />
              <Music />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {ambientAudioEnabled
              ? "Desactivar audio ambiente"
              : "Activar audio ambiente"}{" "}
            <ShortcutBadge hidden={!showShortcutHints} hotkey={AUDIO_HOTKEY} />
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative"
              onClick={toggle}
              aria-label={
                theme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
            >
              <ShortcutFlag
                className={compactFlagClassName}
                hidden={!showShortcutHints}
                hotkey={THEME_HOTKEY}
              />
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}{" "}
            <ShortcutBadge hidden={!showShortcutHints} hotkey={THEME_HOTKEY} />
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
