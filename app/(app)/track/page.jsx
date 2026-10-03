"use client";

import { useMemo, useState } from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Notice";
import { SymptomForm } from "@/components/track/SymptomForm";
import { SeverityTrendChart, SymptomCalendar } from "@/components/charts/Charts";
import { formatDate, formatDuration } from "@/lib/format";

function TrackSkeleton() {
  return (
    <PageContainer className="space-y-6">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-96 w-full" />
    </PageContainer>
  );
}

export default function TrackPage() {
  const { isReady, report, symptomEntries, contextEntries, addSymptomEntry, upsertContextEntry, removeSymptomEntry } =
    useAdvoc8();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const contextByDate = useMemo(
    () => new Map(contextEntries.map((entry) => [entry.date, entry])),
    [contextEntries],
  );

  const sorted = useMemo(
    () => [...symptomEntries].sort((a, b) => b.date.localeCompare(a.date) || b.severity - a.severity),
    [symptomEntries],
  );

  const visible = useMemo(
    () => (filter === "all" ? sorted : sorted.filter((entry) => entry.symptom === filter)),
    [sorted, filter],
  );

  if (!isReady) return <TrackSkeleton />;

  function handleSaveSymptom(entry) {
    addSymptomEntry(entry);
    setIsFormOpen(false);
  }

  return (
    <PageContainer className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Track</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">Log what happened</h1>
          <p className="hint mt-1.5 max-w-prose">
            Small entries become patterns. Log the day, not just the symptom.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <NotebookPen size={16} aria-hidden="true" />
          Log a symptom
        </Button>
      </header>

      {report.isEmpty ? (
        <EmptyState
          icon={NotebookPen}
          title="Nothing tracked yet"
          description="Once you log entries, your timeline and charts fill in here."
          action={<Button onClick={() => setIsFormOpen(true)}>Log your first symptom</Button>}
        />
      ) : (
        <>
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold">Symptom calendar</h2>
                <p className="hint">One cell per day, shaded by the highest severity recorded.</p>
              </div>
              <Badge tone="outline">{report.range.label}</Badge>
            </div>
            <SymptomCalendar days={report.timeline} />
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-1 font-serif text-xl font-semibold">Severity over time</h2>
            <p className="hint mb-4">Days with no entry stay blank rather than being smoothed over.</p>
            <SeverityTrendChart
              series={report.symptoms.slice(0, 3).map((symptom) => ({
                name: symptom.name,
                points: symptom.dailySeries.map((day) => ({ date: day.date, value: day.severity })),
              }))}
              height={250}
            />
          </Card>
        </>
      )}

      <section aria-labelledby="entry-log">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="entry-log" className="font-serif text-xl font-semibold">
              Entry log
            </h2>
            <p className="hint">
              {visible.length} {visible.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <div>
            <label htmlFor="symptom-filter" className="sr-only">
              Filter entries by symptom
            </label>
            <select
              id="symptom-filter"
              className="select-field w-auto"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All symptoms</option>
              {report.symptoms.map((symptom) => (
                <option key={symptom.name} value={symptom.name}>
                  {symptom.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visible.length > 0 ? (
          <ul className="space-y-3">
            {visible.map((entry) => {
              const context = contextByDate.get(entry.date);
              return (
                <li key={entry.id}>
                  <Card className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{entry.symptom}</h3>
                          <Badge tone="outline">{formatDate(entry.date)}</Badge>
                        </div>
                        <p className="hint mt-1">
                          {formatDuration(entry.duration_minutes)}
                          {entry.impact ? ` · ${entry.impact.replace(/^\w/, (c) => c.toUpperCase())} impact` : ""}
                        </p>
                        {entry.notes ? (
                          <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-foreground">
                            {entry.notes}
                          </p>
                        ) : null}
                        {context ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {context.sleep_hours != null ? (
                              <Badge tone="default">{context.sleep_hours}h sleep</Badge>
                            ) : null}
                            {context.stress_level != null ? (
                              <Badge tone="default">Stress {context.stress_level}/5</Badge>
                            ) : null}
                            {context.cycle_day != null ? (
                              <Badge tone="default">Cycle day {context.cycle_day}</Badge>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-right">
                          <span className="block font-serif text-2xl font-semibold tabular-nums text-accent-strong">
                            {entry.severity}
                            <span className="text-xs font-sans font-normal text-muted"> / 10</span>
                          </span>
                          <span className="sr-only">Severity</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSymptomEntry(entry.id)}
                          className="rounded-full p-2 text-muted transition-colors hover:bg-warning-soft hover:text-warning"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          <span className="sr-only">
                            Delete {entry.symptom} entry from {formatDate(entry.date)}
                          </span>
                        </button>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={NotebookPen}
            title="No entries match"
            description={filter === "all" ? "Log a symptom to start building your record." : `Nothing logged for ${filter}.`}
            action={<Button onClick={() => setIsFormOpen(true)}>Log a symptom</Button>}
          />
        )}
      </section>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Log a symptom"
        description="Everything here is optional except the day and the symptom."
        size="lg"
      >
        <SymptomForm
          onSaveSymptom={handleSaveSymptom}
          onSaveContext={upsertContextEntry}
          existingContext={contextByDate.get(sortEntriesDescending(symptomEntries)[0]?.date)}
        />
      </Modal>
    </PageContainer>
  );
}

function sortEntriesDescending(entries) {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}