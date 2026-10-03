"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BriefPdf } from "./pdf/BriefPdf";

export function DownloadBriefButton({ report, user, statement, questions, appointmentGoal }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleDownload() {
    setStatus("working");
    setError("");

    try {
      const blob = await pdf(
        <BriefPdf
          report={report}
          user={user}
          statement={statement}
          questions={questions}
          appointmentGoal={appointmentGoal}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `advoc8-evidence-brief-${report.range?.start ?? "export"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch (caught) {
      console.error(caught);
      setError("The PDF could not be generated. Try again, or use your browser to print this page.");
      setStatus("error");
    }
  }

  return (
    <div>
      <Button onClick={handleDownload} loading={status === "working"}>
        <Download size={16} aria-hidden="true" />
        {status === "working" ? "Preparing PDF" : "Download Evidence Brief"}
      </Button>

      {error ? (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-warning">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {status === "done" ? "Evidence Brief downloaded." : ""}
      </p>
    </div>
  );
}