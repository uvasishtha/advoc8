"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, SEVERITY_RAMP, seriesColor } from "@/lib/chart-theme";
import { formatDate, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

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

/** Severity over time, one line per symptom. Gaps stay gaps. */
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

/** Days reported per symptom. */
export function FrequencyChart({ data, height = 220 }) {
  if (!data || data.length === 0) return null;

  return (
    <figure className="w-full">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }} barSize={28}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="name" {...AXIS} />
            <YAxis allowDecimals={false} {...AXIS} width={40} />
            <Tooltip
              content={
                <TooltipCard
                  formatter={(item) =>
                    `${item.value} of ${item.payload.totalDays} days (${item.payload.percent}%)`
                  }
                />
              }
              cursor={{ fill: CHART_COLORS.grid }}
            />
            <Bar dataKey="days" name="Days reported" radius={[8, 8, 0, 0]}>
              {data.map((row, index) => (
                <Cell key={row.name} fill={seriesColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        Days each symptom was reported across the tracking period.
      </figcaption>
    </figure>
  );
}

/** First half versus second half, side by side. */
export function HalfComparisonChart({ data, height = 220 }) {
  if (!data || data.length === 0) return null;

  return (
    <figure className="w-full">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="name" {...AXIS} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} {...AXIS} width={40} />
            <Tooltip
              content={<TooltipCard formatter={(item) => `${item.value} / 10 average`} />}
              cursor={{ fill: CHART_COLORS.grid }}
            />
            <Bar
              dataKey="first"
              name="First half"
              fill={CHART_COLORS.primary}
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
            />
            <Bar
              dataKey="second"
              name="Second half"
              fill={CHART_COLORS.strong}
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <LegendSwatch color={CHART_COLORS.primary} label="First half of the period" />
        <LegendSwatch color={CHART_COLORS.strong} label="Second half of the period" />
      </figcaption>
    </figure>
  );
}

/** Hours of sleep per logged day. */
export function SleepChart({ data, height = 200 }) {
  if (!data || data.length === 0) return null;

  return (
    <figure className="w-full">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="date"
              {...AXIS}
              tickFormatter={(value) => formatDate(value, { withYear: false })}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis domain={[0, 10]} ticks={[0, 3, 6, 9]} {...AXIS} width={44} />
            <ReferenceLine y={6} stroke={CHART_COLORS.amber} strokeDasharray="4 4" />
            <Tooltip
              content={<TooltipCard formatter={(item) => `${item.value} hours`} />}
              cursor={{ fill: CHART_COLORS.grid }}
            />
            <Bar dataKey="sleep" name="Sleep" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 text-xs text-muted">
        The dashed line marks 6 hours, the threshold used when comparing sleep against symptoms.
      </figcaption>
    </figure>
  );
}

function LegendSwatch({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

/**
 * Calendar strip: one cell per day, shaded by the highest severity recorded.
 * This is the timeline in section 02.
 */
export function SymptomCalendar({ days, className }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const count = day.entries.length;
          const severity = count ? Math.max(...day.entries.map((entry) => entry.severity)) : 0;
          const fill = count === 0 ? "#FFFFFF" : SEVERITY_RAMP[Math.max(0, severity - 1)];
          const label = count
            ? `${formatDate(day.date)}: ${day.entries.map((entry) => `${entry.symptom} ${entry.severity} out of 10`).join(", ")}`
            : `${formatDate(day.date)}: nothing recorded`;

          return (
            <div
              key={day.date}
              title={label}
              className="flex aspect-square flex-col items-center justify-center rounded-lg border text-[0.6875rem] font-medium transition-transform hover:scale-105"
              style={{
                background: fill,
                borderColor: count === 0 ? CHART_COLORS.grid : fill,
                color: severity >= 7 && count > 0 ? "#FFFFFF" : CHART_COLORS.muted,
              }}
            >
              <span aria-hidden="true">{Number(day.date.slice(-2))}</span>
              <span className="sr-only">{label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <span className="text-xs text-muted">Lower</span>
        <div className="flex gap-0.5" aria-hidden="true">
          {["#FFFFFF", ...SEVERITY_RAMP].map((color) => (
            <span
              key={color}
              className="h-3 w-3 rounded-[3px] border"
              style={{ background: color, borderColor: CHART_COLORS.grid }}
            />
          ))}
        </div>
        <span className="text-xs text-muted">Higher</span>
      </div>
    </div>
  );
}

export { TooltipCard, LegendSwatch };