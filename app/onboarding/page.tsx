"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import type { HealthProfile } from "@/lib/types";

const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

const conditionOptions = [
  "Endometriosis",
  "PCOS",
  "Fibroids",
  "Adenomyosis",
  "Chronic pain",
  "Autoimmune condition",
  "Diabetes",
  "Thyroid condition",
  "Anxiety",
  "Depression",
  "None",
];

const surgeryOptions = [
  "Appendix removal",
  "Gallbladder removal",
  "C-section",
  "Hysterectomy",
  "Ovarian cyst removal",
  "Other",
  "None",
];

const familyHistoryOptions = [
  "Endometriosis",
  "PCOS",
  "Autoimmune conditions",
  "Diabetes",
  "Heart conditions",
  "Certain cancers",
  "Other",
  "None known",
  "I'm not sure",
];

const environmentOptions = [
  "Air pollution exposure",
  "Secondhand smoke",
  "Workplace / chemical exposure",
  "High stress",
  "Irregular sleep",
  "Limited physical activity",
  "Other",
  "None / unsure",
];

const symptomOptions = [
  "Pelvic pain",
  "Abdominal pain",
  "Fatigue",
  "Headaches",
  "Heavy periods",
  "Irregular periods",
  "Digestive symptoms",
  "Pain during sex",
  "Mood changes",
  "Other",
];

const severityOptions = ["Occasional", "Monthly", "Weekly", "Daily"];
const impactOptions = [
  "Little/no impact",
  "Some impact",
  "Significant impact",
  "Causes me to miss school/work",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<HealthProfile>>({
    ageRange: "",
    previousDiagnoses: [],
    previousSurgeries: [],
    currentMedications: [],
    familyHistory: [],
    environmentalFactors: [],
    symptoms: [],
    region: "",
  });
  const [newMedication, setNewMedication] = useState("");

  const toggleArrayItem = (field: keyof HealthProfile, value: string) => {
    setProfile((prev) => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setProfile((prev) => ({
        ...prev,
        currentMedications: [...(prev.currentMedications || []), newMedication.trim()],
      }));
      setNewMedication("");
    }
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleComplete = () => {
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12">
          <ProgressIndicator current={step} total={4} />
        </div>

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold mb-2">
                Let&apos;s build your health profile.
              </h1>
              <p className="text-muted">
                A little context helps us understand your health patterns over time.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Age range</label>
                <div className="grid grid-cols-3 gap-2">
                  {ageRanges.map((age) => (
                    <button
                      key={age}
                      onClick={() =>
                        setProfile((prev) => ({ ...prev, ageRange: age }))
                      }
                      className={`
                        px-4 py-2.5 rounded-md border text-sm font-medium
                        transition-colors
                        ${
                          profile.ageRange === age
                            ? "bg-accent text-white border-accent"
                            : "border-border hover:bg-secondary-bg"
                        }
                      `}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Previous diagnoses
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {conditionOptions.map((condition) => (
                    <button
                      key={condition}
                      onClick={() =>
                        toggleArrayItem("previousDiagnoses", condition)
                      }
                      className={`
                        px-4 py-2.5 rounded-md border text-sm font-medium
                        transition-colors text-left
                        ${
                          profile.previousDiagnoses?.includes(condition)
                            ? "bg-accent/10 text-accent-dark border-accent/20"
                            : "border-border hover:bg-secondary-bg"
                        }
                      `}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Previous surgeries
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {surgeryOptions.map((surgery) => (
                    <button
                      key={surgery}
                      onClick={() =>
                        toggleArrayItem("previousSurgeries", surgery)
                      }
                      className={`
                        px-4 py-2.5 rounded-md border text-sm font-medium
                        transition-colors text-left
                        ${
                          profile.previousSurgeries?.includes(surgery)
                            ? "bg-accent/10 text-accent-dark border-accent/20"
                            : "border-border hover:bg-secondary-bg"
                        }
                      `}
                    >
                      {surgery}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Current medications
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add a medication..."
                    className="input-field flex-1"
                    onKeyDown={(e) => e.key === "Enter" && addMedication()}
                  />
                  <Button type="button" onClick={addMedication}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.currentMedications?.map((med) => (
                    <span
                      key={med}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-bg border border-border rounded-full text-sm"
                    >
                      {med}
                      <button
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            currentMedications: prev.currentMedications?.filter(
                              (m) => m !== med
                            ),
                          }))
                        }
                        className="text-muted hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={next}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold mb-2">
                Health can run in families.
              </h1>
              <p className="text-muted">
                Family history can provide useful context when looking at health patterns.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {familyHistoryOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleArrayItem("familyHistory", item)}
                  className={`
                    px-4 py-3 rounded-md border text-sm font-medium
                    transition-colors text-left
                    ${
                      profile.familyHistory?.includes(item)
                        ? "bg-accent/10 text-accent-dark border-accent/20"
                        : "border-border hover:bg-secondary-bg"
                    }
                  `}
                >
                  {item}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted italic">
              Not sure? That&apos;s okay. You can update this later.
            </p>

            <div className="bg-secondary-bg border border-border rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-1">
                Your information stays yours.
              </p>
              <p className="text-sm text-muted">
                This information is stored locally on your device.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={back}>
                Back
              </Button>
              <Button onClick={next}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold mb-2">
                Your environment matters too.
              </h1>
              <p className="text-muted">
                Some environmental and lifestyle factors can provide additional context.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {environmentOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleArrayItem("environmentalFactors", item)}
                  className={`
                    px-4 py-3 rounded-md border text-sm font-medium
                    transition-colors text-left
                    ${
                      profile.environmentalFactors?.includes(item)
                        ? "bg-accent/10 text-accent-dark border-accent/20"
                        : "border-border hover:bg-secondary-bg"
                    }
                  `}
                >
                  {item}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Where do you spend most of your time?
              </label>
              <input
                type="text"
                value={profile.region || ""}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, region: e.target.value }))
                }
                placeholder="City or region (not exact address)"
                className="input-field"
              />
              <p className="text-xs text-muted mt-2">
                We ask for general location only. Never an exact address.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={back}>
                Back
              </Button>
              <Button onClick={next}>Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold mb-2">
                Tell us what you&apos;ve experienced.
              </h1>
              <p className="text-muted">
                Select any symptoms you&apos;ve noticed. You can add more later.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {symptomOptions.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleArrayItem("symptoms", symptom)}
                  className={`
                    px-4 py-3 rounded-md border text-sm font-medium
                    transition-colors text-left
                    ${
                      profile.symptoms?.includes(symptom)
                        ? "bg-accent/10 text-accent-dark border-accent/20"
                        : "border-border hover:bg-secondary-bg"
                    }
                  `}
                >
                  {symptom}
                </button>
              ))}
            </div>

            {profile.symptoms && profile.symptoms.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-border">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    How severe is it?
                  </label>
                  <div className="flex gap-2">
                    {severityOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            symptomSeverity: option,
                          }))
                        }
                        className={`
                          flex-1 px-3 py-2 rounded-md border text-sm font-medium
                          transition-colors
                          ${
                            profile.symptomSeverity === option
                              ? "bg-accent text-white border-accent"
                              : "border-border hover:bg-secondary-bg"
                          }
                        `}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    How often?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Occasionally", "Monthly", "Weekly", "Daily"].map(
                      (option) => (
                        <button
                          key={option}
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              symptomFrequency: option,
                            }))
                          }
                          className={`
                            px-3 py-2 rounded-md border text-sm font-medium
                            transition-colors
                            ${
                              profile.symptomFrequency === option
                                ? "bg-accent text-white border-accent"
                                : "border-border hover:bg-secondary-bg"
                            }
                          `}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    How much does this affect your life?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {impactOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            symptomImpact: option,
                          }))
                        }
                        className={`
                          px-4 py-2.5 rounded-md border text-sm font-medium
                          transition-colors text-left
                          ${
                            profile.symptomImpact === option
                              ? "bg-accent text-white border-accent"
                              : "border-border hover:bg-secondary-bg"
                          }
                        `}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-border">
              <Button variant="secondary" onClick={back}>
                Back
              </Button>
              <Button onClick={handleComplete} disabled={!profile.symptoms?.length}>
                Create my health profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
