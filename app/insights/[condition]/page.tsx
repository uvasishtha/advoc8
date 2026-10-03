"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { mockConditions } from "@/lib/mockData";
import { notFound } from "next/navigation";

interface ConditionDetailPageProps {
  params: {
    condition: string;
  };
}

export default function ConditionDetailPage({
  params,
}: ConditionDetailPageProps) {
  const condition = mockConditions.find((c) => c.id === params.condition);

  if (!condition) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/insights"
          className="text-sm text-muted hover:text-foreground transition-colors mb-4 inline-block"
        >
          ← Back to insights
        </Link>
        <h1 className="font-serif text-4xl font-semibold mb-2">
          {condition.name}
        </h1>
        <Badge variant="accent">
          Information to discuss with your doctor
        </Badge>
      </div>

      <Disclaimer>
        This information is not a diagnosis. Only a qualified healthcare
        professional can diagnose a medical condition.
      </Disclaimer>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-4">
          Why this appeared
        </h2>
        <ul className="space-y-3">
          {condition.matchedSymptoms.map((symptom) => (
            <li key={symptom} className="flex items-center gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#65745C"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="font-medium">{symptom}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-4">
          What wasn&apos;t reported
        </h2>
        <ul className="space-y-3">
          {condition.unreportedSymptoms.map((symptom) => (
            <li key={symptom} className="flex items-center gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D8D4CC"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span className="text-muted">{symptom}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted mt-4 italic">
          Not reporting a symptom does not rule out a condition.
        </p>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-4">
          What doctors may consider
        </h2>
        <ul className="space-y-2 text-muted">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span>Medical history and physical examination</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span>Imaging such as ultrasound, if appropriate</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span>Other testing depending on symptoms</span>
          </li>
        </ul>
      </Card>

      <div>
        <h2 className="font-serif text-xl font-semibold mb-4">Sources</h2>
        <div className="space-y-3">
          {condition.sources.map((source) => (
            <Card key={source.title} padding="md">
              <div className="flex items-center justify-between">
                <span className="font-medium">{source.title}</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:text-accent-dark transition-colors"
                >
                  View source →
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
