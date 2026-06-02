import { useMemo, useState } from "react";

import { getCapacityM3 } from "@/src/lib/hydrosim/engine";
import type { HistoryEntry } from "@/src/lib/hydrosim/engine";
import type { ReservoirId } from "@/src/lib/hydrosim/types";

const M3_PER_MCM = 1_000_000;
const VIEWBOX_WIDTH = 640;
const VIEWBOX_HEIGHT = 260;
const CHART = {
  left: 48,
  right: 14,
  top: 18,
  bottom: 32,
} as const;
const INNER_WIDTH = VIEWBOX_WIDTH - CHART.left - CHART.right;
const INNER_HEIGHT = VIEWBOX_HEIGHT - CHART.top - CHART.bottom;
const START_YEAR = 2024;

interface BalancePoint {
  month: number;
  year: number;
  inflowMcm: number;
  outflowMcm: number;
  netMcm: number;
  deltaMcm: number;
  residualMcm: number;
}

interface SeriesConfig {
  key: "inflowMcm" | "outflowMcm" | "netMcm";
  label: string;
  color: string;
}

const SERIES: SeriesConfig[] = [
  { key: "inflowMcm", label: "Entradas", color: "#0ea5e9" },
  { key: "outflowMcm", label: "Salidas", color: "#f97316" },
  { key: "netMcm", label: "Neto", color: "#22c55e" },
];

function toMcm(valueM3: number) {
  return valueM3 / M3_PER_MCM;
}

function toBalancePoints(
  entries: HistoryEntry[],
  reservoir: ReservoirId,
): BalancePoint[] {
  const capacityMcm = getCapacityM3(reservoir) / M3_PER_MCM;

  return entries.map((entry, index) => {
    const inflowMcm = toMcm(entry.flows.inflow + entry.flows.recharge);
    const outflowMcm = toMcm(
      entry.flows.extraction + entry.flows.evaporation + entry.flows.filtration,
    );
    const netMcm = inflowMcm - outflowMcm;
    const previousPct = entries[index - 1]?.reservoirPct;
    const deltaMcm =
      previousPct === undefined
        ? netMcm
        : ((entry.reservoirPct - previousPct) / 100) * capacityMcm;

    return {
      month: entry.month,
      year: entry.date.year,
      inflowMcm,
      outflowMcm,
      netMcm,
      deltaMcm,
      residualMcm: deltaMcm - netMcm,
    };
  });
}

function xForIndex(index: number, total: number) {
  if (total <= 1) return CHART.left + INNER_WIDTH / 2;
  return CHART.left + (index / (total - 1)) * INNER_WIDTH;
}

function yForValue(value: number, min: number, max: number) {
  if (max === min) return CHART.top + INNER_HEIGHT / 2;
  return CHART.top + ((max - value) / (max - min)) * INNER_HEIGHT;
}

function buildPath(
  points: BalancePoint[],
  key: SeriesConfig["key"],
  min: number,
  max: number,
) {
  if (points.length === 0) return "";
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${xForIndex(index, points.length).toFixed(2)} ${yForValue(point[key], min, max).toFixed(2)}`;
    })
    .join(" ");
}

function yearTicks(data: BalancePoint[]) {
  if (data.length === 0) return [];
  const firstYear = data[0]?.year ?? START_YEAR;
  const lastYear = data.at(-1)?.year ?? START_YEAR;
  const span = Math.max(1, lastYear - firstYear);
  const step = span <= 6 ? 1 : Math.ceil(span / 5);
  const ticks: number[] = [];
  for (let year = firstYear; year <= lastYear; year += step) ticks.push(year);
  if (!ticks.includes(lastYear)) ticks.push(lastYear);
  return ticks;
}

function firstIndexForYear(data: BalancePoint[], year: number) {
  const index = data.findIndex((point) => point.year === year);
  return index === -1 ? data.length - 1 : index;
}

function formatMcm(value: number) {
  const abs = Math.abs(value);
  const digits = abs >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} Mm3`;
}

function niceTicks(min: number, max: number) {
  if (max === min) return [min];
  const step = (max - min) / 4;
  return Array.from({ length: 5 }, (_, index) => min + step * index);
}

export function WaterBalanceChart({
  entries,
  reservoir,
  height = 220,
}: {
  entries: HistoryEntry[];
  reservoir: ReservoirId;
  height?: number;
}) {
  const data = useMemo(
    () => toBalancePoints(entries, reservoir),
    [entries, reservoir],
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredPoint =
    hoveredIndex === null ? undefined : (data[hoveredIndex] ?? undefined);

  const domain = useMemo(() => {
    if (data.length === 0) return { min: -1, max: 1 };
    const values = data.flatMap((point) => [
      point.inflowMcm,
      point.outflowMcm,
      point.netMcm,
      0,
    ]);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = Math.max(0.4, (rawMax - rawMin) * 0.12);
    return {
      min: rawMin - padding,
      max: rawMax + padding,
    };
  }, [data]);

  const paths = useMemo(
    () =>
      SERIES.map((series) => ({
        ...series,
        path: buildPath(data, series.key, domain.min, domain.max),
      })),
    [data, domain],
  );
  const ticks = useMemo(() => yearTicks(data), [data]);
  const yTicks = useMemo(() => niceTicks(domain.min, domain.max), [domain]);
  const zeroY = yForValue(0, domain.min, domain.max);
  const hoveredX =
    hoveredIndex === null ? undefined : xForIndex(hoveredIndex, data.length);
  const latestPoint = data.at(-1);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-[8px] border border-dashed border-border/70 bg-card/40 text-xs text-muted-foreground"
        style={{ height }}
      >
        Inicia la simulacion para ver el balance hidrico
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="relative w-full overflow-hidden rounded-[8px] border border-border/70 bg-card/40"
        style={{ height }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg
          className="h-full w-full"
          role="img"
          aria-label="Balance hidrico mensual de entradas, salidas y cambio neto"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x =
              ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH -
              CHART.left;
            const index = Math.round((x / INNER_WIDTH) * (data.length - 1));
            setHoveredIndex(Math.min(data.length - 1, Math.max(0, index)));
          }}
        >
          {yTicks.map((tick) => {
            const y = yForValue(tick, domain.min, domain.max);
            return (
              <g key={tick.toFixed(2)}>
                <line
                  x1={CHART.left}
                  x2={VIEWBOX_WIDTH - CHART.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border/55"
                  strokeWidth="1"
                />
                <text
                  x={CHART.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          <line
            x1={CHART.left}
            x2={VIEWBOX_WIDTH - CHART.right}
            y1={zeroY}
            y2={zeroY}
            stroke="currentColor"
            className="text-foreground/55"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />

          {ticks.map((year) => {
            const x = xForIndex(firstIndexForYear(data, year), data.length);
            return (
              <text
                key={year}
                x={x}
                y={VIEWBOX_HEIGHT - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {year}
              </text>
            );
          })}

          {paths.map((series) => (
            <path
              key={series.key}
              d={series.path}
              fill="none"
              stroke={series.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={series.key === "netMcm" ? "2.8" : "2"}
              opacity={series.key === "netMcm" ? "1" : "0.78"}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {hoveredPoint && hoveredX !== undefined ? (
            <g>
              <line
                x1={hoveredX}
                x2={hoveredX}
                y1={CHART.top}
                y2={VIEWBOX_HEIGHT - CHART.bottom}
                stroke="currentColor"
                className="text-muted-foreground/50"
                strokeDasharray="3 4"
                strokeWidth="1"
              />
              {SERIES.map((series) => (
                <circle
                  key={series.key}
                  cx={hoveredX}
                  cy={yForValue(
                    hoveredPoint[series.key],
                    domain.min,
                    domain.max,
                  )}
                  r={series.key === "netMcm" ? "4" : "3"}
                  fill={series.color}
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                />
              ))}
            </g>
          ) : null}
        </svg>

        {hoveredPoint && hoveredX !== undefined ? (
          <div
            className="pointer-events-none absolute top-2 rounded-[6px] border border-border/70 bg-background/95 px-2 py-1 text-[0.65rem] shadow-lg"
            style={{
              left: `${(hoveredX / VIEWBOX_WIDTH) * 100}%`,
              transform:
                hoveredX > VIEWBOX_WIDTH * 0.68
                  ? "translateX(-100%)"
                  : "translateX(6px)",
            }}
          >
            <div className="font-medium text-foreground">
              {hoveredPoint.year} · mes {hoveredPoint.month}
            </div>
            <div className="grid grid-cols-[auto_auto] gap-x-2 font-mono tabular-nums">
              <span className="text-sky-500">Entradas</span>
              <span>{formatMcm(hoveredPoint.inflowMcm)}</span>
              <span className="text-orange-500">Salidas</span>
              <span>{formatMcm(hoveredPoint.outflowMcm)}</span>
              <span className="text-green-500">Neto</span>
              <span>{formatMcm(hoveredPoint.netMcm)}</span>
              <span className="text-muted-foreground">Cambio</span>
              <span>{formatMcm(hoveredPoint.deltaMcm)}</span>
              <span className="text-muted-foreground">Cierre</span>
              <span>{formatMcm(hoveredPoint.residualMcm)}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[0.65rem]">
        {SERIES.map((series) => (
          <div
            key={series.key}
            className="flex items-center gap-1.5 rounded-[6px] border border-border/60 bg-background/45 px-2 py-1"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: series.color }}
              aria-hidden="true"
            />
            <span className="truncate text-muted-foreground">
              {series.label}
            </span>
          </div>
        ))}
      </div>

      {latestPoint ? (
        <div className="flex items-center justify-between gap-2 rounded-[6px] border border-border/60 bg-background/45 px-2 py-1 text-[0.65rem]">
          <span className="text-muted-foreground">
            Cierre de masa del ultimo mes
          </span>
          <span className="font-mono tabular-nums text-foreground">
            {formatMcm(latestPoint.residualMcm)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
