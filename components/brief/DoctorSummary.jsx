"use client";

/**
 * The printed sheet: one US Letter page, built for a clinician to scan in a few
 * seconds. It is never shown on screen — see PrintDoctorSummaryButton, which
 * mounts it into a print-only portal and hands it to the browser's print
 * dialog.
 *
 * Layout rules that keep it to one page:
 *   - Sections are capped upstream in lib/doctor-summary.js, not by clipping.
 *   - A section with nothing in it is not rendered at all.
 *   - Nothing here wraps or scrolls, so the sheet cannot grow a second page
 *     behind the reader's back.
 */

function SectionHeading({ number, title, note }) {
  return (
    <div className="mt-[5px] flex items-baseline gap-2 border-b border-[#D9D2D4] pb-[2px]">
      <span className="text-[7pt] font-semibold tracking-[0.1em] text-[#C4307F]">
        {number}
      </span>
      <h2 className="text-[7.5pt] font-semibold uppercase tracking-[0.13em] text-[#1B1B1B]">
        {title}
      </h2>
      {note ? <span className="ml-auto text-[6.5pt] text-[#55504F]">{note}</span> : null}
    </div>
  );
}

function Bullets({ items }) {
  return (
    <ul className="mt-[3px] space-y-[1.5px]">
      {items.map((item, index) => (
        <li key={index} className="flex gap-[6px] text-[8.5pt] leading-[1.28] text-[#1B1B1B]">
          <span aria-hidden="true" className="mt-[4px] h-[2px] w-[6px] shrink-0 bg-[#C4307F]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SymptomSnapshot({ snapshot }) {
  const { rows, descriptions, omitted, trackingDays } = snapshot;
  if (rows.length === 0) return null;

  return (
    <section>
      <SectionHeading
        number="2"
        title="Symptom Snapshot"
        note={
          trackingDays
            ? `Severity self-reported 1–10 · ${trackingDays} days tracked`
            : "Severity self-reported 1–10"
        }
      />
      <table className="mt-[3px] w-full border-collapse text-[8pt]">
        <thead>
          <tr className="text-left text-[6.5pt] uppercase leading-[1.15] tracking-[0.06em] text-[#55504F]">
            <th className="w-[25%] py-[2px] font-medium">Symptom</th>
            <th className="w-[11%] py-[2px] font-medium">Days recorded</th>
            <th className="w-[13%] py-[2px] font-medium">Average severity</th>
            <th className="w-[13%] py-[2px] font-medium">Highest severity</th>
            <th className="w-[22%] py-[2px] font-medium">Typical duration</th>
            <th className="w-[16%] py-[2px] font-medium">Last recorded</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-[#EBE6E7] align-top">
              <td className="py-[2.5px] font-medium text-[#1B1B1B]">{row.name}</td>
              <td className="py-[2.5px] tabular-nums text-[#1B1B1B]">
                {row.days}
                {row.trackingDays ? ` / ${row.trackingDays}` : ""}
              </td>
              <td className="py-[2.5px] tabular-nums text-[#1B1B1B]">{row.avgSeverity ?? "—"}</td>
              <td className="py-[2.5px] tabular-nums text-[#1B1B1B]">{row.maxSeverity ?? "—"}</td>
              <td className="py-[2.5px] text-[#55504F]">{row.duration ?? "—"}</td>
              <td className="py-[2.5px] text-[#55504F]">{row.lastSeen || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {omitted > 0 ? (
        <p className="mt-[2px] text-[7pt] italic text-[#55504F]">
          {omitted} further {omitted === 1 ? "symptom was" : "symptoms were"} also tracked in this
          period and {omitted === 1 ? "is" : "are"} not listed above.
        </p>
      ) : null}
      <Descriptions descriptions={descriptions} />
    </section>
  );
}

/**
 * What the symptom felt like, in the patient's own words.
 *
 * These are quotations, not findings, so they are set in italic after a plain
 * attribution and never merged into the numbers above them.
 */
function Descriptions({ descriptions }) {
  if (!descriptions || descriptions.length === 0) return null;

  return (
    <div className="mt-[4px]">
      <p className="text-[6.5pt] uppercase tracking-[0.08em] text-[#55504F]">
        How it felt, in the patient&rsquo;s words
      </p>
      <ul className="mt-[2px] space-y-[1.5px]">
        {descriptions.map((item) => (
          <li key={item.symptom} className="flex gap-[5px] text-[8pt] leading-[1.28] text-[#1B1B1B]">
            <span aria-hidden="true" className="mt-[4px] h-[2px] w-[5px] shrink-0 bg-[#C4307F]" />
            <span>
              <span className="font-semibold">{item.symptom}</span>
              {item.date ? <span className="text-[#55504F]"> · {item.date}</span> : null}
              <span className="italic"> — &ldquo;{item.note}&rdquo;</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContextTable({ rows }) {
  if (rows.length === 0) return null;

  return (
    <table className="mt-[3px] w-full border-collapse text-[8pt]">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-t border-[#EBE6E7] align-top">
            <th className="w-[27%] py-[2.5px] text-left font-medium text-[#55504F]">
              {row.label}
            </th>
            <td className="py-[2.5px] text-[#1B1B1B]">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * @param {object} props
 * @param {object} props.summary  Output of buildDoctorSummary().
 */
export function DoctorSummary({ summary }) {
  if (!summary) return null;

  const { header, concern, snapshot, trends, patterns, statement, questions, context } = summary;

  const hasContent =
    !summary.isEmpty &&
    ((snapshot?.rows?.length ?? 0) > 0 ||
      (snapshot?.descriptions?.length ?? 0) > 0 ||
      trends.length > 0 ||
      patterns.length > 0 ||
      statement.length > 0 ||
      questions.length > 0 ||
      context.length > 0 ||
      Boolean(concern));

  return (
    <article
      lang="en"
      className="w-full bg-white font-sans text-[8.5pt] leading-[1.35] text-[#1B1B1B]"
    >
      <header className="flex items-end justify-between gap-4 border-b-2 border-[#C4307F] pb-[4px]">
        <div>
          <p className="font-serif text-[15pt] font-semibold leading-none tracking-[-0.01em]">
            ADVOC8
          </p>
          <h1 className="mt-[5px] text-[10.5pt] font-semibold leading-none text-[#1B1B1B]">
            {header.title}
          </h1>
          <p className="mt-[2px] text-[7.5pt] italic text-[#55504F]">{header.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-[7.5pt] text-[#55504F]">Generated {header.generatedOn}</p>
          {header.patient ? (
            <p className="text-[7.5pt] text-[#55504F]">Patient: {header.patient}</p>
          ) : null}
        </div>
      </header>

      {!hasContent ? (
        <p className="mt-6 text-[8.5pt] text-[#55504F]">
          No symptom entries have been recorded yet, so there is nothing to summarise.
        </p>
      ) : (
        <>
          {header.meta ? (
            <p className="mt-[5px] text-[7.5pt] text-[#55504F]">{header.meta}</p>
          ) : null}

          {concern ? (
            <section className="mt-[5px]">
              <SectionHeading number="1" title="Main Concern" />
              <p className="mt-[3px] text-[9pt] leading-[1.35] text-[#1B1B1B]">{concern}</p>
            </section>
          ) : null}

          <SymptomSnapshot snapshot={snapshot} />

          {trends.length > 0 ? (
            <section className="mt-[5px]">
              <SectionHeading number="3" title="Key Trends" />
              <Bullets items={trends} />
            </section>
          ) : null}

          {patterns.length > 0 ? (
            <section className="mt-[5px]">
              <SectionHeading number="4" title="Observed Patterns" />
              <Bullets items={patterns} />
              <p className="mt-[2px] text-[6.5pt] italic text-[#55504F]">
                Co-occurrence within the patient&rsquo;s own records. Not a finding, and not evidence
                that one factor produced another.
              </p>
            </section>
          ) : null}

          {statement.length > 0 ? (
            <section className="mt-[5px]">
              <SectionHeading number="5" title="What I Want My Doctor to Know" />
              <Bullets items={statement} />
            </section>
          ) : null}

          {questions.length > 0 ? (
            <section className="mt-[5px]">
              <SectionHeading number="6" title="Questions for My Doctor" />
              <ol className="mt-[3px] space-y-[1.5px]">
                {questions.map((question, index) => (
                  <li
                    key={index}
                    className="flex gap-[6px] text-[8.5pt] leading-[1.28] text-[#1B1B1B]"
                  >
                    <span className="font-semibold tabular-nums text-[#C4307F]">{index + 1}.</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {context.length > 0 ? (
            <section className="mt-[5px]">
              <SectionHeading number="7" title="Relevant Context" />
              <ContextTable rows={context} />
            </section>
          ) : null}
        </>
      )}

      <footer className="mt-[6px] border-t border-[#D9D2D4] pt-[3px]">
        <p className="text-[6.5pt] leading-[1.3] text-[#55504F]">
          Patient-reported information. Advoc8 does not diagnose or provide medical treatment.
        </p>
      </footer>
    </article>
  );
}