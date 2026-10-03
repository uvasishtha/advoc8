"use client";

import { Card } from "@/components/ui/Card";
import {
  ActivityIcon,
  CalendarIcon,
  FileTextIcon,
  TrendingUpIcon,
  UserIcon,
} from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import type { ProfileActivity, ProfileActivityType } from "@/lib/types";

const activityIcons: Record<ProfileActivityType, React.ReactNode> = {
  symptom: <ActivityIcon size={16} />,
  insight: <TrendingUpIcon size={16} />,
  report: <FileTextIcon size={16} />,
  visit: <CalendarIcon size={16} />,
  profile: <UserIcon size={16} />,
};

interface ActivityFeedProps {
  activity: ProfileActivity[];
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <section aria-label="Recent activity">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-semibold">Recent activity</h2>
          {activity.length > 0 && (
            <span className="text-xs text-muted">
              {activity.length} {activity.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {activity.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted">No activity yet.</p>
            <p className="text-sm text-muted italic mt-1">
              Logging symptoms and reviewing patterns will appear here.
            </p>
          </div>
        ) : (
          <ol className="relative border-l border-border ml-4 space-y-6">
            {activity.map((item) => (
              <li key={item.id} className="ml-8">
                <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary-bg text-accent-dark">
                  {activityIcons[item.type]}
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{item.title}</p>
                  <time className="text-xs text-muted">{formatDate(item.date)}</time>
                </div>
                <p className="text-sm text-muted mt-1">{item.detail}</p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </section>
  );
}
