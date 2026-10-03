"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockSymptoms, mockConditions, mockQuestions } from "@/lib/mockData";

export default function ReportPage() {
  const symptomCounts: Record<string, number> = {};
  mockSymptoms.forEach((s) => { symptomCounts[s.symptom] = (symptomCounts[s.symptom] || 0) + 1; });
  const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const daysAffected = mockSymptoms.filter((s) => s.impact !== "Little/no impact").length;
  const daysMissed = mockSymptoms.filter((s) => s.impact.includes("missed")).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">Your health summary</h1>
        <p className="text-muted">A concise record you can bring to a healthcare visit.</p>
      </div>

      <div className="flex items-center gap-4">
        <Button>Download report</Button>
        <Link href="/home"><Button variant="secondary">Back to home</Button></Link>
      </div>

      <Card className="border-2 border-border">
        <div className="text-center mb-8 pb-6 border-b border-border">
          <h2 className="font-serif text-2xl font-semibold mb-1">Advoc8 Health Summary</h2>
          <p className="text-sm text-muted">Generated on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Patient summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Date range</p>
                <p className="text-sm font-medium">{mockSymptoms[mockSymptoms.length - 1]?.date} — {mockSymptoms[0]?.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Symptoms logged</p>
                <p className="text-sm font-medium">{mockSymptoms.length} entries</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Unique symptoms</p>
                <p className="text-sm font-medium">{new Set(mockSymptoms.map((s) => s.symptom)).size}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Most reported symptoms</h3>
            <ul className="space-y-2">
              {sortedSymptoms.map(([symptom, count]) => (
                <li key={symptom} className="flex items-center justify-between p-3 bg-secondary-bg/30 rounded-md">
                  <span className="font-medium">{symptom}</span>
                  <span className="text-sm text-muted">{count} entries</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Daily life impact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary-bg/30 rounded-md">
                <p className="text-2xl font-serif font-semibold mb-1">{daysAffected}</p>
                <p className="text-sm text-muted">Days with impact</p>
              </div>
              <div className="p-4 bg-secondary-bg/30 rounded-md">
                <p className="text-2xl font-serif font-semibold mb-1">{daysMissed}</p>
                <p className="text-sm text-muted">Days missed school/work</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Patterns worth discussing</h3>
            <ul className="space-y-2">
              {mockConditions.slice(0, 3).map((condition) => (
                <li key={condition.id} className="flex items-center justify-between p-3 bg-secondary-bg/30 rounded-md">
                  <span className="font-medium">{condition.name}</span>
                  <Badge variant="accent">{condition.matchedSymptoms.length} symptoms match</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Questions for my provider</h3>
            <ul className="space-y-2">
              {mockQuestions.slice(0, 3).map((question, index) => (
                <li key={index} className="flex items-start gap-2 p-3 bg-secondary-bg/30 rounded-md">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-sm">{question}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted text-center">These are not diagnoses. This summary is intended to support conversation with a qualified healthcare professional.</p>
        </div>
      </Card>
    </div>
  );
}
