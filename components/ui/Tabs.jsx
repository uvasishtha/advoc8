"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A two-or-three way segmented tab control.
 *
 * Built here rather than pulled from a library because it is the only tab set in
 * the app, and because Track genuinely needs one: logging and reviewing are
 * different jobs, and stacking them on one page meant either a long scroll or a
 * modal over the thing you were reading. A tab says "these are separate tasks"
 * without hiding either one behind a click.
 *
 * Follows the WAI-ARIA tabs pattern: arrow keys move between tabs, Home and End
 * jump to the ends, and only the active tab is in the tab order.
 *
 * @param {object} props
 * @param {string} props.value            Id of the active tab
 * @param {(id: string) => void} props.onChange
 * @param {Array<{id: string, label: string, count?: number}>} props.tabs
 */
export function Tabs({ value, onChange, tabs, className }) {
  const listRef = useRef(null);

  function focusTab(index) {
    const clamped = (index + tabs.length) % tabs.length;
    onChange(tabs[clamped].id);

    // The DOM moves focus with the selection, so keyboard users keep their place
    // instead of having to Tab forward past every tab they just skipped.
    listRef.current?.querySelectorAll("[role='tab']")[clamped]?.focus();
  }

  function onKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.id === value);

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(tabs.length - 1);
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn("inline-flex gap-1 rounded-full border border-border bg-secondary-bg p-1", className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === value;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  isActive ? "bg-accent-soft text-accent-strong" : "bg-border text-muted",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}