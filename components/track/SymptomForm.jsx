"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RangeField, SelectField, TextArea, TextField } from "@/components/ui/Field";
import { STRESS_OPTIONS, SYMPTOM_OPTIONS } from "@/lib/seed/maya";
import { todayIso } from "@/lib/format";

const DURATION_PRESETS = [
  { value: "30", label: "Under 30 minutes" },
  { value: "60", label: "About 1 hour" },
  { value: "120", label: "2 hours" },
  { value: "240", label: "4 hours" },
  { value: "480", label: "Most of the day" },
  { value: "720", label: "All day" },
];

const IMPACT_OPTIONS = [
  { value: "none", label: "Little or no impact" },
  { value: "some", label: "Some impact on my day" },
  { value: "significant", label: "Significant impact" },
  { value: "missed", label: "Missed school or work" },
];

const EMPTY = {
  symptom: "",
  customSymptom: "",
  date: todayIso(),
  severity: 5,
  duration: "120",
  notes: "",
  impact: "some",
  sleepHours: "7",
  stressLevel: "3",
  cycleDay: "",
  recordContext: true,
};

export function SymptomForm({ onSaveSymptom, onSaveContext, existingContext, showCycle = true }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const symptomName = form.symptom === "__custom" ? form.customSymptom.trim() : form.symptom;

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.symptom) nextErrors.symptom = "Choose a symptom, or add your own.";
    if (form.symptom === "__custom" && !form.customSymptom.trim()) {
      nextErrors.customSymptom = "Tell us what you want to track.";
    }
    if (!form.date) nextErrors.date = "Pick the day this happened.";

    const severity = Number(form.severity);
    if (Number.isNaN(severity) || severity < 1 || severity > 10) {
      nextErrors.severity = "Severity runs from 1 to 10.";
    }

    const duration = Number(form.duration);
    if (Number.isNaN(duration) || duration < 5 || duration > 1440) {
      nextErrors.duration = "Pick how long it lasted.";
    }

    const sleep = Number(form.sleepHours);
    if (form.recordContext && (Number.isNaN(sleep) || sleep < 0 || sleep > 24)) {
      nextErrors.sleepHours = "Enter hours between 0 and 24.";
    }

    const stress = Number(form.stressLevel);
    if (form.recordContext && (Number.isNaN(stress) || stress < 1 || stress > 5)) {
      nextErrors.stressLevel = "Stress runs from 1 to 5.";
    }

    const cycleDay = form.cycleDay === "" ? null : Number(form.cycleDay);
    if (cycleDay !== null && (Number.isNaN(cycleDay) || cycleDay < 1 || cycleDay > 45)) {
      nextErrors.cycleDay = "Cycle day runs from 1 to 45.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSaveSymptom({
      symptom: symptomName,
      date: form.date,
      severity,
      duration_minutes: duration,
      notes: form.notes.trim(),
      impact: form.impact,
    });

    if (form.recordContext) {
      onSaveContext({
        date: form.date,
        sleep_hours: Number(form.sleepHours),
        stress_level: Number(form.stressLevel),
        cycle_day: cycleDay,
        cycle_phase:
          cycleDay == null
            ? null
            : cycleDay <= 5
              ? "Menstrual"
              : cycleDay <= 13
                ? "Follicular"
                : cycleDay <= 17
                  ? "Ovulation"
                  : "Luteal",
      });
    }

    setForm((previous) => ({ ...EMPTY, date: previous.date, sleepHours: previous.sleepHours, stressLevel: previous.stressLevel, cycleDay: previous.cycleDay }));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Symptom"
          required
          value={form.symptom}
          onChange={update("symptom")}
          error={errors.symptom}
          hint="Pick the closest match, or add your own wording."
          options={[
            { value: "", label: "Choose a symptom" },
            ...SYMPTOM_OPTIONS.map((name) => ({ value: name, label: name })),
            { value: "__custom", label: "Something else…" },
          ]}
        />

        {form.symptom === "__custom" ? (
          <TextField
            label="Your wording for it"
            required
            value={form.customSymptom}
            onChange={update("customSymptom")}
            error={errors.customSymptom}
            placeholder="e.g. Tingling in my left hand"
          />
        ) : (
          <TextField
            label="Date"
            type="date"
            required
            value={form.date}
            max={todayIso()}
            onChange={update("date")}
            error={errors.date}
          />
        )}
      </div>

      {form.symptom === "__custom" ? (
        <TextField
          label="Date"
          type="date"
          required
          value={form.date}
          max={todayIso()}
          onChange={update("date")}
          error={errors.date}
        />
      ) : null}

      <RangeField
        label="Severity"
        value={form.severity}
        onChange={update("severity")}
        min={1}
        max={10}
        valueLabel={`${form.severity} / 10`}
        hint="Your own rating. There is no right number."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="How long did it last?"
          value={form.duration}
          onChange={update("duration")}
          error={errors.duration}
          options={DURATION_PRESETS}
        />
        <SelectField
          label="Impact on your day"
          value={form.impact}
          onChange={update("impact")}
          options={IMPACT_OPTIONS}
        />
      </div>

      <TextArea
        label="Notes"
        rows={3}
        value={form.notes}
        onChange={update("notes")}
        placeholder="What did it feel like? What were you doing? What helped?"
        hint="Specifics help more than adjectives here."
      />

      <fieldset className="rounded-xl border border-border bg-secondary-bg p-4">
        <legend className="px-1 text-sm font-medium">That day&rsquo;s context</legend>
        <p className="hint mb-4">
          Sleep, stress and cycle information is what turns a list into patterns. All of it is
          optional.
        </p>

        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            label="Hours of sleep"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={form.sleepHours}
            onChange={update("sleepHours")}
            error={errors.sleepHours}
            disabled={!form.recordContext}
          />
          <SelectField
            label="Stress level"
            value={form.stressLevel}
            onChange={update("stressLevel")}
            error={errors.stressLevel}
            disabled={!form.recordContext}
            options={STRESS_OPTIONS}
          />
          {showCycle ? (
            <TextField
              label="Cycle day (optional)"
              type="number"
              min="1"
              max="45"
              value={form.cycleDay}
              onChange={update("cycleDay")}
              error={errors.cycleDay}
              disabled={!form.recordContext}
              placeholder={existingContext?.cycle_day ? String(existingContext.cycle_day) : "e.g. 18"}
            />
          ) : null}
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.recordContext}
            onChange={update("recordContext")}
            className="h-4 w-4 accent-[#C4307F]"
          />
          Record sleep, stress and cycle for this day
        </label>
      </fieldset>

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button type="submit">Save entry</Button>
        <Button type="button" variant="ghost" onClick={() => setForm(EMPTY)}>
          Clear form
        </Button>
      </div>
    </form>
  );
}