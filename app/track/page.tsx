"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { mockSymptoms } from "@/lib/mockData";
import type { SymptomEntry } from "@/lib/types";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function TrackPage() {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>(mockSymptoms);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Your health record</h1>
          <p className="text-muted">Small entries over time can reveal patterns.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Log symptom</Button>
      </div>

      <div className="space-y-6">
        {symptoms.map((entry) => (
          <Card key={entry.id} padding="none">
            <div className="px-6 py-4 border-b border-border bg-secondary-bg/30">
              <time className="text-sm font-medium text-muted uppercase tracking-wider">{formatDate(entry.date)}</time>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold">{entry.symptom}</h3>
                  <p className="text-sm text-muted">{entry.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-semibold">{entry.severity}</span>
                  <span className="text-sm text-muted"> / 10</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Pain quality</p>
                  <p className="text-sm font-medium">{entry.painQuality}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Cycle day</p>
                  <p className="text-sm font-medium">{entry.cycleDay ? `Day ${entry.cycleDay}` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Daily impact</p>
                  <p className="text-sm font-medium">{entry.impact}</p>
                </div>
              </div>
              {entry.notes && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-foreground leading-relaxed">{entry.notes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-8 border-t border-border">
        <h2 className="font-serif text-xl font-semibold mb-4">Symptom severity over time</h2>
        <Card>
          <div className="h-64 w-full">
            <svg viewBox="0 0 600 200" className="w-full h-full">
              {symptoms.slice().sort((a, b) => a.date.localeCompare(b.date)).map((point, i, arr) => {
                const x = (i / (arr.length - 1 || 1)) * 580 + 10;
                const y = 180 - point.severity * 16;
                return <g key={i}><circle cx={x} cy={y} r="4" fill="#C98B8B" /><title>{`${point.symptom}: ${point.severity}/10`}</title></g>;
              })}
              <polyline fill="none" stroke="#C98B8B" strokeWidth="2" points={symptoms.slice().sort((a, b) => a.date.localeCompare(b.date)).map((point, i, arr) => {
                const x = (i / (arr.length - 1 || 1)) * 580 + 10;
                const y = 180 - point.severity * 16;
                return `${x},${y}`;
              }).join(" ")} />
            </svg>
          </div>
        </Card>
      </div>

      <SymptomFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(entry) => { setSymptoms((prev) => [entry, ...prev]); setIsModalOpen(false); }} />
    </div>
  );
}

function SymptomFormModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (entry: SymptomEntry) => void }) {
  const [formData, setFormData] = useState({ symptom: "", severity: "5", location: "", painQuality: "", date: new Date().toISOString().split("T")[0], cycleDay: "", impact: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: Date.now().toString(), date: formData.date, symptom: formData.symptom, severity: parseInt(formData.severity), location: formData.location, painQuality: formData.painQuality, cycleDay: formData.cycleDay ? parseInt(formData.cycleDay) : undefined, impact: formData.impact, notes: formData.notes });
    setFormData({ symptom: "", severity: "5", location: "", painQuality: "", date: new Date().toISOString().split("T")[0], cycleDay: "", impact: "", notes: "" });
  };

  return (
    <Modal isOpen={isModalOpen} onClose={onClose} title="Log a symptom" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Symptom</label>
          <input type="text" value={formData.symptom} onChange={(e) => setFormData((prev) => ({ ...prev, symptom: e.target.value }))} placeholder="e.g., Pelvic pain" className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Severity (0–10)</label>
          <div className="flex items-center gap-4">
            <input type="range" min="0" max="10" value={formData.severity} onChange={(e) => setFormData((prev) => ({ ...prev, severity: e.target.value }))} className="flex-1 accent-accent" />
            <span className="text-lg font-semibold w-8 text-center">{formData.severity}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input type="text" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} placeholder="e.g., Lower abdomen" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Pain quality</label>
          <input type="text" value={formData.painQuality} onChange={(e) => setFormData((prev) => ({ ...prev, painQuality: e.target.value }))} placeholder="e.g., Cramping, sharp, dull" className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cycle day (optional)</label>
            <input type="number" min="1" max="45" value={formData.cycleDay} onChange={(e) => setFormData((prev) => ({ ...prev, cycleDay: e.target.value }))} placeholder="e.g., 18" className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Impact on school/work</label>
          <select value={formData.impact} onChange={(e) => setFormData((prev) => ({ ...prev, impact: e.target.value }))} className="select-field">
            <option value="">Select impact level</option>
            <option value="Little/no impact">Little/no impact</option>
            <option value="Some impact">Some impact</option>
            <option value="Significant impact">Significant impact</option>
            <option value="Missed school">Missed school</option>
            <option value="Missed work">Missed work</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={4} placeholder="Describe what you experienced..." className="input-field resize-none" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save entry</Button>
        </div>
      </form>
    </Modal>
  );
}
