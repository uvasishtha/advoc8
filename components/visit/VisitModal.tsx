"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { mockVisit } from "@/lib/mockData";
import type { VisitEntry } from "@/lib/types";

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: VisitEntry;
  onSave: (visit: VisitEntry) => void;
}

export function VisitModal({ isOpen, onClose, visit, onSave }: VisitModalProps) {
  const [formData, setFormData] = useState<Partial<VisitEntry>>(visit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: visit.id,
      date: formData.date || "",
      providerType: formData.providerType || "",
      discussed: formData.discussed || "",
      testsOrdered: formData.testsOrdered || [],
      referrals: formData.referrals || [],
      followUpDate: formData.followUpDate || "",
      notes: formData.notes || "",
      wantedDocumented: formData.wantedDocumented || "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log my visit" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Provider type
            </label>
            <input
              type="text"
              value={formData.providerType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, providerType: e.target.value }))
              }
              placeholder="e.g., Primary care"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            What we discussed
          </label>
          <textarea
            value={formData.discussed}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, discussed: e.target.value }))
            }
            rows={3}
            placeholder="Key points from the conversation..."
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tests ordered
          </label>
          <input
            type="text"
            value={formData.testsOrdered?.join(", ")}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                testsOrdered: e.target.value.split(", ").filter(Boolean),
              }))
            }
            placeholder="Blood work, Ultrasound..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Referrals
          </label>
          <input
            type="text"
            value={formData.referrals?.join(", ")}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                referrals: e.target.value.split(", ").filter(Boolean),
              }))
            }
            placeholder="Specialist names..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Follow-up date
          </label>
          <input
            type="date"
            value={formData.followUpDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))
            }
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
            placeholder="Anything else..."
            className="input-field resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save visit</Button>
        </div>
      </form>
    </Modal>
  );
}
