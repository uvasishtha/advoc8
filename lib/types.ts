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

export type ProfileEducation = {
  id: string;
  school: string;
  credential: string;
  period: string;
};

export type ProfileExperience = {
  id: string;
  role: string;
  organization: string;
  period: string;
};

export type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  bio: string;
  avatarUrl?: string;
  memberSince: string;
  education: ProfileEducation[];
  experience: ProfileExperience[];
  skills: string[];
};

export type ProfileActivityType =
  | "symptom"
  | "insight"
  | "report"
  | "visit"
  | "profile";

export type ProfileActivity = {
  id: string;
  type: ProfileActivityType;
  title: string;
  detail: string;
  date: string;
};

export type ProfileStatIcon = "symptoms" | "affected" | "patterns" | "questions";

export type ProfileStat = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  icon: ProfileStatIcon;
};
