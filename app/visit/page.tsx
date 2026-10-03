"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { VisitModal } from "@/components/visit/VisitModal";
import { DeleteDataModal } from "@/components/settings/DeleteDataModal";
import { mockChecklist, mockQuestions, mockVisit } from "@/lib/mockData";
import type { ChecklistItem, VisitEntry } from "@/lib/types";

export default function VisitPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(mockChecklist);
  const [questions, setQuestions] = useState<string[]>(mockQuestions);
  const [newQuestion, setNewQuestion] = useState("");
  const [visit, setVisit] = useState<VisitEntry>(mockVisit);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions((prev) => [...prev, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const completedCount = checklist.filter((item) => item.completed).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">
          Prepare for your next visit.
        </h1>
        <p className="text-muted">
          Turn your health history into a clearer conversation.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-semibold">Appointment prep</h2>
          <span className="text-sm text-muted">
            {completedCount} of {checklist.length} complete
          </span>
        </div>

        <div className="space-y-3">
          {checklist.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-secondary-bg/30 transition-colors"
            >
              <Checkbox
                checked={item.completed}
                onChange={() => toggleChecklist(item.id)}
              />
              <span
                className={`text-sm font-medium ${
                  item.completed ? "line-through text-muted" : ""
                }`}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-4">
          Questions for my provider
        </h2>
        <ul className="space-y-3 mb-4">
          {questions.map((question, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-secondary-bg/30 rounded-md">
              <span className="text-accent mt-0.5">•</span>
              <span className="text-sm">{question}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Add a question..."
            className="input-field flex-1"
            onKeyDown={(e) => e.key === "Enter" && addQuestion()}
          />
          <Button onClick={addQuestion}>+ Add question</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-4">
          After your appointment
        </h2>
        <p className="text-sm text-muted mb-4">
          Document what happened during your visit so you can reference it later.
        </p>
        <Button onClick={() => setIsVisitModalOpen(true)}>
          Log my visit
        </Button>

        {visit && (
          <div className="mt-6 p-4 bg-secondary-bg/30 border border-border rounded-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(visit.date), "MMMM d, yyyy")}
                </p>
                <p className="text-xs text-muted">{visit.providerType}</p>
              </div>
            </div>
            <p className="text-sm text-muted mb-2">{visit.discussed}</p>
            {visit.testsOrdered.length > 0 && (
              <p className="text-sm text-muted">
                Tests ordered: {visit.testsOrdered.join(", ")}
              </p>
            )}
            {visit.followUpDate && (
              <p className="text-sm text-muted mt-2">
                Follow-up: {format(new Date(visit.followUpDate), "MMMM d, yyyy")}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-2">
          Was there anything you wanted documented?
        </h2>
        <p className="text-sm text-muted mb-4">
          Use this space to note anything that wasn&apos;t fully addressed.
        </p>
        <textarea
          value={visit.wantedDocumented}
          onChange={(e) =>
            setVisit((prev) => ({ ...prev, wantedDocumented: e.target.value }))
          }
          rows={4}
          placeholder="I want to make sure..."
          className="input-field resize-none"
        />
      </Card>

      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        visit={visit}
        onSave={setVisit}
      />

      <DeleteDataModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}

function format(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
