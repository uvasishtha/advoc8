import type { SymptomEntry, HealthProfile, ConditionSuggestion, VisitEntry, ChecklistItem, UserProfile, ProfileActivity } from "./types";

export const mockProfile: HealthProfile = {
  ageRange: "18-24",
  previousDiagnoses: ["Anxiety"],
  previousSurgeries: ["Appendix removal (2021)"],
  currentMedications: ["Birth control", "Ibuprofen as needed"],
  familyHistory: ["Endometriosis", "Autoimmune condition"],
  environmentalFactors: ["High stress", "Air pollution exposure"],
  symptoms: ["Pelvic pain", "Abdominal pain", "Fatigue", "Headaches"],
  symptomSeverity: "Significant impact",
  symptomFrequency: "Weekly",
  symptomImpact: "Significant impact",
  region: "Northeast US",
};

export const mockSymptoms: SymptomEntry[] = [
  {
    id: "1",
    date: "2026-09-30",
    symptom: "Pelvic pain",
    severity: 7,
    location: "Lower abdomen",
    painQuality: "Cramping",
    cycleDay: 18,
    impact: "Missed class",
    notes: "Pain began in the morning and increased throughout the afternoon.",
  },
  {
    id: "2",
    date: "2026-09-28",
    symptom: "Heavy periods",
    severity: 6,
    location: "Pelvis",
    painQuality: "Dull ache",
    cycleDay: 16,
    impact: "Some impact",
    notes: "Bleeding lasted 7 days with clots.",
  },
  {
    id: "3",
    date: "2026-09-25",
    symptom: "Fatigue",
    severity: 5,
    location: "General",
    painQuality: "—",
    cycleDay: 13,
    impact: "Some impact",
    notes: "Felt tired after minimal activity.",
  },
  {
    id: "4",
    date: "2026-09-22",
    symptom: "Pelvic pain",
    severity: 8,
    location: "Lower abdomen",
    painQuality: "Sharp",
    cycleDay: 10,
    impact: "Missed work",
    notes: "Worst pain this month.",
  },
  {
    id: "5",
    date: "2026-09-18",
    symptom: "Headaches",
    severity: 4,
    location: "Temples",
    painQuality: "Throbbing",
    cycleDay: 6,
    impact: "Little/no impact",
    notes: "Took ibuprofen, improved after an hour.",
  },
  {
    id: "6",
    date: "2026-09-14",
    symptom: "Pelvic pain",
    severity: 6,
    location: "Lower abdomen",
    painQuality: "Cramping",
    cycleDay: 2,
    impact: "Some impact",
    notes: "Coincided with start of period.",
  },
];

export const mockConditions: ConditionSuggestion[] = [
  {
    id: "endometriosis",
    name: "Endometriosis",
    summary: "This pattern may be worth discussing with your healthcare provider.",
    matchedSymptoms: ["Pelvic pain", "Heavy periods", "Pain during sex", "Fatigue"],
    relevantFactors: ["Family history may provide additional context"],
    unreportedSymptoms: ["Digestive symptoms", "Lower back pain"],
    sources: [
      { title: "MedlinePlus", url: "https://medlineplus.gov" },
      { title: "National Library of Medicine", url: "https://nlm.nih.gov" },
      { title: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov" },
    ],
  },
  {
    id: "pcos",
    name: "PCOS",
    summary: "This pattern may be worth discussing with your healthcare provider.",
    matchedSymptoms: ["Irregular periods", "Heavy periods", "Fatigue", "Headaches"],
    relevantFactors: ["Family history may provide additional context"],
    unreportedSymptoms: ["Weight changes", "Hair growth changes"],
    sources: [
      { title: "MedlinePlus", url: "https://medlineplus.gov" },
      { title: "National Library of Medicine", url: "https://nlm.nih.gov" },
      { title: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov" },
    ],
  },
  {
    id: "iron-deficiency",
    name: "Iron deficiency",
    summary: "This pattern may be worth discussing with your healthcare provider.",
    matchedSymptoms: ["Fatigue", "Heavy periods", "Headaches"],
    relevantFactors: ["Menstrual blood loss may be relevant"],
    unreportedSymptoms: ["Shortness of breath", "Brittle nails"],
    sources: [
      { title: "MedlinePlus", url: "https://medlineplus.gov" },
      { title: "National Library of Medicine", url: "https://nlm.nih.gov" },
      { title: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov" },
    ],
  },
  {
    id: "migraine",
    name: "Migraine",
    summary: "This pattern may be worth discussing with your healthcare provider.",
    matchedSymptoms: ["Headaches", "Fatigue", "Nausea"],
    relevantFactors: ["Hormonal fluctuations may be relevant"],
    unreportedSymptoms: ["Sensitivity to light", "Aura"],
    sources: [
      { title: "MedlinePlus", url: "https://medlineplus.gov" },
      { title: "National Library of Medicine", url: "https://nlm.nih.gov" },
      { title: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov" },
    ],
  },
];

export const mockVisit: VisitEntry = {
  id: "1",
  date: "2026-09-10",
  providerType: "Primary care",
  discussed: "Discussed pelvic pain and cycle irregularities.",
  testsOrdered: ["Blood work"],
  referrals: ["Gynecologist"],
  followUpDate: "2026-10-10",
  notes: "Doctor suggested tracking symptoms for 2 more months.",
  wantedDocumented: "I want to make sure my pain severity is taken seriously.",
};

export const mockChecklist: ChecklistItem[] = [
  { id: "1", label: "Review my symptom timeline", completed: true },
  { id: "2", label: "Choose my most important symptoms", completed: true },
  { id: "3", label: "Review family history", completed: true },
  { id: "4", label: "Write down my questions", completed: false },
  { id: "5", label: "Bring my health summary", completed: false },
  { id: "6", label: "Add medications I'm taking", completed: false },
];

export const mockQuestions = [
  "What could be contributing to this pattern?",
  "What tests might help rule out possible causes?",
  "Should I see a specialist?",
  "What should I track before my next visit?",
];

export const mockUser: UserProfile = {
  id: "user-1",
  name: "Maya Ellison",
  username: "maya.e",
  email: "maya.ellison@example.com",
  phone: "+1 (617) 555-0142",
  role: "Public health research assistant",
  location: "Boston, MA",
  bio: "Public health student turning a symptom log into a record a doctor can act on. I track symptoms weekly, prepare questions before every appointment, and share what works.",
  memberSince: "2026-01-12",
  education: [
    {
      id: "edu-1",
      school: "University of Massachusetts Amherst",
      credential: "B.S. Public Health",
      period: "2023 — 2027",
    },
    {
      id: "edu-2",
      school: "Cambridge Rindge & Latin School",
      credential: "High School Diploma",
      period: "2019 — 2023",
    },
  ],
  experience: [
    {
      id: "exp-1",
      role: "Peer Health Advocate",
      organization: "Community Health Collective",
      period: "Jun 2025 — Present",
    },
    {
      id: "exp-2",
      role: "Research Assistant",
      organization: "Campus Health Access Lab",
      period: "Sep 2024 — May 2025",
    },
  ],
  skills: [
    "Patient advocacy",
    "Symptom tracking",
    "Health data analysis",
    "Public health research",
    "Medical terminology",
    "Report writing",
  ],
};

export const mockProfileActivity: ProfileActivity[] = [
  {
    id: "act-1",
    type: "symptom",
    title: "Logged pelvic pain",
    detail: "Severity 7 / 10, lower abdomen, missed class.",
    date: "2026-10-01",
  },
  {
    id: "act-2",
    type: "insight",
    title: "Reviewed the endometriosis pattern",
    detail: "Read the pattern summary and checked 3 sources.",
    date: "2026-09-29",
  },
  {
    id: "act-3",
    type: "report",
    title: "Prepared a health summary report",
    detail: "6 symptom entries and 2 questions for the gynecology referral.",
    date: "2026-09-27",
  },
  {
    id: "act-4",
    type: "visit",
    title: "Logged a doctor visit",
    detail: "Blood work ordered, referral to a gynecologist, follow-up booked for October 10.",
    date: "2026-09-26",
  },
  {
    id: "act-5",
    type: "symptom",
    title: "Logged heavy periods",
    detail: "Severity 6 / 10, bleeding lasted 7 days with clots.",
    date: "2026-09-25",
  },
  {
    id: "act-6",
    type: "profile",
    title: "Updated your health profile",
    detail: "Added birth control to current medications.",
    date: "2026-09-20",
  },
];
