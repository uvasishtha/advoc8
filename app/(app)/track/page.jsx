"use client";

import { useCallback, useMemo, useState } from "react";
import { History, NotebookPen, Trash2 } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/Notice";
import { SymptomForm } from "@/components/track/SymptomForm";
import { formatDate, formatDuration } from "@/lib/format";

/**
 * Track.
 *
 * Two jobs, so two tabs: write down what happened, and read back what you have
 * written. They used to share a page behind a modal, which meant the log you
 * were reading disappeared behind the form you were filling in.
 *
 * The form is a tab rather than a modal because an entry is ninety seconds of
 * work done in one sitting. A dialog makes it feel like a detour, and it closes
 * on save, which loses the thread if you are logging a whole week in one go.
 *
 * Nothing here is charted. The value of the record is that it is complete, and a
 * graph sitting next to the form is one more reason to stop mid-thought.
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

  const [tab, setTab] = useState("log");
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
        <Button onClick={() => setTab("log")}>
          <NotebookPen size={16} aria-hidden="true" />
          Log a symptom
        </Button>
      </header>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "log", label: "Log" },
          { id: "history", label: "History", count: symptomEntries.length },
        ]}
      />

      <div
        role="tabpanel"
        id="panel-log"
        aria-labelledby="tab-log"
        hidden={tab !== "log"}
        className="space-y-6"
      >
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

        <Card className="p-5 sm:p-6">
          <h2 className="font-serif text-xl font-semibold">Log an entry</h2>
          <p className="hint mt-1 max-w-prose">
            Everything here is optional except the day and the symptom. Notes are the part your
            brief cannot do without — what made it better or worse is the detail no severity number
            carries.
          </p>

          <div className="mt-5">
            <SymptomForm
              onSaveSymptom={handleSaveSymptom}
              onSaveContext={upsertContextEntry}
              existingContext={contextByDate.get(sorted[0]?.date)}
              showCycle={profile.tracksCycle}
            />
          </div>
        </Card>
      </div>

      <div
        role="tabpanel"
        id="panel-history"
        aria-labelledby="tab-history"
        hidden={tab !== "history"}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <History size={18} aria-hidden="true" />
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
            action={<Button onClick={() => setTab("log")}>Log a symptom</Button>}
          />
        )}
      </div>
    </PageContainer>
  );
}