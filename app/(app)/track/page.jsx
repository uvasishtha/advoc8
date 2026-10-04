"use client";

import { useCallback, useMemo, useState } from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Notice";
import { SymptomForm } from "@/components/track/SymptomForm";
import { formatDate, formatDuration } from "@/lib/format";

/**
 * Track.
 *
 * A log, not a dashboard. The only thing this page asks for is an entry, and
 * the only thing it shows back is what has been logged — because the value of
 * the record is that it is complete, and a chart sitting next to the form is
 * one more reason to stop mid-thought and go look at a graph.
 *
 * Every field except the day and the symptom is optional, and the form says so.
 */
export default function TrackPage() {
  const {
    isReady,
    report,
    symptomEntries,
    contextEntries,
    profile,
    addSymptomEntry,
    upsertContextEntry,
    removeSymptomEntry,
  } = useAdvoc8();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState(null);
  const dismissSaved = useCallback(() => setSaved(null), []);

  const contextByDate = useMemo(
    () => new Map(contextEntries.map((entry) => [entry.date, entry])),
    [contextEntries],
  );

  const sorted = useMemo(
    () =>
      [...symptomEntries].sort(
        (a, b) => b.date.localeCompare(a.date) || b.severity - a.severity,
      ),
    [symptomEntries],
  );

  const visible = useMemo(
    () => (filter === "all" ? sorted : sorted.filter((entry) => entry.symptom === filter)),
    [sorted, filter],
  );

  if (!isReady) return null;

  function handleSaveSymptom(entry) {
    addSymptomEntry(entry);
    setIsFormOpen(false);
    setSaved(entry);
  }

  return (
    <PageContainer className="max-w-3xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Track</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
            {report.isEmpty ? "Start your record" : "Your record"}
          </h1>
          <p className="hint mt-1.5 max-w-prose">
            {report.isEmpty
              ? "Log the day, not just the symptom. Sleep, stress and cycle information on the same day is what makes a pattern visible later."
              : `${report.range.entryCount} ${
                  report.range.entryCount === 1 ? "entry" : "entries"
                } · ${report.range.label}`}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <NotebookPen size={16} aria-hidden="true" />
          Log a symptom
        </Button>
      </header>

      {saved ? (
        <Card tone="soft" className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold">{saved.symptom}</span> logged for{" "}
            {formatDate(saved.date)}. That is the hard part.
          </p>
          <Button size="sm" variant="ghost" onClick={dismissSaved}>
            Dismiss
          </Button>
        </Card>
      ) : null}

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
                          {entry.impact
                            ? ` · ${entry.impact.replace(/^\w/, (c) => c.toUpperCase())} impact`
                            : null}
                        </p>
                        {entry.notes ? (
                          <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-foreground">
                            {entry.notes}
                          </p>
                        ) : (
                          <p className="mt-2.5 text-sm italic text-muted">
                            No note on this one — what made it better or worse is the detail your
                            brief is missing.
                          </p>
                        )}
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
                            <span className="text-xs font-sans font-normal text-muted">
                              {" "}
                              / 10
                            </span>
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
            title={filter === "all" ? "Nothing logged yet" : `Nothing logged for ${filter}`}
            description={
              filter === "all"
                ? "A fortnight of ordinary days is enough to start seeing something. Ninety seconds per entry."
                : "Try another filter, or log an entry for this symptom."
            }
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
          existingContext={contextByDate.get(sorted[0]?.date)}
          showCycle={profile.tracksCycle}
        />
      </Modal>
    </PageContainer>
  );
}