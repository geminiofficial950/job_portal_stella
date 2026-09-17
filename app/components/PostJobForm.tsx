"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Asterisk, Check, Loader2, Save, X } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import styles from "./PostJobForm.module.css";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
      {children}
      {required ? (
        <Asterisk
          className="h-3.5 w-3.5 text-[#e11d48]"
          strokeWidth={3}
          aria-label="required"
        />
      ) : (
        <span className="normal-case tracking-normal text-[#9aa3b8]">
          (optional)
        </span>
      )}
    </span>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20";
const STEPS = ["Role", "Pay", "Skills", "Details", "Publish"];

const emptyForm = {
  title: "",
  category: "",
  location: "",
  employmentType: "full-time",
  workMode: "onsite",
  experienceLevel: "entry",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "AUD",
  salaryPeriod: "year",
  vacancies: "1",
  description: "",
  requirements: "",
  responsibilities: "",
  benefits: "",
  applicationDeadline: "",
  status: "open",
};

export default function PostJobForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSkillsFromText(raw: string) {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parts.length) return;

    setSkills((prev) => {
      const next = [...prev];
      for (const part of parts) {
        const exists = next.some((s) => s.toLowerCase() === part.toLowerCase());
        if (!exists) next.push(part);
      }
      return next;
    });
  }

  function onSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillsFromText(skillInput);
      setSkillInput("");
      return;
    }

    if (e.key === "Backspace" && !skillInput && skills.length) {
      setSkills((prev) => prev.slice(0, -1));
    }
  }

  function onSkillChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.includes(",")) {
      addSkillsFromText(value);
      setSkillInput("");
      return;
    }
    setSkillInput(value);
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function stepError(index: number) {
    if (index === 0) {
      if (form.title.trim().length < 3) return "Job title is required";
      if (!form.category.trim()) return "Category is required";
      if (!form.location.trim()) return "Location is required";
    }
    if (index === 1) {
      if (form.salaryMin === "" || form.salaryMax === "") return "Salary min and max are required";
      if (Number(form.salaryMax) < Number(form.salaryMin)) return "Salary max must be at least the minimum";
      if (!form.salaryCurrency.trim()) return "Currency is required";
      if (!form.vacancies || Number(form.vacancies) < 1) return "Vacancies must be at least 1";
    }
    if (index === 3) {
      if (stripHtml(form.description).length < 20) return "Description is required (min 20 characters)";
      if (stripHtml(form.requirements).length < 10) return "Requirements are required";
      if (stripHtml(form.responsibilities).length < 10) return "Responsibilities are required";
    }
    return "";
  }

  function goToStep(index: number) {
    if (index === step || saving) return;
    if (index > step) {
      const error = stepError(step);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setStep(index);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goToStep(step + 1);
      return;
    }

    for (let index = 0; index < STEPS.length; index += 1) {
      const error = stepError(index);
      if (error) {
        setStep(index);
        toast.error(error);
        return;
      }
    }

    // Flush any text still in the input
    const pending = skillInput.trim();
    const finalSkills = pending
      ? [
          ...skills,
          ...(skills.some((s) => s.toLowerCase() === pending.toLowerCase())
            ? []
            : [pending]),
        ]
      : skills;

    setSaving(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: Number(form.salaryMin),
          salaryMax: Number(form.salaryMax),
          vacancies: Number(form.vacancies),
          skills: finalSkills,
          applicationDeadline: form.applicationDeadline || null,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to post job");
        return;
      }

      toast.success(data.message || "Job posted");
      router.push("/dashboard/recruiter/jobs");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm"
    >
      <ol className={styles.stepper}>
        {STEPS.map((label, index) => {
          const current = index === step;
          const complete = index < step;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={index > step || saving}
                aria-current={current ? "step" : undefined}
                onClick={() => goToStep(index)}
                className={`flex w-full items-center gap-2 border-b-2 pb-3 text-left text-sm disabled:cursor-not-allowed ${
                  current
                    ? `border-[#2563eb] font-semibold ${styles.stepCurrent}`
                    : complete
                      ? "border-[#93c5fd] text-[#2563eb]"
                      : "border-[#e6eaf2] text-[#64748b]"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${
                    current
                      ? styles.stepNumber
                      : complete
                        ? "bg-[#dbeafe] text-[#2563eb]"
                        : "border border-[#e6eaf2] text-[#64748b]"
                  }`}
                >
                  {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="min-w-0">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <h2 className="text-lg font-semibold text-[#0f172a]">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </h2>

      {step === 0 ? <>
      <label className="block">
        <FieldLabel required>Job title</FieldLabel>
        <input
          required
          minLength={3}
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className={inputClass}
          placeholder="e.g. Support worker — Melbourne"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <FieldLabel required>Category</FieldLabel>
          <input
            required
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className={inputClass}
            placeholder="Aged care / Nursing / Disability"
          />
        </label>
        <label className="block">
          <FieldLabel required>Location</FieldLabel>
          <input
            required
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className={inputClass}
            placeholder="Melbourne, VIC"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <FieldLabel required>Employment type</FieldLabel>
          <select
            required
            value={form.employmentType}
            onChange={(e) => updateField("employmentType", e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="casual">Casual</option>
            <option value="contract">Contract</option>
          </select>
        </label>
        <label className="block">
          <FieldLabel required>Work mode</FieldLabel>
          <select
            required
            value={form.workMode}
            onChange={(e) => updateField("workMode", e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="onsite">Onsite</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </label>
        <label className="block">
          <FieldLabel required>Experience</FieldLabel>
          <select
            required
            value={form.experienceLevel}
            onChange={(e) => updateField("experienceLevel", e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </label>
      </div>
      </> : null}

      {step === 1 ? <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <FieldLabel required>Salary min</FieldLabel>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={form.salaryMin}
            onChange={(e) => updateField("salaryMin", e.target.value)}
            className={inputClass}
            placeholder="65000"
          />
        </label>
        <label className="block">
          <FieldLabel required>Salary max</FieldLabel>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={form.salaryMax}
            onChange={(e) => updateField("salaryMax", e.target.value)}
            className={inputClass}
            placeholder="85000"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <FieldLabel required>Currency</FieldLabel>
          <input
            required
            maxLength={3}
            value={form.salaryCurrency}
            onChange={(e) =>
              updateField("salaryCurrency", e.target.value.toUpperCase())
            }
            className={inputClass}
            placeholder="AUD"
          />
        </label>
        <label className="block">
          <FieldLabel required>Salary period</FieldLabel>
          <select
            required
            value={form.salaryPeriod}
            onChange={(e) => updateField("salaryPeriod", e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="hour">Per hour</option>
            <option value="day">Per day</option>
            <option value="week">Per week</option>
            <option value="year">Per year</option>
          </select>
        </label>
        <label className="block">
          <FieldLabel required>Vacancies</FieldLabel>
          <input
            required
            type="number"
            min={1}
            value={form.vacancies}
            onChange={(e) => updateField("vacancies", e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      </> : null}

      {step === 2 ? (
      <div className="block">
        <FieldLabel>Skills</FieldLabel>
        <div className="rounded-lg border border-[#cdd3e0] px-3 py-2.5 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/20 transition-all">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#cffafe] to-[#a5f3fc] px-2.5 py-1 text-sm font-semibold text-[#164e63] border border-[#67e8f9]"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded-full p-0.5 hover:bg-[#b91c1c] hover:text-white"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <input
              value={skillInput}
              onChange={onSkillChange}
              onKeyDown={onSkillKeyDown}
              onBlur={() => {
                if (skillInput.trim()) {
                  addSkillsFromText(skillInput);
                  setSkillInput("");
                }
              }}
              className="min-w-[140px] flex-1 border-0 bg-transparent py-1 text-[15px] outline-none"
              placeholder={
                skills.length
                  ? "Add another skill"
                  : "Type skill + Enter or comma"
              }
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-[#6b7a9e]">
          Press Enter or comma to add each skill as a tag.
        </p>
      </div>
      ) : null}

      {step === 3 ? <>
      <div className="block">
        <FieldLabel required>Description</FieldLabel>
        <RichTextEditor
          value={form.description}
          onChange={(html) => updateField("description", html)}
          placeholder="Role summary and what success looks like..."
          minHeight="180px"
        />
      </div>

      <div className="block">
        <FieldLabel required>Requirements</FieldLabel>
        <RichTextEditor
          value={form.requirements}
          onChange={(html) => updateField("requirements", html)}
          placeholder="Qualifications, checks, experience needed..."
          minHeight="150px"
        />
      </div>

      <div className="block">
        <FieldLabel required>Responsibilities</FieldLabel>
        <RichTextEditor
          value={form.responsibilities}
          onChange={(html) => updateField("responsibilities", html)}
          placeholder="Day-to-day duties..."
          minHeight="150px"
        />
      </div>
      </> : null}

      {step === 4 ? <>
      <label className="block">
        <FieldLabel>Benefits</FieldLabel>
        <textarea
          rows={3}
          value={form.benefits}
          onChange={(e) => updateField("benefits", e.target.value)}
          className={inputClass}
          placeholder="Salary packaging, training, parking..."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Application deadline</FieldLabel>
          <input
            type="date"
            value={form.applicationDeadline}
            onChange={(e) => updateField("applicationDeadline", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel required>Status</FieldLabel>
          <select
            required
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </div>
      </> : null}

      <div className="flex items-center justify-between gap-3 border-t border-[#e6eaf2] pt-5">
        <button
          type="button"
          disabled={step === 0 || saving}
          onClick={() => setStep((current) => current - 1)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#475569] disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="submit" disabled={saving} className={styles.nextButton}>
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="submit" disabled={saving} className={styles.nextButton}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Posting…" : "Post job"}
          </button>
        )}
      </div>
    </form>
  );
}
