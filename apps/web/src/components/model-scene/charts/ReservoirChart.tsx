import { useMemo, useState } from "react";

import { PNR_THRESHOLD_PCT } from "@/src/lib/hydrosim/engine";
import { scenarios } from "@/src/lib/hydrosim/scenarios";
import type { ScenarioId } from "@/src/lib/hydrosim/types";
import type { HistoryEntry } from "@/src/lib/hydrosim/engine";

const TARGET_PCT = 60;
const START_YEAR = 2024;
const VIEWBOX_WIDTH = 640;
const VIEWBOX_HEIGHT = 260;
const CHART = {
  left: 36,
  right: 14,
  top: 14,
  bottom: 32,
} as const;
const INNER_WIDTH = VIEWBOX_WIDTH - CHART.left - CHART.right;
const INNER_HEIGHT = VIEWBOX_HEIGHT - CHART.top - CHART.bottom;
const Y_TICKS = [0, 15, 30, 45, 60, 75, 90, 100] as const;

interface ChartPoint {
  month: number;
  year: number;
  yearLabel: string;
  reservoirPct: number;
  pnrTriggered: boolean;
  collapse: boolean;
}

function toChartPoints(entries: HistoryEntry[]): ChartPoint[] {
  return entries.map((entry) => ({
    month: entry.month,
    year: entry.date.year,
    yearLabel: String(entry.date.year),
    reservoirPct: Number(entry.reservoirPct.toFixed(2)),
    pnrTriggered: entry.pnrTriggered,
    collapse: entry.collapse,
  }));
}

function xForIndex(index: number, total: number) {
  if (total <= 1) return CHART.left + INNER_WIDTH / 2;
  return CHART.left + (index / (total - 1)) * INNER_WIDTH;
}

function yForPct(value: number) {
  return CHART.top + ((100 - value) / 100) * INNER_HEIGHT;
}

function buildPath(points: ChartPoint[]) {
  if (points.length === 0) return "";
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${xForIndex(index, points.length).toFixed(2)} ${yForPct(point.reservoirPct).toFixed(2)}`;
    })
    .join(" ");
}

function yearTicks(data: ChartPoint[]) {
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

function firstIndexForYear(data: ChartPoint[], year: number) {
  const index = data.findIndex((point) => point.year === year);
  return index === -1 ? data.length - 1 : index;
}

export function ReservoirChart({
  entries,
  scenario,
  height = 220,
}: {
  entries: HistoryEntry[];
  scenario: ScenarioId;
  height?: number;
}) {
  const data = useMemo(() => toChartPoints(entries), [entries]);
  const color = scenarios[scenario].color;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const path = useMemo(() => buildPath(data), [data]);
  const ticks = useMemo(() => yearTicks(data), [data]);
  const hoveredPoint =
    hoveredIndex === null ? undefined : (data[hoveredIndex] ?? undefined);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-[8px] border border-dashed border-border/70 bg-card/40 text-xs text-muted-foreground"
        style={{ height }}
      >
        Inicia la simulacion para ver la trayectoria
      </div>
    );
  }

  const redBandY = yForPct(PNR_THRESHOLD_PCT);
  const greenBandY = yForPct(100);
  const targetY = yForPct(TARGET_PCT);
  const hoveredX =
    hoveredIndex === null ? undefined : xForIndex(hoveredIndex, data.length);
  const hoveredY = hoveredPoint
    ? yForPct(hoveredPoint.reservoirPct)
    : undefined;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[8px] border border-border/70 bg-card/40"
      style={{ height }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg
        className="h-full w-full"
        role="img"
        aria-label="Trayectoria de reserva hidrica simulada"
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
        <rect
          x={CHART.left}
          y={greenBandY}
          width={INNER_WIDTH}
          height={targetY - greenBandY}
          fill="#22c55e"
          opacity="0.08"
        />
        <rect
          x={CHART.left}
          y={redBandY}
          width={INNER_WIDTH}
          height={VIEWBOX_HEIGHT - CHART.bottom - redBandY}
          fill="#ef4444"
          opacity="0.08"
        />

        {Y_TICKS.map((tick) => {
          const y = yForPct(tick);
          return (
            <g key={tick}>
              <line
                x1={CHART.left}
                x2={VIEWBOX_WIDTH - CHART.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-border/60"
                strokeWidth="1"
              />
              <text
                x={CHART.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {tick}
              </text>
            </g>
          );
        })}

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

        <line
          x1={CHART.left}
          x2={VIEWBOX_WIDTH - CHART.right}
          y1={redBandY}
          y2={redBandY}
          stroke="#ef4444"
          strokeDasharray="5 5"
          strokeWidth="1.5"
          opacity="0.75"
        />
        <line
          x1={CHART.left}
          x2={VIEWBOX_WIDTH - CHART.right}
          y1={targetY}
          y2={targetY}
          stroke="#22c55e"
          strokeDasharray="5 5"
          strokeWidth="1.5"
          opacity="0.75"
        />
        <text
          x={VIEWBOX_WIDTH - CHART.right - 4}
          y={redBandY - 6}
          textAnchor="end"
          className="fill-red-500 text-[10px]"
        >
          PNR {PNR_THRESHOLD_PCT}%
        </text>
        <text
          x={VIEWBOX_WIDTH - CHART.right - 4}
          y={targetY - 6}
          textAnchor="end"
          className="fill-green-500 text-[10px]"
        >
          Meta {TARGET_PCT}%
        </text>

        <path
          d={path}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />

        {data.map((point, index) =>
          point.pnrTriggered || point.collapse ? (
            <circle
              key={`${point.month}-${index}`}
              cx={xForIndex(index, data.length)}
              cy={yForPct(point.reservoirPct)}
              r={point.collapse ? 3.5 : 2.75}
              fill={point.collapse ? "#dc2626" : "#ef4444"}
            />
          ) : null,
        )}

        {hoveredPoint && hoveredX !== undefined && hoveredY !== undefined ? (
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
            <circle
              cx={hoveredX}
              cy={hoveredY}
              r="4"
              fill={color}
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
          </g>
        ) : null}
      </svg>

      {hoveredPoint && hoveredX !== undefined ? (
        <div
          className="pointer-events-none absolute top-2 rounded-[6px] border border-border/70 bg-background/95 px-2 py-1 text-[0.65rem] shadow-lg"
          style={{
            left: `${(hoveredX / VIEWBOX_WIDTH) * 100}%`,
            transform:
              hoveredX > VIEWBOX_WIDTH * 0.72
                ? "translateX(-100%)"
                : "translateX(6px)",
          }}
        >
          <div className="font-medium text-foreground">
            {hoveredPoint.yearLabel} · mes {hoveredPoint.month}
          </div>
          <div className="font-mono text-foreground tabular-nums">
            {hoveredPoint.reservoirPct.toFixed(1)}%
          </div>
          {hoveredPoint.pnrTriggered ? (
            <div className="text-red-500">PNR activado</div>
          ) : null}
          {hoveredPoint.collapse ? (
            <div className="text-red-600">Colapso</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
