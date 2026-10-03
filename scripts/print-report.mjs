import { buildReport } from "@/lib/analytics";
import { MOCK_CONTEXT_ENTRIES, MOCK_SYMPTOM_ENTRIES } from "@/lib/seed/maya";

const report = buildReport({
  symptomEntries: MOCK_SYMPTOM_ENTRIES,
  contextEntries: MOCK_CONTEXT_ENTRIES,
});

const line = (text = "") => process.stdout.write(`${text}\n`);

line("HEADLINE " + JSON.stringify(report.headline));
line("RANGE    " + JSON.stringify(report.range));
line("CONTEXT  " + JSON.stringify(report.context));
line();
line(
  report.symptoms
    .map(
      (s) =>
        `${s.name.padEnd(13)} ${String(s.daysReported).padStart(2)}d  avg ${(s.avgSeverity ?? 0)
          .toFixed(1)
          .padStart(4)}  max ${String(s.maxSeverity).padStart(2)}  ${s.trend}  Δ${(
          s.halves.delta ?? 0
        ).toFixed(1)}`,
    )
    .join("\n"),
);
line();
line("PATTERNS");
for (const pattern of report.patterns) line(` - ${pattern.statement}`);
line();
line("CHANGES");
for (const symptom of report.symptoms) if (symptom.changeSentence) line(` - ${symptom.changeSentence}`);
line();
line("PAIRS");
for (const pair of report.symptomPairs) line(` - ${pair.statement}`);
line();
line("COVERAGE " + report.coverage);line();
line("COMPARISONS");
for (const c of report.comparisons) {
  line(` - [${c.symptom} x ${c.shortLabel}] strength=${c.strength.toFixed(2)}`);
  if (c.severitySentence) line(`     ${c.severitySentence}`);
  if (c.frequencySentence) line(`     ${c.frequencySentence}`);
}
