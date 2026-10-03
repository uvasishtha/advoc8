"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  BriefcaseIcon,
  GraduationIcon,
  LocationIcon,
  MailIcon,
  PhoneIcon,
  SparklesIcon,
  UserIcon,
} from "@/components/ui/Icon";
import type { UserProfile } from "@/lib/types";

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function SectionCard({ title, icon, className = "", children }: SectionCardProps) {
  return (
    <Card className={className}>
      <h2 className="flex items-center gap-2 text-sm font-medium text-muted uppercase tracking-wider mb-4">
        {icon}
        {title}
      </h2>
      {children}
    </Card>
  );
}

interface ProfileInfoProps {
  user: UserProfile;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <section aria-label="Profile information" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SectionCard
        title="About"
        icon={<UserIcon size={16} />}
        className="lg:col-span-2"
      >
        <p className="text-foreground leading-relaxed">
          {user.bio || "No bio added yet."}
        </p>
      </SectionCard>

      <SectionCard title="Contact" icon={<MailIcon size={16} />}>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <MailIcon size={16} className="text-muted flex-shrink-0" />
            <a
              href={`mailto:${user.email}`}
              className="text-sm text-accent hover:text-accent-dark transition-colors truncate"
            >
              {user.email}
            </a>
          </li>
          {user.phone && (
            <li className="flex items-center gap-3">
              <PhoneIcon size={16} className="text-muted flex-shrink-0" />
              <a
                href={`tel:${user.phone.replace(/\s/g, "")}`}
                className="text-sm text-accent hover:text-accent-dark transition-colors"
              >
                {user.phone}
              </a>
            </li>
          )}
          <li className="flex items-center gap-3">
            <UserIcon size={16} className="text-muted flex-shrink-0" />
            <span className="text-sm truncate">@{user.username}</span>
          </li>
          <li className="flex items-center gap-3">
            <LocationIcon size={16} className="text-muted flex-shrink-0" />
            <span className="text-sm truncate">{user.location}</span>
          </li>
        </ul>
      </SectionCard>

      <SectionCard title="Education" icon={<GraduationIcon size={16} />}>
        {user.education.length === 0 ? (
          <p className="text-sm text-muted italic">No education added yet.</p>
        ) : (
          <ul className="space-y-4">
            {user.education.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.school}</p>
                  {item.credential && (
                    <p className="text-sm text-muted">{item.credential}</p>
                  )}
                </div>
                <span className="text-xs text-muted whitespace-nowrap">
                  {item.period}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Experience"
        icon={<BriefcaseIcon size={16} />}
        className="lg:col-span-2"
      >
        {user.experience.length === 0 ? (
          <p className="text-sm text-muted italic">No experience added yet.</p>
        ) : (
          <ul className="space-y-4">
            {user.experience.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.role}</p>
                  {item.organization && (
                    <p className="text-sm text-muted">{item.organization}</p>
                  )}
                </div>
                <span className="text-xs text-muted whitespace-nowrap">
                  {item.period}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Skills & interests"
        icon={<SparklesIcon size={16} />}
        className="lg:col-span-3"
      >
        {user.skills.length === 0 ? (
          <p className="text-sm text-muted italic">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        )}
      </SectionCard>
    </section>
  );
}
