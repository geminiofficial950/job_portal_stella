"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Asterisk, Loader2, Save, X } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

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
  "w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]";

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (stripHtml(form.description).length < 20) {
      toast.error("Description is required (min 20 characters)");
      return;
    }
    if (stripHtml(form.requirements).length < 10) {
      toast.error("Requirements are required");
      return;
    }
    if (stripHtml(form.responsibilities).length < 10) {
      toast.error("Responsibilities are required");
      return;
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
      className="mt-8 space-y-4 rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm"
    >
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

      <div className="block">
        <FieldLabel>Skills</FieldLabel>
        <div className="rounded-lg border border-[#cdd3e0] px-3 py-2.5 focus-within:border-[#dc2626] focus-within:ring-2 focus-within:ring-[#dc2626]/20 transition-all">
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

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#dc2626] px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 transition-all"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Post Job
      </button>
    </form>
  );
}
