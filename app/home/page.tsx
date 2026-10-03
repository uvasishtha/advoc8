"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockSymptoms, mockProfile } from "@/lib/mockData";

export default function HomePage() {
  const uniqueSymptoms = new Set(mockSymptoms.map((s) => s.symptom)).size;
  const avgSeverity = (mockSymptoms.reduce((sum, s) => sum + s.severity, 0) / mockSymptoms.length).toFixed(1);
  const daysAffected = mockSymptoms.filter((s) => s.impact !== "Little/no impact").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">Good morning, Maya.</h1>
        <p className="text-muted">Here&apos;s what you&apos;ve recorded recently.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <p className="text-3xl font-serif font-semibold mb-1">{uniqueSymptoms}</p>
          <p className="text-sm text-muted">Symptoms logged</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-3xl font-serif font-semibold mb-1">{avgSeverity}<span className="text-lg text-muted"> / 10</span></p>
          <p className="text-sm text-muted">Average severity</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-3xl font-serif font-semibold mb-1">{daysAffected}</p>
          <p className="text-sm text-muted">Days affected</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-3xl font-serif font-semibold mb-1">18</p>
          <p className="text-sm text-muted">Current cycle day</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/track"><Button>+ Log a symptom</Button></Link>
        <Link href="/track"><Button variant="secondary">View timeline</Button></Link>
        <Link href="/insights"><Button variant="secondary">Explore patterns</Button></Link>
        <Link href="/visit"><Button variant="secondary">Prepare for appointment</Button></Link>
      </div>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-2">Something worth paying attention to</h2>
        <p className="text-muted mb-4">Pelvic pain has appeared {mockSymptoms.filter((s) => s.symptom === "Pelvic pain").length} times in the last 30 days.</p>
        <p className="text-sm text-muted mb-4">See what this pattern may be worth discussing with your doctor.</p>
        <Link href="/insights"><Button>View insights →</Button></Link>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">Family history</h3>
          <p className="font-serif text-lg font-semibold mb-1">{mockProfile.familyHistory.length} factors recorded</p>
          <p className="text-sm text-muted">{mockProfile.familyHistory.join(", ")}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">Environment</h3>
          <p className="font-serif text-lg font-semibold mb-1">{mockProfile.environmentalFactors.length} factors recorded</p>
          <p className="text-sm text-muted">{mockProfile.environmentalFactors.join(", ")}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">Symptoms</h3>
          <p className="font-serif text-lg font-semibold mb-1">{mockSymptoms.length} entries</p>
          <p className="text-sm text-muted">{uniqueSymptoms} different symptoms tracked</p>
        </Card>
      </div>

      <div className="pt-6 border-t border-border">
        <Link href="/profile">
          <Button variant="secondary" className="w-full">
            View health profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
