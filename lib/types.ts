export type SymptomEntry = {
  id: string;
  date: string;
  symptom: string;
  severity: number;
  location: string;
  painQuality: string;
  cycleDay?: number;
  impact: string;
  notes: string;
};

export type HealthProfile = {
  ageRange: string;
  previousDiagnoses: string[];
  previousSurgeries: string[];
  currentMedications: string[];
  familyHistory: string[];
  environmentalFactors: string[];
  symptoms: string[];
  symptomSeverity?: string;
  symptomFrequency?: string;
  symptomImpact?: string;
  region: string;
};

export type ConditionSuggestion = {
  id: string;
  name: string;
  summary: string;
  matchedSymptoms: string[];
  relevantFactors: string[];
  unreportedSymptoms: string[];
  sources: { title: string; url: string }[];
};

export type VisitEntry = {
  id: string;
  date: string;
  providerType: string;
  discussed: string;
  testsOrdered: string[];
  referrals: string[];
  followUpDate: string;
  notes: string;
  wantedDocumented: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};
