# Advoc8

### Turn “something feels wrong” into evidence.

Advoc8 is a medical advocacy tool designed for women who experience recurring or fluctuating symptoms that can be difficult to explain during a short medical appointment.

Instead of relying on memory, Advoc8 helps users **track symptoms, identify patterns in their own data, create an Evidence Brief, and practice communicating with their doctor.**

> Advoc8 does not diagnose conditions or provide medical treatment. It organizes and analyzes user-provided information to support better communication with healthcare providers.

---

## The Problem

It can be difficult to communicate a health concern when symptoms:

- happen inconsistently
- change in severity over time
- occur alongside other symptoms
- are affected by contextual factors like sleep or stress
- are difficult to remember accurately during an appointment

A patient may know that **“something has been getting worse,”** but not have a clear way to show what has changed.

Advoc8 turns that experience into an organized record.

---

## How It Works

### 01 — Track

Users log symptoms over time, including:

- Symptom
- Severity
- Duration
- Notes
- Sleep
- Stress
- Optional menstrual-cycle information

---

### 02 — Analyze

Advoc8 analyzes the user's longitudinal tracking data to identify measurable changes and recurring patterns.

Examples include:

- Symptom frequency
- Average severity
- Highest severity
- Changes over time
- Symptom co-occurrence
- Contextual co-occurrence

For example:

> Headaches appeared on 8 of the 10 days you logged fewer than 6 hours of sleep.

Advoc8 describes this as an **observed pattern**, not a medical cause.

---

### 03 — Build an Evidence Brief

Users can turn their tracking history into a structured **Advoc8 Evidence Brief**.

The brief includes:

1. **What I've Been Experiencing**
2. **Symptom Timeline**
3. **Quantitative Trends**
4. **Patterns in My Data**
5. **Measured Differences**
6. **Changes Over Time**
7. **What I Want My Doctor to Know**
8. **Questions I Want to Ask**
9. **Before My Appointment**

The brief can be downloaded as a PDF, or printed as a one-page Doctor Summary.

---

### 04 — Practice

After creating the Evidence Brief, users can practice communicating their experience with Advoc8's AI.

The AI can:

- simulate common appointment questions
- help users practice explaining their symptoms
- reference information from their Evidence Brief
- help organize questions for their appointment

The AI is used for **communication**, not diagnosis.

---

## Example

A user tracks headaches and fatigue for one month.

Advoc8 might identify:

```text
Headaches
14 / 30 days
Average severity: 6.2 / 10

Fatigue
18 / 30 days
Average severity: 5.8 / 10

Fatigue severity
First half: 4.1 / 10
Second half: 7.0 / 10
```

It could then surface:

> **Measured difference:** Headache was logged on 73% of the 11 days you recorded fewer than
> 6 hours of sleep, compared with 37% of the 19 other days you recorded sleep for.

Both figures come from the user's own entries. Advoc8 reports the size of the gap and stops
there — it does not claim that one produced the other.

---

## Getting Started

```bash
npm install
cp .env.example .env.local   # optional: only needed for the AI features
npm run dev
```

The app opens with **Open the sample brief** on the landing page, which loads Maya R's month of
September 2026 tracking so every section has data in it. You can also log your own entries
instead, or reset at any time from **Settings → Your data**.

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | no | Enables question generation and practice chat. |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.5-flash`. |

Both AI features degrade gracefully: without a key, questions are generated from the report's own
numbers and the practice rehearsal runs from a scripted script. Nothing breaks, but the responses
are templated rather than written by a model.

### Data

Entries are stored in `localStorage` in the browser. There is no account and no server. A schema
for a Postgres/Supabase backend is in `supabase/schema.sql`; it is not wired into the running app.

### Tests

```bash
npm test        # analytics, onboarding, doctor summary, and the full
                # survey -> log -> analysis -> report journey
npm run lint
npm run build
```

---

## A Note on Language

The analytics layer describes co-occurrence and never cause. Banned causal and diagnostic
phrasings are listed in `lib/analytics/language.js` and asserted against the deterministic
doctor summary in `lib/doctor-summary.test.js`.
