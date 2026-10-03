"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { mockConditions, mockSymptoms } from "@/lib/mockData";

export default function InsightsPage() {
  const allSymptoms = Array.from(new Set(mockSymptoms.map((s) => s.symptom)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-2">
          Patterns worth discussing
        </h1>
        <p className="text-muted">
          Advoc8 looks at your symptoms and health context alongside trusted medical
          information. It does not diagnose conditions.
        </p>
      </div>

      <Card className="bg-secondary-bg/50 border-accent/20">
        <h2 className="font-serif text-xl font-semibold mb-2">Your recent pattern</h2>
        <p className="text-muted mb-4">
          Pelvic pain, heavy periods, fatigue, and headaches have appeared together
          across several entries.
        </p>
        <p className="text-sm text-muted italic">
          This pattern may be worth discussing with your healthcare provider.
        </p>
      </Card>

      <div>
        <h2 className="font-serif text-xl font-semibold mb-4">
          Conditions worth asking your doctor about
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockConditions.map((condition) => (
            <Card key={condition.id}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold">
                  {condition.name}
                </h3>
                <Badge variant="accent">
                  {condition.matchedSymptoms.length} symptoms match
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">
                    Why it appeared
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {condition.matchedSymptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="px-2.5 py-1 bg-secondary-bg border border-border rounded-md text-xs font-medium"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">
                    Context
                  </p>
                  <p className="text-sm text-muted">{condition.relevantFactors[0]}</p>
                </div>
              </div>

              <Link href={`/insights/${condition.id}`}>
                <Button variant="secondary" className="w-full">
                  Explore →
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <Disclaimer>
        Advoc8 provides health information and pattern insights. It does not
        diagnose medical conditions. Only a qualified healthcare professional can
        diagnose a medical condition.
      </Disclaimer>
    </div>
  );
}
