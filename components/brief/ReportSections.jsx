"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stat, StatGrid } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/Notice";
import { PatternCard } from "@/components/brief/PatternCard";
import {
  FrequencyChart,
  HalfComparisonChart,
  SeverityTrendChart,
  SleepChart,
  SymptomCalendar,
} from "@/components/charts/Charts";
import { formatDate, formatDuration, roundTo } from "@/lib/format";
import { CalendarRange } from "lucide-react";

/** 01 — What I've Been Experiencing */
export function OverviewSection({ report, user }) {
  const lead = report.symptoms[0];
  const firstLogged = report.symptoms
    .map((symptom) => symptom.firstSeen)
    .filter(Boolean)
    .sort()[0];

  return (
    <div className="space-y-5">
      <Card tone="soft" className="p-5 sm:p-6">
        <p className="eyebrow">My main concern</p>
        <p className="mt-1.5 font-serif text-xl leading-relaxed text-foreground">
          {user.concern}
        </p>
      </Card>

      <StatGrid>
        <Stat value={formatDate(firstLogged)} label="First entry logged" />
        <Stat
          value={report.range.daysLogged}
          unit="of"
          label={`Days reported across ${report.range.totalDays}`}
          hint={`Context recorded on ${report.range.daysWithContext} ${
            report.range.daysWithContext === 1 ? "day" : "days"
          }`}
        />
        <Stat
          value={report.symptoms.length}
          unit="tracked"
          label={report.symptoms.length === 1 ? "Symptom" : "Symptoms"}
          hint={report.symptoms
            .slice(0, 3)
            .map((symptom) => symptom.name)
            .join(", ")}
        />
        <Stat
          value={lead ? roundTo(lead.avgSeverity) : "—"}
          unit="/ 10"
          label={`Average ${lead ? lead.name.toLowerCase() : "severity"}`}
          hint={lead ? `Highest recorded ${lead.maxSeverity} / 10` : null}
          tone="accent"
        />
      </StatGrid>

      <Card className="p-5">
        <h3 className="font-semibold">Symptoms in this brief</h3>
        <ul className="mt-3 divide-y divide-border">
          {report.symptoms.map((symptom) => (
            <li key={symptom.name} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <span className="font-medium text-foreground">{symptom.name}</span>
              <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
                <Badge tone="outline">{symptom.daysReported} days</Badge>
                <Badge tone="outline">avg {roundTo(symptom.avgSeverity)}/10</Badge>
                <Badge tone="outline">max {symptom.maxSeverity}/10</Badge>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/** 02 — Symptom Timeline */
export function TimelineSection({ report }) {
  const days = report.timeline;
  const withEntries = days.filter((day) => day.entries.length > 0);

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <SymptomCalendar days={days} />
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold">Day by day</h3>
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
          {withEntries.map((day) => (
            <li key={day.date} className="rounded-lg bg-secondary-bg p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{formatDate(day.date)}</p>
                <p className="text-xs text-muted">
                  {day.context?.sleep_hours != null ? `${day.context.sleep_hours}h sleep` : null}
                  {day.context?.sleep_hours != null && day.context?.stress_level != null ? " · " : null}
                  {day.context?.stress_level != null ? `stress ${day.context.stress_level}/5` : null}
                </p>
              </div>
              <ul className="mt-1.5 space-y-1">
                {day.entries.map((entry) => (
                  <li key={entry.id} className="flex items-baseline gap-2 text-sm">
                    <span className="font-medium text-foreground">{entry.symptom}</span>
                    <span className="tabular-nums text-accent-strong">{entry.severity}/10</span>
                    <span className="text-muted">· {formatDuration(entry.duration_minutes)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/** 03 — Quantitative Trends */
export function TrendsSection({ report }) {
  const frequencyData = report.symptoms.map((symptom) => ({
    name: symptom.name,
    days: symptom.daysReported,
    totalDays: report.range.totalDays,
    percent: Math.round(symptom.frequencyRate * 100),
  }));

  const sleepData = report.timeline
    .filter((day) => day.context?.sleep_hours != null)
    .map((day) => ({ date: day.date, sleep: day.context.sleep_hours }));

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <h3 className="mb-1 font-serif text-lg font-semibold">How often each symptom was reported</h3>
        <p className="hint mb-4">Counted as days, not entries, so repeat logs do not inflate the total.</p>
        <FrequencyChart data={frequencyData} />
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-1 font-serif text-lg font-semibold">Severity summary</h3>
          <p className="hint mb-4">Average and highest severity for each symptom.</p>
          <ul className="space-y-3">
            {report.symptoms.map((symptom) => (
              <li key={symptom.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{symptom.name}</span>
                  <span className="text-sm tabular-nums text-muted">
                    {roundTo(symptom.avgSeverity)} avg · {symptom.maxSeverity} max
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary-bg">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(roundTo(symptom.avgSeverity) / 10) * 100}%` }}
                  />
                </div>
                <p className="hint mt-1">
                  {symptom.avgDurationMinutes != null
                    ? `Lasted about ${formatDuration(symptom.avgDurationMinutes)} on average`
                    : "No duration recorded"}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 font-serif text-lg font-semibold">Hours of sleep</h3>
          <p className="hint mb-4">
            Average {roundTo(report.context.averageSleep)}h · {report.context.lowSleepDays} days under
            6h
          </p>
          <SleepChart data={sleepData} height={200} />
        </Card>
      </div>
    </div>
  );
}

/** 04 — Patterns in My Data */
export function PatternsSection({ report }) {
  if (report.patterns.length === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="Not enough overlap yet"
        description="Patterns appear once a symptom and a context factor show up together on several days. Keep logging and this section will fill in."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {report.patterns.map((pattern) => (
          <PatternCard key={pattern.id} pattern={pattern} />
        ))}
      </div>

      {report.symptomPairs.length > 0 ? (
        <Card className="p-5">
          <h3 className="font-serif text-lg font-semibold">Symptoms that overlap</h3>
          <p className="hint mb-4">Symptoms recorded on the same days, counted from your own entries.</p>
          <ul className="space-y-2.5">
            {report.symptomPairs.map((pair) => (
              <li key={`${pair.left}-${pair.right}`} className="rounded-lg bg-secondary-bg p-3.5">
                <p className="text-sm leading-relaxed text-foreground">{pair.statement}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

/** 05 — Changes Over Time */
export function ChangesSection({ report }) {
  const comparable = report.symptoms.filter((symptom) => symptom.hasEnoughData);
  const comparisonData = comparable.map((symptom) => ({
    name: symptom.name,
    first: roundTo(symptom.halves.firstHalf.averageSeverity),
    second: roundTo(symptom.halves.secondHalf.averageSeverity),
  }));

  const trendTone = { increasing: "warning", decreasing: "success", steady: "default" };

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <h3 className="mb-1 font-serif text-lg font-semibold">First half compared with second half</h3>
        <p className="hint mb-4">
          {comparable[0]?.halves.firstHalf.startDate
            ? `${formatDate(comparable[0].halves.firstHalf.startDate)} – ${formatDate(comparable[0].halves.firstHalf.endDate)} against ${formatDate(comparable[0].halves.secondHalf.startDate)} – ${formatDate(comparable[0].halves.secondHalf.endDate)}`
            : null}
        </p>
        {comparisonData.length > 0 ? <HalfComparisonChart data={comparisonData} /> : null}
      </Card>

      <Card className="p-5 sm:p-6">
        <h3 className="mb-1 font-serif text-lg font-semibold">Week by week</h3>
        <p className="hint mb-4">Average severity in seven-day blocks.</p>
        <SeverityTrendChart
          series={comparable.slice(0, 3).map((symptom) => ({
            name: symptom.name,
            points: symptom.weeklySeries.map((bucket) => ({
              date: bucket.startDate,
              value: bucket.average == null ? null : roundTo(bucket.average),
            })),
          }))}
          height={230}
        />
      </Card>

      <Card className="p-5">
        <h3 className="font-serif text-lg font-semibold">What changed</h3>
        <ul className="mt-4 space-y-3">
          {comparable.map((symptom) => (
            <li key={symptom.name} className="rounded-lg border border-border p-4">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{symptom.name}</span>
                <Badge tone={trendTone[symptom.trend] ?? "default"}>
                  {symptom.trend === "not enough data"
                    ? "Not enough data"
                    : `${symptom.trend} (${symptom.halves.delta > 0 ? "+" : ""}${roundTo(symptom.halves.delta)})`}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted">{symptom.changeSentence}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}