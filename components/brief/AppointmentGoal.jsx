"use client";

import { useState } from "react";
import { Check, Pencil, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";

/**
 * The anchor for the whole brief: what the person wants out of the
 * appointment.
 *
 * It sits at the top rather than the bottom because it changes how everything
 * below it reads. A list of symptoms is a complaint; a list of symptoms next to
 * "I want to understand whether further evaluation is needed" is a request, and
 * a clinician responds to the two differently.
 *
 * Every answer here is a question the person can legitimately ask. None of them
 * is a diagnosis, and none of them assumes what the clinician will find.
 */
export const APPOINTMENT_GOALS = Object.freeze([
  {
    id: "understand",
    label: "Understand what is happening",
    sentence: "I want to understand what is going on.",
  },
  {
    id: "evaluated",
    label: "Talk about whether further evaluation is needed",
    sentence: "I want to talk about whether further evaluation is needed.",
  },
  {
    id: "tracking",
    label: "Know what to track from now on",
    sentence: "I want to know what to keep tracking, and for how long.",
  },
  {
    id: "options",
    label: "Review what options are available",
    sentence: "I want to review the options available to me.",
  },
  {
    id: "taken",
    label: "Be taken seriously",
    sentence: "I want to make sure this is taken seriously.",
  },
]);

/**
 * @param {object} props
 * @param {string} props.value      The goal in the user's own words, if written
 * @param {string[]} props.selected Which of the prompts above they picked
 * @param {(ids: string[]) => void} props.onToggle
 * @param {(text: string) => void} props.onChange
 */
export function AppointmentGoal({ value, selected, onToggle, onChange }) {
  const [editing, setEditing] = useState(false);
  const [buffer, setBuffer] = useState(value);

  function save() {
    onChange(buffer.trim());
    setEditing(false);
  }

  return (
    <section
      aria-labelledby="appointment-goal"
      className="rounded-2xl border border-accent-muted bg-accent-soft/60 px-5 py-6 sm:px-7 sm:py-8"
    >
      <div className="flex items-start gap-3">
        <Target size={19} className="mt-1 shrink-0 text-accent-strong" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 id="appointment-goal" className="font-serif text-2xl font-semibold text-foreground">
            What I want from this appointment
          </h2>
          <p className="mt-1.5 max-w-prose leading-relaxed text-foreground">
            Tick what you are going in for, then say it in your own words. This sits at the top
            of your brief so the rest of it reads as a request rather than a list of symptoms.
          </p>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {APPOINTMENT_GOALS.map((goal) => {
              const isOn = selected.includes(goal.id);

              return (
                <li key={goal.id}>
                  <button
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => onToggle(goal.id)}
                    className={`flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm leading-snug transition-colors ${
                      isOn
                        ? "border-accent-strong bg-surface font-medium text-foreground"
                        : "border-accent-muted/60 bg-surface/60 text-muted hover:bg-surface"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isOn ? "border-accent-strong bg-accent-strong" : "border-border-strong"
                      }`}
                    >
                      {isOn ? <Check size={11} className="text-white" /> : null}
                    </span>
                    {goal.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            {editing ? (
              <div className="space-y-3">
                <TextArea
                  label="In your own words"
                  rows={4}
                  value={buffer}
                  onChange={(event) => setBuffer(event.target.value)}
                  hint="One or two sentences is enough. This is the line a clinician reads first."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={save}
                  >
                    <Check size={14} aria-hidden="true" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : value?.trim() ? (
              <div>
                <blockquote className="border-l-2 border-accent-strong pl-4 font-serif text-lg leading-relaxed text-foreground">
                  {value}
                </blockquote>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setBuffer(value);
                    setEditing(true);
                  }}
                >
                  <Pencil size={14} aria-hidden="true" />
                  Edit
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="soft" onClick={() => setEditing(true)}>
                <Pencil size={14} aria-hidden="true" />
                Write it in your own words
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}