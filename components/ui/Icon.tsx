interface IconProps {
  className?: string;
  size?: number;
}

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function PencilIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function LocationIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function MailIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function PhoneIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

export function BriefcaseIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export function GraduationIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M22 9 12 4 2 9l10 5Z" />
      <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
      <path d="M22 9v5" />
    </svg>
  );
}

export function SparklesIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="m12 3-1.9 5.1a2 2 0 0 1-1.2 1.2L3.8 11l5.1 1.9a2 2 0 0 1 1.2 1.2L12 19.2l1.9-5.1a2 2 0 0 1 1.2-1.2L20.2 11l-5.1-1.7a2 2 0 0 1-1.2-1.2Z" />
    </svg>
  );
}

export function UserIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function ActivityIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function CalendarIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function TrendingUpIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M16 7h6v6" />
      <path d="m22 7-8.5 8.5-5-5L2 17" />
    </svg>
  );
}

export function FileTextIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

export function CheckIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg {...ICON_PROPS} width={size} height={size} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
