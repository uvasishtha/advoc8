"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileStats } from "@/components/profile/ProfileStats";
import {
  mockConditions,
  mockProfileActivity,
  mockQuestions,
  mockSymptoms,
  mockUser,
} from "@/lib/mockData";
import type { ProfileStat, UserProfile } from "@/lib/types";

const daysAffected = mockSymptoms.filter(
  (symptom) => symptom.impact !== "Little/no impact",
).length;

const profileStats: ProfileStat[] = [
  {
    id: "symptoms",
    label: "Symptoms logged",
    value: String(mockSymptoms.length),
    hint: "in the last 30 days",
    icon: "symptoms",
  },
  {
    id: "affected",
    label: "Days affected",
    value: String(daysAffected),
    hint: "with some impact",
    icon: "affected",
  },
  {
    id: "patterns",
    label: "Patterns reviewed",
    value: String(mockConditions.length),
    hint: "worth discussing",
    icon: "patterns",
  },
  {
    id: "questions",
    label: "Questions prepared",
    value: String(mockQuestions.length),
    hint: "for your next visit",
    icon: "questions",
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleEdit = () => {
    setIsSaved(false);
    setIsEditOpen(true);
  };

  const handleSave = (updated: UserProfile) => {
    setUser(updated);
    setIsEditOpen(false);
    setIsSaved(true);
  };

  return (
    <AppSidebar>
      <div className="space-y-8">
        <ProfileHeader user={user} isSaved={isSaved} onEdit={handleEdit} />

        <ProfileStats stats={profileStats} />

        <ProfileInfo user={user} />

        <ActivityFeed activity={mockProfileActivity} />

        <p className="text-xs text-muted">
          Private by design — your profile stays on your device.
        </p>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        user={user}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
      />
    </AppSidebar>
  );
}
