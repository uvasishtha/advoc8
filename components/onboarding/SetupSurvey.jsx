"use client";

import { useState } from "react";
import { CalendarHeart, Check, ClipboardList, NotebookPen, Sparkle, UserRound } from "lucide-react";
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

const NOTHING_YET = "nothing-yet";

/** The three things this profile is for, shown before any question is asked. */
const HOW_IT_WORKS = [
  { icon: NotebookPen, title: "Track", text: "Log a symptom in a few seconds a day." },
  { icon: ClipboardList, title: "Prepare", text: "Get a brief written from your own entries." },
  { icon: Sparkle, title: "Practice", text: "Rehearse explaining it before you go in." },
];

/** Multi-select pill. `aria-pressed` carries the state, not just the colour. */
function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-accent-muted bg-accent-soft text-accent-strong"
          : "border-border-strong bg-surface text-muted hover:border-accent-muted hover:bg-secondary-bg hover:text-foreground",
      )}
    >
      {active ? <Check size={14} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/**
 * Single-choice group, drawn as cards instead of a dropdown.
 *
 * The options are short and there are only a handful, so showing all of them at
 * once beats a menu: the answer is visible instead of remembered, and there is
 * one click instead of two. Real radio inputs underneath, so the arrow keys and
 * the announced group name still work.
 */
function OptionCards({ name, legend, options, value, onChange, columns, error }) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>

      <div className={cn("grid gap-2", columns ?? "sm:grid-cols-2")}>
        {options.map((option) => {
          const active = value === option.value;

          return (
            <label key={option.value} className="relative block cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
                className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-xl opacity-0"
              />
              <span
                className={cn(
                  "flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium leading-snug transition-colors",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-strong",
                  active
                    ? "border-accent-muted bg-accent-soft text-accent-strong"
                    : "border-border-strong bg-surface text-foreground hover:border-accent-muted hover:bg-secondary-bg",
                )}
              >
                {option.label}
                <Check
                  size={15}
                  aria-hidden="true"
                  className={cn("shrink-0 text-accent-strong", active ? "opacity-100" : "opacity-0")}
                />
              </span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-warning">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/**
 * Card heading: an icon badge plus the question the card is asking.
 *
 * `as="legend"` turns the whole thing into the heading of a fieldset, so the two
 * question cards stay one semantic group. Everything inside is phrasing content
 * plus the heading itself, which is all a legend is allowed to hold.
 */
function CardHeading({ icon: Icon, title, description, as: Wrapper = "div" }) {
  return (
    <Wrapper className="flex items-start gap-3.5">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong"
      >
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <h2 className="font-serif text-lg font-semibold">{title}</h2>
        {description ? <span className="hint mt-0.5 block max-w-prose">{description}</span> : null}
      </span>
    </Wrapper>
  );
}

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
    <PageContainer className="max-w-3xl space-y-5">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-accent-soft blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-14 h-44 w-44 rounded-full bg-secondary-bg blur-3xl"
        />

        <div className="relative">
          <p className="eyebrow">First-time setup</p>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold sm:text-4xl">
            Let&rsquo;s set up your profile
          </h1>
          <p className="hint mt-2 max-w-prose">
            Answer a few questions to give Advoc8 some context. Nothing is held back while you
            decide, and you can change any answer later.
          </p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary-bg/70 p-3"
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-accent-strong"
                >
                  <item.icon size={14} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{item.title}</span>
                  <span className="hint block leading-snug">{item.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Card className="p-5 shadow-[0_12px_32px_-24px_rgba(36,28,34,0.45)] sm:p-6">
          <CardHeading
            icon={UserRound}
            title="First, who are we talking to?"
            description="Advoc8 greets you by name and puts it at the top of your Evidence Brief."
          />

          <div className="mt-5">
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
          </div>
        </Card>

        <Card className="p-5 shadow-[0_12px_32px_-24px_rgba(36,28,34,0.45)] sm:p-6">
          <fieldset>
            <CardHeading
              as="legend"
              icon={ClipboardList}
              title="What’s been going on?"
              description="This is the part that decides what gets tracked and what the brief looks like."
            />

            <div className="mt-5 space-y-6">
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

              <OptionCards
                name="firstNoticed"
                legend="When did you first notice it?"
                options={FIRST_NOTICED_OPTIONS}
                value={answers.firstNoticed}
                onChange={update("firstNoticed")}
                error={errors.firstNoticed}
              />

              <div>
                <span className="label">What symptoms are you experiencing?</span>
                <div className="flex flex-wrap gap-2">
                  {SURVEY_SYMPTOM_OPTIONS.map((name) => (
                    <Chip
                      key={name}
                      active={answers.symptoms.includes(name)}
                      onClick={() => toggleSymptom(name)}
                    >
                      {name}
                    </Chip>
                  ))}
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
                  {POSSIBLE_FACTOR_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      active={answers.possibleFactors.includes(option.value)}
                      onClick={() => toggleFactor(option.value)}
                    >
                      {option.label}
                    </Chip>
                  ))}
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

              <OptionCards
                name="dayToDay"
                legend="How is this affecting your day-to-day life?"
                options={DAY_TO_DAY_OPTIONS}
                value={answers.dayToDay}
                onChange={update("dayToDay")}
                error={errors.dayToDay}
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

        <Card className="p-5 shadow-[0_12px_32px_-24px_rgba(36,28,34,0.45)] sm:p-6">
          <fieldset>
            <CardHeading
              as="legend"
              icon={CalendarHeart}
              title="Could your menstrual cycle be relevant?"
              description="Optional. If you notice symptoms changing around your cycle, Advoc8 can keep that context alongside your other tracking."
            />

            <div className="mt-5">
              <OptionCards
                name="cycleRelevance"
                columns="sm:grid-cols-3"
                options={CYCLE_RELEVANCE_OPTIONS}
                value={answers.cycleRelevance}
                onChange={toggleCycleRelevance}
              />
            </div>

            {answers.cycleRelevance === "yes" ? (
              <div className="mt-5 grid gap-5 rounded-xl bg-secondary-bg p-4 sm:grid-cols-2">
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

        <div className="space-y-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg">
              Complete Setup
            </Button>
            <Button type="button" variant="ghost" onClick={skipOnboarding}>
              I&rsquo;ll do this later
            </Button>
          </div>
          <p className="hint max-w-prose">
            Come back to this whenever you like. The brief and the rehearsal are readable without
            it &mdash; an unfinished profile just leaves them emptier.
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
