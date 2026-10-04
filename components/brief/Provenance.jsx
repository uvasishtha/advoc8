import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Provenance: who wrote this line.
 *
 * The brief mixes two things that must never be confused when someone is
 * deciding what to say out loud. Some of it is the person speaking in their own
 * voice, and some of it is Advoc8 reading their record back to them. Only the
 * first is testimony. The second is bookkeeping, and reading bookkeeping as
 * testimony is how a person ends up in an appointment arguing for something the
 * app inferred rather than something they lived.
 *
 * So the distinction is carried visually, not just implied by wording: authored
 * content is accent-tinted, generated content is neutral.
 */
const SOURCES = {
  yours: {
    label: "Yours",
    Icon: Pencil,
    className: "border-accent-muted bg-accent-soft text-accent-strong",
  },
  record: {
    label: "From your entries",
    Icon: Eye,
    className: "border-border-strong bg-secondary-bg text-muted",
  },
  mixed: {
    label: "Yours and your record",
    Icon: null,
    className: "border-border-strong bg-secondary-bg text-muted",
  },
};

export const SOURCE_VALUES = Object.keys(SOURCES);

/**
 * @param {object} props
 * @param {"yours" | "record" | "mixed"} props.source
 */
export function ProvenanceTag({ source, className }) {
  const meta = SOURCES[source];
  if (!meta) return null;

  const { Icon } = meta;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      {Icon ? <Icon size={12} aria-hidden="true" /> : null}
      {meta.label}
    </span>
  );
}

/**
 * The key to the two tags, placed once at the top of the brief. Without it the
 * tags are decoration; with it, a reader can tell at a glance which claims are
 * theirs before deciding what to say.
 */
export function ProvenanceLegend({ className }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6", className)}>
      <p className="eyebrow">How to read this brief</p>
      <dl className="mt-3 space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <dt>
            <ProvenanceTag source="yours" />
          </dt>
          <dd className="hint min-w-[14rem] flex-1">
            You wrote this. It is the part a clinician hears in your own voice.
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <dt>
            <ProvenanceTag source="record" />
          </dt>
          <dd className="hint min-w-[14rem] flex-1">
            Advoc8 read this out of what you logged. It describes your record. It does not explain
            it.
          </dd>
        </div>
      </dl>
    </div>
  );
}
