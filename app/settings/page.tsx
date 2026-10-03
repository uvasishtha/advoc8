"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockProfile } from "@/lib/mockData";

export default function SettingsPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">Settings</h1>
        <p className="text-muted">Manage your health profile and preferences.</p>
      </div>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-4">Health profile</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium">Age range</p>
              <p className="text-sm text-muted">{mockProfile.ageRange}</p>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium">Family history</p>
              <p className="text-sm text-muted">{mockProfile.familyHistory.length} factors recorded</p>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium">Environmental factors</p>
              <p className="text-sm text-muted">{mockProfile.environmentalFactors.length} factors recorded</p>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Symptoms</p>
              <p className="text-sm text-muted">{mockProfile.symptoms.length} symptoms recorded</p>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-4">Privacy</h2>
        <div className="p-4 bg-secondary-bg/30 border border-border rounded-lg mb-4">
          <p className="text-sm font-medium text-foreground mb-1">Your health information is designed to remain on your device.</p>
          <ul className="text-sm text-muted space-y-1 mt-2">
            <li>• No advertising SDKs</li>
            <li>• No analytics</li>
            <li>• No tracking</li>
          </ul>
        </div>
        <p className="text-sm text-muted">Can we use any data for women&apos;s health study reasons?</p>
        <div className="flex gap-3 mt-2">
          <Button variant="secondary" size="sm">Allow</Button>
          <Button variant="secondary" size="sm">Decline</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-4">Data</h2>
        <p className="text-sm text-muted mb-4">Permanently delete all your health information from this device.</p>
        <Button variant="secondary" className="border-warning text-warning hover:bg-warning/10" onClick={() => setIsDeleteModalOpen(true)}>Delete all my data</Button>
      </Card>

      <DeleteDataModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
    </div>
  );
}
