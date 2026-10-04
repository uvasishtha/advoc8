"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Sparkle, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TextArea, TextField } from "@/components/ui/Field";
import { MOCK_QUESTIONS } from "@/lib/seed/maya";
import { buildQuestionPrompt } from "@/lib/ai/prompts";

/** 04 — What I want to discuss */
export function StatementSection({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [buffer, setBuffer] = useState(value);

  function save() {
    onChange(buffer.trim());
    setEditing(false);
  }

  function cancel() {
    setBuffer(value);
    setEditing(false);
  }

  return (
    <Card tone="soft" className="p-5 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">In your own words</p>
          <h3 className="mt-1 font-serif text-xl font-semibold">What I want my doctor to know</h3>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={save}>
              <Check size={14} aria-hidden="true" />
              Save
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil size={14} aria-hidden="true" />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <TextArea
          label="Your statement"
          rows={5}
          value={buffer}
          onChange={(event) => setBuffer(event.target.value)}
          hint="A clinician reads this first. Say what you want them to understand."
        />
      ) : value?.trim() ? (
        <blockquote className="border-l-2 border-accent pl-4 font-serif text-lg leading-relaxed text-foreground">
          {value}
        </blockquote>
      ) : (
        <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm leading-relaxed text-muted">
          Nothing written here yet. Add the one thing you most want your doctor to understand —
          <span className="mt-1 block font-medium text-foreground">
            you can skip it in setup and add it whenever you are ready.
          </span>
        </p>
      )}
    </Card>
  );
}

/** 05 — Questions for my doctor */
export function QuestionsSection({ questions, onChange, report }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editBuffer, setEditBuffer] = useState("");

  function addQuestion(text, source = "manual") {
    const trimmed = text.trim();
    if (!trimmed) return;
    onChange([...questions, { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: trimmed, source }]);
  }

  function updateQuestion(id, text) {
    onChange(questions.map((question) => (question.id === id ? { ...question, text } : question)));
  }

  function removeQuestion(id) {
    onChange(questions.filter((question) => question.id !== id));
  }

  async function generate() {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
      });

      if (!response.ok) throw new Error("Request failed");

      const payload = await response.json();
      if (!payload.questions?.length) throw new Error("No questions returned");

      onChange(payload.questions);
    } catch {
      setError("Could not generate questions just now. You can still add your own below.");
    } finally {
      setIsGenerating(false);
    }
  }

  const list = questions.length > 0 ? questions : MOCK_QUESTIONS;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-semibold">Questions for my doctor</h3>
            <p className="hint mt-1 max-w-prose">
              Built from this brief, including the gaps it flagged. Ask about your records, never
              about a diagnosis.
            </p>
          </div>
          <Button size="sm" variant="soft" onClick={generate} loading={isGenerating}>
            {isGenerating ? <Wand2 size={14} className="animate-pulse" aria-hidden="true" /> : <Sparkle size={14} aria-hidden="true" />}
            Generate from my brief
          </Button>
        </div>

        {error ? (
          <p role="alert" className="mb-4 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
            {error}
          </p>
        ) : null}

        {questions.length === 0 ? (
          <p className="hint mb-4">
            These starter questions are here until you generate your own from your brief. Every one
            is editable.
          </p>
        ) : null}

        <ol className="space-y-2.5">
          {list.map((question, index) => (
            <li key={question.id} className="rounded-xl border border-border bg-surface p-3.5">
              {editingId === question.id ? (
                <div className="space-y-2.5">
                  <TextField
                    label={`Edit question ${index + 1}`}
                    value={editBuffer}
                    onChange={(event) => setEditBuffer(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateQuestion(question.id, editBuffer);
                        setEditingId(null);
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong"
                  >
                    {index + 1}
                  </span>
                  <p className="min-w-0 flex-1 text-[0.9375rem] leading-relaxed text-foreground">
                    {question.text}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(question.id);
                        setEditBuffer(question.text);
                      }}
                      className="rounded-full p-1.5 text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
                    >
                      <Pencil size={15} aria-hidden="true" />
                      <span className="sr-only">Edit question {index + 1}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="rounded-full p-1.5 text-muted transition-colors hover:bg-warning-soft hover:text-warning"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      <span className="sr-only">Delete question {index + 1}</span>
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            addQuestion(newQuestion);
            setNewQuestion("");
          }}
        >
          <TextField
            label="Add your own question"
            value={newQuestion}
            onChange={(event) => setNewQuestion(event.target.value)}
            placeholder="Is there anything I should stop doing before we meet again?"
            className="min-w-[16rem] flex-1"
          />
          <Button type="submit" variant="outline">
            <Plus size={16} aria-hidden="true" />
            Add question
          </Button>
        </form>
      </Card>

      <p className="hint flex items-start gap-2">
        <Badge tone="outline">Tip</Badge>
        Read these out loud once before the appointment. If it is hard to say, it is hard to answer.
      </p>
    </div>
  );
}