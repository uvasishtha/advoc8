"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocationIcon, PencilIcon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import type { UserProfile } from "@/lib/types";

interface ProfileHeaderProps {
  user: UserProfile;
  isSaved: boolean;
  onEdit: () => void;
}

export function ProfileHeader({ user, isSaved, onEdit }: ProfileHeaderProps) {
  return (
    <Card padding="lg">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <Avatar name={user.name} src={user.avatarUrl} size={96} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="font-serif text-3xl font-semibold">{user.name}</h1>
            {isSaved && (
              <Badge variant="accent">Profile updated</Badge>
            )}
          </div>

          <p className="text-sm text-muted">
            @{user.username} · {user.email}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 mb-5">
            <Badge>{user.role}</Badge>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              <LocationIcon size={16} />
              {user.location}
            </span>
            <span className="text-sm text-muted">
              Member since {formatDate(user.memberSince)}
            </span>
          </div>

          {user.bio && (
            <p className="text-muted leading-relaxed max-w-2xl line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>

        <Button onClick={onEdit} className="self-start">
          <PencilIcon size={16} />
          Edit Profile
        </Button>
      </div>
    </Card>
  );
}
