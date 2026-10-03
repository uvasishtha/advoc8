import type { SymptomEntry, HealthProfile, ConditionSuggestion, VisitEntry, ChecklistItem } from "./types";

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
