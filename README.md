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

The brief is a page you read and edit before the appointment. It carries one chart — severity
over time, one point per logged day — and a **Print** button that builds a one-page Doctor Summary
from the same report and hands it to the browser's print dialog, rather than printing the app.

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

A first visit opens on the setup survey. **Skip for Now** loads Maya R's sample month of September
2026 tracking — which fills every section of the brief — and returns to the dashboard. From there,
**Settings → Open the sample brief** reloads the same sample at any time, and **Start a new profile**
wipes this browser back to the survey.

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
npm test        # analytics and safe language, onboarding rules, the AI prompt
                # and fallback layer, and the full survey -> log -> brief ->
                # questions -> practice journey
npm run lint
npm run build
```

---

## Stack

### What it runs on today

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, plain JSX — no TypeScript in the source |
| Styling | Tailwind CSS v4 with a CSS-first `@theme` in `app/globals.css`, `clsx` + `tailwind-merge`, lucide-react icons |
| Fonts | DM Sans and Newsreader, self-hosted at build time through `next/font/google` |
| State | One React context over three custom `localStorage` stores. No state library |
| Storage | Browser `localStorage` only. No database, no auth, no cookies |
| Analytics | Hand-written deterministic code in `lib/analytics/` — counts, means, medians, longest runs, rate comparisons. No ML, no statistics package |
| AI (optional) | Plain `fetch` to the Gemini `generateContent` API from two route handlers, `gemini-2.5-flash` by default |
| Charts | Recharts, for the severity-over-time line only |
| Tests | Vitest in a node environment: pure logic plus `renderToStaticMarkup`, no browser environment |
| Lint | ESLint 9 flat config with `eslint-config-next` |

`vite.config.mjs` exists only because `vitest.config.mjs` spreads it. It is not a second bundler.

### What we expect to move to

| Layer | Expected | Why |
| --- | --- | --- |
| Database | Supabase Postgres | `supabase/schema.sql` already defines the tables, with row level security and an own-row policy on each |
| Auth | Supabase Auth (magic link or OAuth) | Replaces the no-account model, and RLS means a person only ever reads their own rows |
| App | The same Next.js app | Server Components for reads, Server Actions for writes, `@supabase/ssr` for cookies |
| Migration seam | `lib/local-store.js` | Swapping `createLocalStore` for route handlers is the whole migration; nothing downstream of `DataProvider` changes |
| AI providers | One interface, swappable | `callGemini` is plain `fetch` behind a single signature, so the provider changes by swapping the endpoint and headers |
| Cohort analytics | A separate Python service (FastAPI) over a de-identified view | Likelihood estimates never sit in the app's own request path |
| Consent | A `consents` table recording what, when, and against which version | "May we use this for research" has to be revocable and auditable, not a line in a privacy policy |
| Hosting | Vercel plus Supabase, both under a BAA | Decides whether HIPAA is real or decorative, and has to be settled before a pilot rather than after |
| Tests | Vitest with Testing Library (jsdom), plus Playwright | Nothing in the current suite exercises a click |
| Language | TypeScript in strict mode, analytics layer first | A silently wrong number is the expensive failure here |

The model work is not the risky part of that list. Moving storage off the device is, and it is a
consent and contracts problem before it is an engineering one.

---

## A Note on Language

The analytics layer describes co-occurrence and never cause. Banned causal and diagnostic
phrasings are listed in `lib/analytics/language.js` and asserted against the brief in
`lib/analytics/analytics.test.js`.
