/**
 * Advoc8 health fact bank
 * ------------------------
 * A local, offline collection of women's health facts shown while the app loads.
 *
 * How to add a fact: append an object to `HEALTH_FACTS` with a unique `id`.
 *
 *   {
 *     id: "some-slug",
 *     question: "Short question or headline shown as the prompt.",
 *     answer: "One or two plain-language sentences. Explain, never diagnose.",
 *     category: "Menstrual health",
 *     source: {
 *       organization: "ACOG",
 *       title: "Painful Periods",
 *       url: "https://www.acog.org/womens-health/faqs/painful-periods",
 *     },
 *   }
 *
 * Editorial rules for this file:
 * - Only use information published by a reputable medical organization
 *   (ACOG, CDC, WHO, NIH/NICHD, NHS, womenshealth.gov) and attribute it.
 * - Never state a statistic that is not published by the cited source.
 * - Never imply the app can diagnose, rule out, or treat a condition.
 * - Keep the tone calm and non-alarmist, and avoid scaring language.
 */

export interface HealthFactSource {
  /** Short organization name shown to the user, e.g. "ACOG". */
  organization: string;
  /** Page or article title the fact came from. */
  title?: string;
  /** Link to the original source. */
  url?: string;
}

export interface HealthFact {
  id: string;
  question: string;
  answer: string;
  category: string;
  source: HealthFactSource;
}

export const HEALTH_FACTS: HealthFact[] = [
  {
    id: "cycle-length",
    question: "How long is a typical menstrual cycle?",
    answer:
      "A cycle is counted from the first day of one period to the first day of the next. The average cycle is about 28 days, and cycles between 21 and 45 days are also considered normal.",
    category: "Menstrual health",
    source: {
      organization: "ACOG",
      title: "Your First Period",
      url: "https://www.acog.org/womens-health/faqs/your-first-period",
    },
  },
  {
    id: "period-pain-prevalence",
    question: "How common are menstrual symptoms that affect daily life?",
    answer:
      "Feeling pain before or during a period is very common. More than half of girls and women who have periods have some pain for one to two days each month. If it limits what you can do, it is reasonable to ask a clinician about it.",
    category: "Pain",
    source: {
      organization: "ACOG",
      title: "Painful Periods",
      url: "https://www.acog.org/womens-health/faqs/painful-periods",
    },
  },
  {
    id: "first-period-timing",
    question: "When do periods usually start?",
    answer:
      "Most girls start their periods between ages 12 and 13, usually about two to three years after breasts start growing. Cycles are often irregular for the first few years before settling into a pattern.",
    category: "Life stages",
    source: {
      organization: "ACOG",
      title: "Your First Period",
      url: "https://www.acog.org/womens-health/faqs/your-first-period",
    },
  },
  {
    id: "cycle-as-vital-sign",
    question: "Why does the menstrual cycle get called a vital sign?",
    answer:
      "Cycle length is one of the vital signs clinicians routinely ask about. A written record of the first day of bleeding, flow, and symptoms gives you and your provider something concrete to look at together.",
    category: "Menstrual health",
    source: {
      organization: "ACOG",
      title: "Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign",
      url: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/12/menstruation-in-girls-and-adolescents-using-the-menstrual-cycle-as-a-vital-sign",
    },
  },
  {
    id: "premenstrual-symptoms",
    question: "What are common premenstrual symptoms?",
    answer:
      "Common premenstrual symptoms include bloating, breast tenderness, headaches, fatigue, mood swings, and food cravings. They tend to build in the week before a period and ease once bleeding starts.",
    category: "Menstrual health",
    source: {
      organization: "ACOG",
      title: "Premenstrual Syndrome",
      url: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome",
    },
  },
  {
    id: "symptoms-change-over-time",
    question: "Can symptoms change from one cycle to the next?",
    answer:
      "Yes. Severity often shifts between cycles, and for many people symptoms are more noticeable during stressful or short-sleep weeks. Keeping a simple record of sleep, stress, and symptoms can make those shifts visible in your own data.",
    category: "Menstrual health",
    source: {
      organization: "ACOG",
      title: "Premenstrual Syndrome",
      url: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome",
    },
  },
  {
    id: "endometriosis-definition",
    question: "What is endometriosis?",
    answer:
      "Endometriosis is a condition in which tissue similar to the lining of the uterus grows outside the uterus, which can cause pain. Clinicians look at symptom history and an exam, and sometimes imaging or surgery, to understand it better.",
    category: "Endometriosis",
    source: {
      organization: "ACOG",
      title: "Endometriosis",
      url: "https://www.acog.org/womens-health/faqs/endometriosis",
    },
  },
  {
    id: "endometriosis-no-single-test",
    question: "Is there one test that confirms endometriosis?",
    answer:
      "There is no single test that definitively diagnoses endometriosis, so a clinician usually looks at symptoms over time alongside an exam. A symptom log is a useful part of that conversation.",
    category: "Endometriosis",
    source: {
      organization: "ACOG",
      title: "Endometriosis",
      url: "https://www.acog.org/womens-health/faqs/endometriosis",
    },
  },
  {
    id: "pcos-what-it-is",
    question: "What is PCOS?",
    answer:
      "Polycystic ovary syndrome (PCOS) is a common hormonal condition that can affect ovulation, hormone levels, and metabolism. Ovarian cysts are not required for it to be diagnosed.",
    category: "PCOS",
    source: {
      organization: "WHO",
      title: "Polycystic ovary syndrome",
      url: "https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome",
    },
  },
  {
    id: "pcos-how-common",
    question: "How common is PCOS?",
    answer:
      "PCOS affects an estimated 10\u201313% of reproductive-aged women, and up to 70% of people with PCOS worldwide do not know they have it. It is treatable, and management often includes lifestyle changes, medication, or both.",
    category: "PCOS",
    source: {
      organization: "WHO",
      title: "Polycystic ovary syndrome",
      url: "https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome",
    },
  },
  {
    id: "heavy-bleeding-signs",
    question: "When is menstrual bleeding considered heavy?",
    answer:
      "Signs include bleeding that lasts more than 7 days, soaking through a pad or tampon every hour for several hours in a row, needing to change pads during the night, or passing clots the size of a quarter or larger.",
    category: "Bleeding",
    source: {
      organization: "ACOG",
      title: "Heavy Menstrual Bleeding",
      url: "https://www.acog.org/womens-health/faqs/heavy-menstrual-bleeding",
    },
  },
  {
    id: "heavy-bleeding-and-iron",
    question: "Why might heavy periods leave me feeling tired?",
    answer:
      "Ongoing blood loss can lower iron levels, which is a common reason for fatigue. If periods feel heavy and you also feel unusually tired, short of breath, or dizzy, it is reasonable to ask about a blood test.",
    category: "Bleeding",
    source: {
      organization: "CDC",
      title: "About Heavy Menstrual Bleeding",
      url: "https://www.cdc.gov/female-blood-disorders/about/heavy-menstrual-bleeding.html",
    },
  },
  {
    id: "fibroids",
    question: "What are uterine fibroids?",
    answer:
      "Fibroids are noncancerous growths that develop in or on the uterus. They are very common and often cause no symptoms at all, though they can lead to heavy or painful periods for some people.",
    category: "Symptoms",
    source: {
      organization: "ACOG",
      title: "Fibroids",
      url: "https://www.acog.org/womens-health/faqs/fibroids",
    },
  },
  {
    id: "menopause-definition",
    question: "What actually defines menopause?",
    answer:
      "Menopause is the point at which a woman has not had a period for 12 consecutive months. The average age is about 51, though it can happen earlier or later.",
    category: "Life stages",
    source: {
      organization: "NIH (NICHD)",
      title: "About Menopause",
      url: "https://www.nichd.nih.gov/health/topics/menopause/conditioninfo",
    },
  },
  {
    id: "cervical-screening",
    question: "When is cervical cancer screening recommended?",
    answer:
      "CDC recommends cervical cancer screening for people ages 21 through 65. The tests and the intervals between them vary, so your clinician can confirm what applies to you.",
    category: "Prevention",
    source: {
      organization: "CDC",
      title: "Screening for Cervical Cancer",
      url: "https://www.cdc.gov/cancer/cervical/index.html",
    },
  },
  {
    id: "hpv-vaccine",
    question: "Who is the HPV vaccine recommended for?",
    answer:
      "CDC recommends HPV vaccination through age 26, and recommends discussing it through age 45. Vaccination tends to work best when it starts earlier, before exposure.",
    category: "Prevention",
    source: {
      organization: "CDC",
      title: "HPV Vaccination Recommendations",
      url: "https://www.cdc.gov/vaccines/vpd/hpv/hcp/recommendations.html",
    },
  },
];

/**
 * Timing for the loading experience.
 * These are defaults; each can be overridden per screen via LoadingScreen props.
 */
export const LOADING_CONFIG = {
  /** Full length of one 8 animation cycle. Lower = faster. */
  eightDurationMs: 6000,
  /** How long a fact stays on screen before it fades to the next one. */
  factRotationMs: 7000,
  /** Length of the fade between facts. */
  factFadeMs: 450,
} as const;
