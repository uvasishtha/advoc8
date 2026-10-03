"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ProfileEducation, ProfileExperience, UserProfile } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIO_MAX_LENGTH = 320;

type ProfileFormState = {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  bio: string;
  education: ProfileEducation[];
  experience: ProfileExperience[];
  skills: string[];
};

type FormErrors = Record<string, string>;

function toFormState(user: UserProfile): ProfileFormState {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    location: user.location,
    bio: user.bio,
    education: user.education.map((item) => ({ ...item })),
    experience: user.experience.map((item) => ({ ...item })),
    skills: [...user.skills],
  };
}

function toProfile(user: UserProfile, form: ProfileFormState): UserProfile {
  return {
    ...user,
    name: form.name.trim(),
    username: form.username.trim().replace(/^@/, ""),
    email: form.email.trim(),
    phone: form.phone.trim(),
    role: form.role.trim(),
    location: form.location.trim(),
    bio: form.bio.trim(),
    education: form.education.map((item) => ({
      id: item.id,
      school: item.school.trim(),
      credential: item.credential.trim(),
      period: item.period.trim(),
    })),
    experience: form.experience.map((item) => ({
      id: item.id,
      role: item.role.trim(),
      organization: item.organization.trim(),
      period: item.period.trim(),
    })),
    skills: form.skills.map((skill) => skill.trim()).filter(Boolean),
  };
}

function validate(form: ProfileFormState): FormErrors {
  const errors: FormErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }
  if (form.username.trim().replace(/^@/, "").length < 3) {
    errors.username = "Usernames need at least 3 characters.";
  }
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.role.trim()) {
    errors.role = "Add your role or title.";
  }
  if (!form.location.trim()) {
    errors.location = "Add a general location — never an exact address.";
  }
  if (form.bio.trim().length < 10) {
    errors.bio = "Add a short bio of at least 10 characters.";
  } else if (form.bio.length > BIO_MAX_LENGTH) {
    errors.bio = `Keep your bio under ${BIO_MAX_LENGTH} characters.`;
  }

  form.education.forEach((item, index) => {
    if (!item.school.trim()) {
      errors[`education-${index}-school`] = "Add a school or program.";
    }
  });

  form.experience.forEach((item, index) => {
    if (!item.role.trim()) {
      errors[`experience-${index}-role`] = "Add a role or title.";
    }
  });

  return errors;
}

function createId() {
  return Date.now().toString();
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-warning">{error}</p>}
    </div>
  );
}

interface EditProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
}

export function EditProfileModal({
  isOpen,
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit profile" size="lg">
      <ProfileForm user={user} onClose={onClose} onSave={onSave} />
    </Modal>
  );
}

interface ProfileFormProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
}

function ProfileForm({ user, onClose, onSave }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormState>(() => toFormState(user));
  const [errors, setErrors] = useState<FormErrors>({});
  const [newSkill, setNewSkill] = useState("");

  const update = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (!form.skills.includes(skill)) {
      update("skills", [...form.skills, skill]);
    }
    setNewSkill("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSave(toProfile(user, form));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="profile-name" label="Full name" error={errors.name}>
          <input
            id="profile-name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input-field"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        <Field id="profile-username" label="Username" error={errors.username}>
          <input
            id="profile-username"
            type="text"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            placeholder="maya.e"
            className="input-field"
            aria-invalid={Boolean(errors.username)}
          />
        </Field>

        <Field id="profile-email" label="Email" error={errors.email}>
          <input
            id="profile-email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="input-field"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>

        <Field id="profile-phone" label="Phone (optional)">
          <input
            id="profile-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="input-field"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="profile-role" label="Role / title" error={errors.role}>
          <input
            id="profile-role"
            type="text"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="e.g., Public health research assistant"
            className="input-field"
            aria-invalid={Boolean(errors.role)}
          />
        </Field>

        <Field id="profile-location" label="Location" error={errors.location}>
          <input
            id="profile-location"
            type="text"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="City or region (not exact address)"
            className="input-field"
            aria-invalid={Boolean(errors.location)}
          />
        </Field>
      </div>

      <Field id="profile-bio" label="Bio" error={errors.bio}>
        <textarea
          id="profile-bio"
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={4}
          placeholder="A short professional bio..."
          className="input-field resize-none"
          aria-invalid={Boolean(errors.bio)}
        />
        <p className="mt-1.5 text-xs text-muted">
          {form.bio.length} / {BIO_MAX_LENGTH}
        </p>
      </Field>

      <div className="pt-6 border-t border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Education</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              update("education", [
                ...form.education,
                { id: createId(), school: "", credential: "", period: "" },
              ])
            }
          >
            + Add education
          </Button>
        </div>

        {form.education.length === 0 ? (
          <p className="text-sm text-muted italic">No education added yet.</p>
        ) : (
          form.education.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border border-border rounded-md space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <Field
                    id={`education-${index}-school`}
                    label="School or program"
                    error={errors[`education-${index}-school`]}
                  >
                    <input
                      id={`education-${index}-school`}
                      type="text"
                      value={item.school}
                      onChange={(e) =>
                        update(
                          "education",
                          form.education.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, school: e.target.value }
                              : entry,
                          ),
                        )
                      }
                      className="input-field"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field id={`education-${index}-credential`} label="Credential">
                      <input
                        id={`education-${index}-credential`}
                        type="text"
                        value={item.credential}
                        onChange={(e) =>
                          update(
                            "education",
                            form.education.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, credential: e.target.value }
                                : entry,
                            ),
                          )
                        }
                        placeholder="e.g., B.S. Public Health"
                        className="input-field"
                      />
                    </Field>

                    <Field id={`education-${index}-period`} label="Period">
                      <input
                        id={`education-${index}-period`}
                        type="text"
                        value={item.period}
                        onChange={(e) =>
                          update(
                            "education",
                            form.education.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, period: e.target.value }
                                : entry,
                            ),
                          )
                        }
                        placeholder="e.g., 2023 — 2027"
                        className="input-field"
                      />
                    </Field>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    update(
                      "education",
                      form.education.filter((entry) => entry.id !== item.id),
                    )
                  }
                  className="text-muted hover:text-foreground transition-colors"
                  aria-label={`Remove ${item.school || "education"}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-6 border-t border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Experience</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              update("experience", [
                ...form.experience,
                {
                  id: createId(),
                  role: "",
                  organization: "",
                  period: "",
                },
              ])
            }
          >
            + Add experience
          </Button>
        </div>

        {form.experience.length === 0 ? (
          <p className="text-sm text-muted italic">No experience added yet.</p>
        ) : (
          form.experience.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border border-border rounded-md space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <Field
                    id={`experience-${index}-role`}
                    label="Role"
                    error={errors[`experience-${index}-role`]}
                  >
                    <input
                      id={`experience-${index}-role`}
                      type="text"
                      value={item.role}
                      onChange={(e) =>
                        update(
                          "experience",
                          form.experience.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, role: e.target.value }
                              : entry,
                          ),
                        )
                      }
                      className="input-field"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      id={`experience-${index}-organization`}
                      label="Organization"
                    >
                      <input
                        id={`experience-${index}-organization`}
                        type="text"
                        value={item.organization}
                        onChange={(e) =>
                          update(
                            "experience",
                            form.experience.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, organization: e.target.value }
                                : entry,
                            ),
                          )
                        }
                        placeholder="e.g., Community Health Collective"
                        className="input-field"
                      />
                    </Field>

                    <Field id={`experience-${index}-period`} label="Period">
                      <input
                        id={`experience-${index}-period`}
                        type="text"
                        value={item.period}
                        onChange={(e) =>
                          update(
                            "experience",
                            form.experience.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, period: e.target.value }
                                : entry,
                            ),
                          )
                        }
                        placeholder="e.g., Jun 2025 — Present"
                        className="input-field"
                      />
                    </Field>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    update(
                      "experience",
                      form.experience.filter(
                        (entry) => entry.id !== item.id,
                      ),
                    )
                  }
                  className="text-muted hover:text-foreground transition-colors"
                  aria-label={`Remove ${item.role || "experience"}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-6 border-t border-border">
        <h3 className="text-sm font-medium mb-3">Skills & interests</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Add a skill..."
            className="input-field flex-1"
          />
          <Button type="button" onClick={addSkill}>
            Add
          </Button>
        </div>

        {form.skills.length === 0 ? (
          <p className="text-sm text-muted italic">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-bg border border-border rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "skills",
                      form.skills.filter((entry) => entry !== skill),
                    )
                  }
                  className="text-muted hover:text-foreground transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
