"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useAdvoc8 } from "@/components/providers/DataProvider";
import { PageContainer } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField, TextArea, TextField } from "@/components/ui/Field";
import { Disclaimer } from "@/components/ui/Notice";
import {
  CYCLE_LENGTH_OPTIONS,
  CYCLE_RELEVANCE_OPTIONS,
  DAY_TO_DAY_OPTIONS,
  FIRST_NOTICED_OPTIONS,
  POSSIBLE_FACTOR_OPTIONS,
  SURVEY_SYMPTOM_OPTIONS,
  normaliseSurvey,
  validateSurvey,
} from "@/lib/onboarding";
import { todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";

const EMPTY_ANSWERS = {
  firstName: "",
  concern: "",
  firstNoticed: "",
  symptoms: [],
  otherSymptom: "",
  possibleFactors: [],
  otherFactor: "",
  dayToDay: "",
  doctorNote: "",
  cycleRelevance: "",
  tracksCycle: null,
  cycleLength: "",
  lastPeriodStart: "",
};

/**
 * The initial setup survey: five questions, an optional cycle block, and two
 * ways out. Every question here exists because the Evidence Brief or the
 * rehearsal is measurably better with the answer.
 *
 * Rendered in two places — in front of the app on a first visit, and at /setup
 * for anyone coming back to finish — so both entry points share this component.
 */
export function SetupSurvey() {
  const { completeOnboarding, skipOnboarding } = useAdvoc8();
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setAnswers((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  function toggleSymptom(name) {
    setAnswers((previous) => ({
      ...previous,
      symptoms: previous.symptoms.includes(name)
        ? previous.symptoms.filter((item) => item !== name)
        : [...previous.symptoms, name],
    }));
    setErrors((previous) => ({ ...previous, otherSymptom: undefined }));
  }

  function toggleCycleRelevance(value) {
    setAnswers((previous) => ({
      ...previous,
      cycleRelevance: previous.cycleRelevance === value ? "" : value,
      // Only an explicit yes keeps the cycle details. Anything else clears them,
      // so choosing "I'm not sure" cannot leave a stale date behind.
      cycleLength: value === "yes" ? previous.cycleLength : "",
      lastPeriodStart: value === "yes" ? previous.lastPeriodStart : "",
    }));
    setErrors((previous) => ({ ...previous, cycleLength: undefined, lastPeriodStart: undefined }));
  }

  const NOTHING_YET = "nothing-yet";

  function toggleFactor(value) {
    setAnswers((previous) => {
      const isOn = previous.possibleFactors.includes(value);

      if (value === NOTHING_YET) {
        return { ...previous, possibleFactors: isOn ? [] : [NOTHING_YET] };
      }

      // "Nothing I've noticed yet" is the absence of an observation, so it can
      // never sit in the list next to one.
      const withoutNothing = previous.possibleFactors.filter((item) => item !== NOTHING_YET);

      return {
        ...previous,
        possibleFactors: isOn
          ? withoutNothing
          : [...withoutNothing, value],
      };
    });

    setErrors((previous) => ({ ...previous, otherFactor: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateSurvey(answers);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    completeOnboarding(normaliseSurvey(answers));
  }

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <header>
        <p className="eyebrow">First-time setup</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
          Let&rsquo;s set up your profile
        </h1>
        <p className="hint mt-1.5 max-w-prose">
          Answer a few questions to give Advoc8 some context. You can update anything later or skip
          setup for now.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card className="p-5 sm:p-6">
          <TextField
            label="What should Advoc8 call you?"
            required
            value={answers.firstName}
            onChange={update("firstName")}
            error={errors.firstName}
            placeholder="Maya"
            autoComplete="given-name"
            maxLength={60}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <fieldset>
            <legend className="font-serif text-lg font-semibold">What&rsquo;s been going on?</legend>

            <div className="mt-4 space-y-5">
              <TextArea
                label="What has been going on?"
                required
                rows={3}
                value={answers.concern}
                onChange={update("concern")}
                error={errors.concern}
                placeholder="Headaches and fatigue have been showing up most days for the past month."
                hint="In your own words. This becomes the opening of your Evidence Brief."
              />

              <SelectField
                label="When did you first notice it?"
                value={answers.firstNoticed}
                onChange={update("firstNoticed")}
                error={errors.firstNoticed}
                options={[{ value: "", label: "Choose one" }, ...FIRST_NOTICED_OPTIONS]}
              />

              <div>
                <span className="label">What symptoms are you experiencing?</span>
                <div className="flex flex-wrap gap-2">
                  {SURVEY_SYMPTOM_OPTIONS.map((name) => {
                    const active = answers.symptoms.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleSymptom(name)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "border-accent-muted bg-accent-soft text-accent-strong"
                            : "border-border-strong text-muted hover:bg-secondary-bg hover:text-foreground",
                        )}
                      >
                        {active ? <Check size={14} aria-hidden="true" /> : null}
                        {name}
                      </button>
                    );
                  })}
                </div>
                {answers.symptoms.includes("Other") ? (
                  <div className="mt-3">
                    <TextField
                      label="Your wording for it"
                      value={answers.otherSymptom}
                      onChange={update("otherSymptom")}
                      error={errors.otherSymptom}
                      placeholder="e.g. Tingling in my left hand"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <span className="label">What have you noticed?</span>
                <p className="hint mb-2.5 max-w-prose">
                  Only choose things you&rsquo;ve personally noticed or want to keep an eye on.
                  Advoc8 does not assume they are causes.
                </p>
                <div className="flex flex-wrap gap-2">
                  {POSSIBLE_FACTOR_OPTIONS.map((option) => {
                    const active = answers.possibleFactors.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleFactor(option.value)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "border-accent-muted bg-accent-soft text-accent-strong"
                            : "border-border-strong text-muted hover:bg-secondary-bg hover:text-foreground",
                        )}
                      >
                        {active ? <Check size={14} aria-hidden="true" /> : null}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {answers.possibleFactors.includes("other") ? (
                  <div className="mt-3">
                    <TextField
                      label="Something else"
                      value={answers.otherFactor}
                      onChange={update("otherFactor")}
                      error={errors.otherFactor}
                      placeholder="e.g. Long flights"
                    />
                  </div>
                ) : null}
              </div>

              <SelectField
                label="How is this affecting your day-to-day life?"
                value={answers.dayToDay}
                onChange={update("dayToDay")}
                error={errors.dayToDay}
                options={[{ value: "", label: "Choose one" }, ...DAY_TO_DAY_OPTIONS]}
              />

              <TextArea
                label="What do you want your doctor to understand?"
                rows={3}
                value={answers.doctorNote}
                onChange={update("doctorNote")}
                placeholder="These symptoms have been getting worse rather than better."
                hint="This becomes section 06 of your brief. You can rewrite it there."
              />
            </div>
          </fieldset>
        </Card>

        <Card className="p-5 sm:p-6">
          <fieldset>
            <legend className="font-serif text-lg font-semibold">Could your menstrual cycle be relevant?</legend>
            <p className="hint mt-1 max-w-prose">
              Optional. If you notice symptoms changing around your cycle, Advoc8 can keep that
              context alongside your other tracking.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {CYCLE_RELEVANCE_OPTIONS.map((option) => {
                const active = answers.cycleRelevance === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCycleRelevance(option.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-accent-muted bg-accent-soft text-accent-strong"
                        : "border-border-strong text-muted hover:bg-secondary-bg hover:text-foreground",
                    )}
                  >
                    {active ? <Check size={14} aria-hidden="true" /> : null}
                    {option.label}
                  </button>
                );
              })}
            </div>

            {answers.cycleRelevance === "yes" ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Typical cycle length"
                  value={answers.cycleLength}
                  onChange={update("cycleLength")}
                  error={errors.cycleLength}
                  options={[{ value: "", label: "Choose one" }, ...CYCLE_LENGTH_OPTIONS]}
                />
                <TextField
                  label="First day of your last period"
                  type="date"
                  value={answers.lastPeriodStart}
                  max={todayIso()}
                  onChange={update("lastPeriodStart")}
                  error={errors.lastPeriodStart}
                />
              </div>
            ) : null}
          </fieldset>
        </Card>

        <div className="space-y-3 border-t border-border pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Complete Setup</Button>
            <Button type="button" variant="ghost" onClick={skipOnboarding}>
              Skip for Now
            </Button>
          </div>
          <p className="hint">
            Skipping keeps the Symptom Tracker open. Everything else stays locked until setup is
            done, and this reminder comes back.
          </p>
        </div>
      </form>

      <Disclaimer>
        Nothing here is a medical assessment. Advoc8 stores what you tell it so it can organise your
        own records.
      </Disclaimer>
    </PageContainer>
  );
}