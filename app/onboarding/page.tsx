"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import type { HealthProfile } from "@/lib/types";

const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
const conditionOptions = ["Endometriosis", "PCOS", "Fibroids", "Chronic pain", "Anxiety", "None"];
const familyHistoryOptions = ["Endometriosis", "PCOS", "Autoimmune conditions", "Diabetes", "None known"];
const environmentOptions = ["High stress", "Irregular sleep", "Limited physical activity", "None / unsure"];
const symptomOptions = ["Pelvic pain", "Abdominal pain", "Fatigue", "Headaches", "Heavy periods", "Irregular periods", "Pain during sex", "Mood changes"];

export default function OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(1);
  const [isPreparing, setIsPreparing] = useState(false);
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

  const toggle = (field: keyof HealthProfile, value: string) => {
    setProfile((prev) => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  // The loading screen covers the handoff to the dashboard and steps aside as
  // soon as that route is showing. Nothing is delayed to make it show.
  const showLoading = isPreparing && pathname !== "/home";

  const finish = () => {
    setIsPreparing(true);
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
              <h1 className="font-serif text-3xl font-semibold mb-2">Let&apos;s build your health profile.</h1>
              <p className="text-muted">A little context helps us understand your health patterns over time.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Age range</label>
              <div className="grid grid-cols-3 gap-2">
                {ageRanges.map((age) => (
                  <button key={age} onClick={() => setProfile((prev) => ({ ...prev, ageRange: age }))}
                    className={`px-4 py-2.5 rounded-md border text-sm font-medium transition-colors ${profile.ageRange === age ? "bg-accent text-white border-accent" : "border-border hover:bg-secondary-bg"}`}>
                    {age}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Previous diagnoses</label>
              <div className="grid grid-cols-2 gap-2">
                {conditionOptions.map((condition) => (
                  <button key={condition} onClick={() => toggle("previousDiagnoses", condition)}
                    className={`px-4 py-2.5 rounded-md border text-sm font-medium transition-colors text-left ${profile.previousDiagnoses?.includes(condition) ? "bg-accent/10 text-accent-dark border-accent/20" : "border-border hover:bg-secondary-bg"}`}>
                    {condition}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Current medications</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Add a medication..." className="input-field flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter") { const val = (e.target as HTMLInputElement).value; if (val) { setProfile((prev) => ({ ...prev, currentMedications: [...(prev.currentMedications || []), val] })); (e.target as HTMLInputElement).value = ""; } } }} />
                <Button onClick={() => {}}>Add</Button>
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
              <h1 className="font-serif text-3xl font-semibold mb-2">Health can run in families.</h1>
              <p className="text-muted">Family history can provide useful context.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {familyHistoryOptions.map((item) => (
                <button key={item} onClick={() => toggle("familyHistory", item)}
                  className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors text-left ${profile.familyHistory?.includes(item) ? "bg-accent/10 text-accent-dark border-accent/20" : "border-border hover:bg-secondary-bg"}`}>
                  {item}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={next}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold mb-2">Your environment matters too.</h1>
              <p className="text-muted">Some factors can provide additional context.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {environmentOptions.map((item) => (
                <button key={item} onClick={() => toggle("environmentalFactors", item)}
                  className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors text-left ${profile.environmentalFactors?.includes(item) ? "bg-accent/10 text-accent-dark border-accent/20" : "border-border hover:bg-secondary-bg"}`}>
                  {item}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Where do you spend most of your time?</label>
              <input type="text" placeholder="City or region" className="input-field"
                onChange={(e) => setProfile((prev) => ({ ...prev, region: e.target.value }))} />
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={next}>Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold mb-2">Tell us what you&apos;ve experienced.</h1>
              <p className="text-muted">Select any symptoms you&apos;ve noticed.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {symptomOptions.map((symptom) => (
                <button key={symptom} onClick={() => toggle("symptoms", symptom)}
                  className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors text-left ${profile.symptoms?.includes(symptom) ? "bg-accent/10 text-accent-dark border-accent/20" : "border-border hover:bg-secondary-bg"}`}>
                  {symptom}
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-6 border-t border-border">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={finish} disabled={!profile.symptoms?.length}>Create my health profile</Button>
            </div>
          </div>
        )}
      </div>

      {showLoading && <LoadingScreen message="Preparing your health story..." />}
    </div>
  );
}
