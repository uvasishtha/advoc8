"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDate, formatDuration, roundTo } from "@/lib/format";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, lineHeight: 1.5, color: "#241C22", fontFamily: "Helvetica" },
  header: { borderBottomWidth: 1, borderBottomColor: "#FFC2DD", paddingBottom: 12, marginBottom: 18 },
  brand: { fontSize: 9, letterSpacing: 1.6, color: "#C4307F", textTransform: "uppercase" },
  title: { fontSize: 20, marginTop: 4, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: "#6E6169", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionNumber: { fontSize: 8, letterSpacing: 1.2, color: "#C4307F", marginBottom: 2 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  rowLabel: { color: "#241C22" },
  rowValue: { color: "#6E6169" },
  bullet: { flexDirection: "row", marginBottom: 4 },
  bulletMark: { width: 12, color: "#C4307F" },
  bulletText: { flex: 1 },
  metric: { fontSize: 8, color: "#6E6169", marginTop: 2 },
  quote: {
    borderLeftWidth: 2,
    borderLeftColor: "#FF91BD",
    paddingLeft: 10,
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 10,
  },
  box: { backgroundColor: "#FBF2F6", borderRadius: 4, padding: 8, marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#F0E2EA",
    paddingTop: 8,
    fontSize: 8,
    color: "#6E6169",
  },
});

function Section({ number, title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionNumber}>{number}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Rows({ items }) {
  return items.map(([label, value]) => (
    <View style={styles.row} key={label}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  ));
}

export function BriefPdf({ report, user, statement, questions, appointmentGoal }) {
  const lead = report?.symptoms?.[0];

  return (
    <Document
      title={`Advoc8 Evidence Brief — ${report?.range?.label ?? ""}`}
      author="Advoc8"
      subject="Symptom tracking summary for a medical appointment"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Advoc8 — Evidence Brief</Text>
          <Text style={styles.title}>{user.displayName}</Text>
          <Text style={styles.meta}>
            {report?.range?.label} · {report?.range?.entryCount} entries · generated{" "}
            {formatDate(new Date().toISOString().slice(0, 10))}
          </Text>
        </View>

        <Section number="01" title="What I've Been Experiencing">
          <Text style={{ marginBottom: 8 }}>{user.concern}</Text>
          <Rows
            items={[
              ["First entry logged", report?.symptoms?.[0]?.firstSeen ? formatDate(report.symptoms[0].firstSeen) : "—"],
              ["Days reported", `${report?.range?.daysLogged} of ${report?.range?.totalDays}`],
              ["Days with sleep/stress recorded", String(report?.range?.daysWithContext ?? 0)],
              ["Symptoms tracked", String(report?.symptoms?.length ?? 0)],
              [
                `Average ${lead ? lead.name.toLowerCase() : "severity"}`,
                lead ? `${roundTo(lead.avgSeverity)} / 10 (highest ${lead.maxSeverity})` : "—",
              ],
            ]}
          />
          <View style={{ marginTop: 8 }}>
            {report?.symptoms?.map((symptom) => (
              <Text key={symptom.name} style={styles.bulletText}>
                • {symptom.name} — {symptom.daysReported} days, average {roundTo(symptom.avgSeverity)}/10
                , highest {symptom.maxSeverity}/10
                {symptom.avgDurationMinutes != null
                  ? `, usually lasting ${formatDuration(symptom.avgDurationMinutes)}`
                  : ""}
              </Text>
            ))}
          </View>
        </Section>

        <Section number="02" title="Symptom Timeline">
          <Rows
            items={[
              ["Period covered", report?.range?.label ?? "—"],
              [
                "Days with at least one symptom",
                String(report?.range?.daysLogged ?? 0),
              ],
              [
                "Context recorded",
                report?.context
                  ? `Average sleep ${roundTo(report.context.averageSleep)}h, average stress ${roundTo(
                      report.context.averageStress,
                    )}/5`
                  : "—",
              ],
            ]}
          />
        </Section>

        <Section number="03" title="Quantitative Trends">
          <Rows
            items={report?.symptoms?.flatMap((symptom) => [
              [`${symptom.name} — days reported`, `${symptom.daysReported} of ${report.range.totalDays}`],
              [`${symptom.name} — average severity`, `${roundTo(symptom.avgSeverity)} / 10`],
              [`${symptom.name} — highest severity`, `${symptom.maxSeverity} / 10`],
            ]) ?? []}
          />
        </Section>

        <Section number="04" title="Patterns in My Data">
          {report?.patterns?.length > 0 ? (
            report.patterns.map((pattern) => (
              <View key={pattern.id} style={styles.box}>
                <Text>{pattern.statement}</Text>
                <Text style={{ fontSize: 8, color: "#6E6169", marginTop: 2 }}>
                  {pattern.comparison} Not a causal finding.
                </Text>
              </View>
            ))
          ) : (
            <Text>Not enough overlapping days to show a pattern yet.</Text>
          )}
        </Section>

        <Section number="05" title="Measured Differences">
          {report?.comparisons?.length > 0 ? (
            report.comparisons.map((comparison) => (
              <View key={comparison.id} style={styles.box}>
                <Text>{comparison.headline}</Text>
                {comparison.hasSeverityData ? (
                  <Text style={styles.metric}>
                    Severity {roundTo(comparison.severityWithFactor.average)} / 10 on{" "}
                    {comparison.severityWithFactor.days} {comparison.shortLabel} days vs{" "}
                    {roundTo(comparison.severityOutsideFactor.average)} / 10 on{" "}
                    {comparison.severityOutsideFactor.days} other days
                  </Text>
                ) : null}
                {comparison.hasFrequencyData ? (
                  <Text style={styles.metric}>
                    Logged on {Math.round(comparison.factorRate * 100)}% of {comparison.daysWithFactor}{" "}
                    {comparison.shortLabel} days vs {Math.round(comparison.outsideRate * 100)}% of{" "}
                    {comparison.daysOutsideFactor} other days
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text>Not enough overlapping days to compare two groups yet.</Text>
          )}
        </Section>

        <Section number="06" title="Changes Over Time">
          {report?.symptoms
            ?.filter((symptom) => symptom.hasEnoughData)
            .map((symptom) => (
              <Text key={symptom.name} style={styles.bullet}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{symptom.changeSentence}</Text>
              </Text>
            ))}
        </Section>

        <Section number="07" title="What I Want My Doctor to Know">
          <Text style={styles.quote}>{statement}</Text>
        </Section>

        <Section number="08" title="Questions I Want to Ask">
          {(questions?.length > 0 ? questions : []).map((question, index) => (
            <Text key={question.id ?? index} style={styles.bullet}>
              <Text style={styles.bulletMark}>{index + 1}.</Text>
              <Text style={styles.bulletText}>{question.text}</Text>
            </Text>
          ))}
          {questions?.length === 0 ? <Text>No questions added yet.</Text> : null}
        </Section>

        <Section number="09" title="Before My Appointment">
          <Text style={{ marginBottom: 4 }}>My goal for this appointment:</Text>
          <Text style={styles.quote}>{appointmentGoal}</Text>
        </Section>

        <View style={styles.footer} fixed>
          <Text>
            This brief summarises entries logged by {user.displayName}. It is a record to read
            together, not a diagnosis. Advoc8 does not diagnose conditions or recommend treatment.
          </Text>
        </View>
      </Page>
    </Document>
  );
}