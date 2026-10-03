"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

function FieldShell({ id, label, hint, error, required, children, className }) {
  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="label">
        {label}
        {required ? (
          <span className="ml-0.5 text-accent-strong" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-warning">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="hint mt-1.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ label, hint, error, required, className, ...rest }) {
  const generated = useId();
  const id = rest.id ?? generated;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        className="input-field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        required={required}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextArea({ label, hint, error, required, className, ...rest }) {
  const generated = useId();
  const id = rest.id ?? generated;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        className="input-field resize-y leading-relaxed"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        required={required}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, required, options, className, children, ...rest }) {
  const generated = useId();
  const id = rest.id ?? generated;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        className="select-field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        required={required}
        {...rest}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    </FieldShell>
  );
}

export function RangeField({
  label,
  hint,
  value,
  min = 0,
  max = 10,
  step = 1,
  valueLabel,
  onChange,
  className,
}) {
  const generated = useId();
  const id = `range-${generated}`;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label mb-0">
          {label}
        </label>
        <span className="font-serif text-lg font-semibold tabular-nums text-foreground">
          {valueLabel ?? value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={`${value} out of ${max}`}
        className="w-full accent-[#C4307F]"
      />
      <div className="mt-1 flex justify-between text-xs text-subtle" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {hint ? <p className="hint mt-1.5">{hint}</p> : null}
    </div>
  );
}