import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { PNR_THRESHOLD_PCT } from "@/src/lib/hydrosim/engine";
import { scenarios } from "@/src/lib/hydrosim/scenarios";
import type { ScenarioId } from "@/src/lib/hydrosim/types";
import type { HistoryEntry } from "@/src/lib/hydrosim/engine";

const TARGET_PCT = 60;
const START_YEAR = 2024;

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

function ReservoirTooltipBody({
  value,
  point,
}: {
  value: unknown;
  point: ChartPoint | undefined;
}) {
  const pct =
    typeof value === "number" ? value.toFixed(1) : String(value ?? "");
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono font-medium text-foreground tabular-nums">
        {pct}%
      </span>
      {point?.pnrTriggered ? (
        <span className="text-[0.65rem] text-red-500">PNR activado</span>
      ) : null}
      {point?.collapse ? (
        <span className="text-[0.65rem] text-red-600">Colapso</span>
      ) : null}
    </div>
  );
}

function reservoirTooltipFormatter(
  value: unknown,
  _name: unknown,
  item: unknown,
): React.ReactNode {
  const point = (item as { payload?: ChartPoint } | undefined)?.payload;
  return <ReservoirTooltipBody value={value} point={point} />;
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
  const yearTicks = useMemo(() => {
    if (data.length === 0) return [];
    const lastYear = data.at(-1)?.year ?? START_YEAR;
    const firstYear = data[0]?.year ?? START_YEAR;
    const ticks: number[] = [];
    for (let y = firstYear; y <= lastYear; y += 1) ticks.push(y);
    return ticks;
  }, [data]);

  const chartConfig: ChartConfig = useMemo(
    () => ({
      reservoirPct: {
        label: "Reserva",
        color: color,
      },
    }),
    [color],
  );

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

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid />
        <ReferenceArea
          y1={0}
          y2={PNR_THRESHOLD_PCT}
          fill="#ef4444"
          fillOpacity={0.08}
          ifOverflow="extendDomain"
        />
        <ReferenceArea
          y1={TARGET_PCT}
          y2={100}
          fill="#22c55e"
          fillOpacity={0.08}
          ifOverflow="extendDomain"
        />
        <XAxis
          dataKey="year"
          type="number"
          domain={[yearTicks[0] ?? START_YEAR, yearTicks.at(-1) ?? START_YEAR]}
          ticks={yearTicks}
          tickMargin={4}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 15, 30, 45, 60, 75, 90, 100]}
          width={28}
          tickFormatter={(v) => `${v}`}
        />
        <ReferenceLine
          y={PNR_THRESHOLD_PCT}
          stroke="#ef4444"
          strokeDasharray="4 4"
          strokeOpacity={0.7}
          label={{
            value: `PNR ${PNR_THRESHOLD_PCT}%`,
            position: "insideBottomRight",
            fontSize: 10,
            fill: "#ef4444",
          }}
        />
        <ReferenceLine
          y={TARGET_PCT}
          stroke="#22c55e"
          strokeDasharray="4 4"
          strokeOpacity={0.7}
          label={{
            value: `Meta ${TARGET_PCT}%`,
            position: "insideTopRight",
            fontSize: 10,
            fill: "#22c55e",
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload as ChartPoint | undefined;
                if (!item) return null;
                return `${item.yearLabel} · mes ${item.month}`;
              }}
              formatter={reservoirTooltipFormatter}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="reservoirPct"
          stroke="var(--color-reservoirPct)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}
