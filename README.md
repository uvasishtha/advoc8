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

### 02 — Prepare

Tracking turns into a structured **Advoc8 Evidence Brief** at `/prepare`. The analysis is
deterministic and runs entirely on the user's own entries: frequency, average and highest severity,
episode duration, change across the period, which symptoms arrive together, and how symptoms line up
with logged sleep and stress.

For example:

> Headaches appeared on 8 of the 10 days you logged fewer than 6 hours of sleep.

Advoc8 describes this as an **observed pattern**, not a medical cause.

The brief includes:

1. **What I've Been Experiencing** — plain-language lines built from frequency, severity and duration
2. **What I've Noticed** — a short, ranked set of observations from your own record
3. **Make Sure I Mention** — the gaps in your record a clinician will otherwise have to ask about
4. **What I Want Them to Understand** — your own statement, editable in place
5. **Questions I Want to Ask** — generated from the brief, with a deterministic fallback

Nothing in the brief is charted, and there is no PDF or print export. The brief is a page you read
and edit before the appointment.

---

### 03 — Practice

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

It could then surface, under **What I've Noticed**:

> Headaches showed up on 8 of the 10 days you logged fewer than 6 hours of sleep, compared with
> 4 of the 20 other days you recorded sleep for.

Both figures come from the user's own entries. Advoc8 reports the size of the gap and stops
there — it does not claim that one produced the other.

---

## Getting Started

```bash
npm install
cp .env.example .env.local   # optional: only needed for the AI features
npm run dev
```

The app opens on **Home**. Use **Settings → Open the sample brief** to load Maya R's sample month of
September 2026 tracking, which fills every section of the brief, and **Start a new profile** to
wipe this browser back to empty at any time.

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | no | Enables question generation and practice chat. |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.5-flash`. |

Both AI features degrade gracefully: without a key, questions are generated from the report's own
numbers and the practice rehearsal runs from a scripted script. Nothing breaks, but the responses
are templated rather than written by a model.

### Data

Entries are stored in `localStorage` in the browser. There is no account and no server. An unused
Postgres schema is kept in `supabase/schema.sql` as a reference for a future backend; the app has
no Supabase client or other server dependency.

### Tests

```bash
npm test        # analytics and safe language, onboarding gates, the AI prompt
                # and fallback layer, and the full survey -> log -> brief ->
                # questions -> practice journey
npm run lint
npm run build
```

---

## A Note on Language

The analytics layer describes co-occurrence and never cause. Banned causal and diagnostic
phrasings are listed in `lib/analytics/language.js` and asserted against the brief in
`lib/analytics/analytics.test.js`.
