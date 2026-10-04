"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DoctorSummary } from "@/components/brief/DoctorSummary";
import { buildDoctorSummary } from "@/lib/doctor-summary";
import { todayIso } from "@/lib/format";

/**
 * The Evidence Brief's Print button.
 *
 * It never prints the page you are looking at. On click it builds a one-page
 * Doctor Summary from the same report, draft and profile the brief is already
 * rendering, mounts that sheet into a print-only node on <body>, and opens the
 * browser's print dialog against it. The print stylesheet hides everything
 * else, so the only thing on paper is the summary.
 *
 * The node stays mounted after the dialog closes. That is deliberate: Safari
 * resolves print() asynchronously, so removing the sheet immediately can print a
 * blank page. On screen it is display:none, so it costs nothing.
 */
export function PrintDoctorSummaryButton({ report, user, draft, connections }) {
  const [request, setRequest] = useState(null);

  const handlePrint = () => {
    setRequest((current) => ({
      id: (current?.id ?? 0) + 1,
      summary: buildDoctorSummary({ report, user, draft, today: todayIso(), connections }),
    }));
  };

  useEffect(() => {
    if (!request) return undefined;

    let cancelled = false;
    let timer;

    // Wait for the brand fonts so the sheet never reflows mid-print onto a
    // fallback face.
    const fontsReady = document.fonts?.ready ?? Promise.resolve();

    fontsReady.then(() => {
      if (cancelled) return;

      // One frame for layout before the dialog snapshots the page.
      timer = window.setTimeout(() => {
        if (!cancelled) window.print();
      }, 50);
    });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [request]);

  return (
    <>
      <Button size="sm" variant="outline" onClick={handlePrint}>
        <Printer size={15} aria-hidden="true" />
        Print
      </Button>

      {request && typeof document !== "undefined"
        ? createPortal(
            <div data-print-root>
              <DoctorSummary summary={request.summary} />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}