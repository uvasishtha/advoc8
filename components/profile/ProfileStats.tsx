"use client";

import { Card } from "@/components/ui/Card";
import {
  ActivityIcon,
  CalendarIcon,
  FileTextIcon,
  TrendingUpIcon,
} from "@/components/ui/Icon";
import type { ProfileStat, ProfileStatIcon } from "@/lib/types";

const statIcons: Record<ProfileStatIcon, React.ReactNode> = {
  symptoms: <ActivityIcon size={18} />,
  affected: <CalendarIcon size={18} />,
  patterns: <TrendingUpIcon size={18} />,
  questions: <FileTextIcon size={18} />,
};

interface ProfileStatsProps {
  stats: ProfileStat[];
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <section aria-label="Profile statistics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} padding="md" className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent/10 text-accent-dark flex items-center justify-center">
              {statIcons[stat.icon]}
            </div>
            <p className="text-3xl font-serif font-semibold mb-1">{stat.value}</p>
            <p className="text-sm font-medium">{stat.label}</p>
            {stat.hint && <p className="text-xs text-muted mt-1">{stat.hint}</p>}
          </Card>
        ))}
      </div>
    </section>
  );
}
