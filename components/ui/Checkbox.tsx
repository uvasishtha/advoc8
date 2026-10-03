"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function Checkbox({ checked, onChange, className = "" }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        w-5 h-5 rounded border-2 flex items-center justify-center
        transition-colors flex-shrink-0
        ${
          checked
            ? "bg-accent border-accent text-white"
            : "border-border hover:border-accent"
        }
        ${className}
      `}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
