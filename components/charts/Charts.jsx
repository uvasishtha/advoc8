"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, seriesColor } from "@/lib/chart-theme";
import { formatDate } from "@/lib/format";

const AXIS = {
  stroke: CHART_COLORS.axis,
  tick: { fill: CHART_COLORS.axis, fontSize: 12 },
  tickLine: false,
  axisLine: false,
};

function TooltipCard({ active, payload, label, formatter }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-[0_4px_16px_rgba(36,28,34,0.08)]">
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.dataKey ?? item.name} className="text-muted">
          {item.name}:{" "}
          <span className="font-medium text-foreground">{formatter(item)}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Severity over time, one line per symptom. Gaps stay gaps.
 *
 * `connectNulls={false}` is the important part: a day with nothing logged is a
 * day with nothing logged, and joining across it would draw a severity the user
 * never recorded. The chart is a picture of the record, not an interpolation of
 * it.
 */
export function SeverityTrendChart({ series, height = 260, showLegend = true }) {
  if (!series || series.length === 0) return null;

  const dates = series[0].points.map((point) => point.date);
  const data = dates.map((date, index) => {
    const row = { date };
    for (const entry of series) {
      row[entry.name] = entry.points[index]?.value ?? null;
    }
    return row;
  });

  return (
    <figure className="w-full">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="date"
              {...AXIS}
              tickFormatter={(value) => formatDate(value, { withYear: false })}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} {...AXIS} width={46} />
            <ReferenceLine y={5} stroke={CHART_COLORS.grid} />
            <Tooltip
              content={<TooltipCard formatter={(item) => `${item.value} / 10`} />}
              cursor={{ stroke: CHART_COLORS.grid }}
            />
            {series.map((entry, index) => (
              <Line
                key={entry.name}
                type="monotone"
                dataKey={entry.name}
                name={entry.name}
                stroke={seriesColor(index)}
                strokeWidth={2.25}
                dot={{ r: 2.5, strokeWidth: 0, fill: seriesColor(index) }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                legendType={showLegend ? "line" : "none"}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {showLegend ? (
        <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {series.map((entry, index) => (
            <span key={entry.name} className="flex items-center gap-1.5 text-xs text-muted">
              <span
                aria-hidden="true"
                className="h-0.5 w-4 rounded-full"
                style={{ background: seriesColor(index) }}
              />
              {entry.name}
            </span>
          ))}
        </figcaption>
      ) : null}
    </figure>
  );
}