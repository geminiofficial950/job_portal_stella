"use client";

import { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  EMPLOYMENT_TYPES,
  WORK_MODES,
  type GapKey,
} from "@/lib/profileGaps";
import styles from "@/app/dashboard/seeker/seeker.module.css";
import popupStyles from "./ResumeDiscoveryPopup.module.css";

export type GapDraft = {
  headline: string;
  location: string;
  experienceLevel: "" | "entry" | "mid" | "senior";
  about: string;
  skills: string;
  education: string;
  preferredEmploymentTypes: string[];
  preferredWorkModes: string[];
  linkedin: string;
  resumeUrl: string;
  phone: string;
};

type Props = {
  gaps: GapKey[];
  draft: GapDraft;
  saving: boolean;
  error: string;
  tone?: "dashboard" | "popup";
  onChange: (draft: GapDraft) => void;
  onSubmit: (event: FormEvent) => void;
};

const LABELS: Record<string, string> = {
  "full-time": "Full time",
  "part-time": "Part time",
  casual: "Casual",
  contract: "Contract",
  onsite: "Onsite",
  hybrid: "Hybrid",
  remote: "Remote",
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function SuggestedMissingDetails({
  gaps,
  draft,
  saving,
  error,
  tone = "dashboard",
  onChange,
  onSubmit,
}: Props) {
  const popup = tone === "popup";
  const shown = new Set(gaps);

  function patch(partial: Partial<GapDraft>) {
    onChange({ ...draft, ...partial });
  }

  const field = popup
    ? "grid gap-1.5 text-xs font-medium text-[#334155]"
    : "grid gap-1.5 text-xs font-semibold";
  const control = popup
    ? "w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2.5 text-sm font-normal text-[#0f172a]"
    : "w-full rounded-xl border px-3 py-2.5 text-sm font-normal outline-none";

  return (
    <form
      onSubmit={onSubmit}
      data-preserve-color
      className={
        popup
          ? "mt-2 grid gap-3"
          : "rounded-2xl border px-4 py-5 sm:px-6"
      }
      style={
        popup
          ? undefined
          : {
              borderColor: "var(--seeker-line)",
              background: "var(--seeker-raised)",
              color: "var(--seeker-text)",
            }
      }
    >
      <div>
        <p className={popup ? "text-sm text-[#334155]" : "text-base font-bold"}>
          A few details weren&apos;t on your resume
        </p>
        <p
          className="mt-1 text-sm"
          style={popup ? undefined : { color: "var(--seeker-muted)" }}
        >
          Fill these in here, then we&apos;ll show suggested jobs.
        </p>
      </div>

      <fieldset disabled={saving} className="grid gap-3 sm:grid-cols-2">
        {shown.has("headline") && (
          <label className={field}>
            Headline
            <input
              className={control}
              required
              minLength={5}
              maxLength={120}
              value={draft.headline}
              onChange={(event) => patch({ headline: event.target.value })}
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "transparent", color: "inherit" }}
            />
          </label>
        )}
        {shown.has("location") && (
          <label className={field}>
            Location
            <input
              className={control}
              required
              minLength={2}
              maxLength={120}
              placeholder="City, country"
              value={draft.location}
              onChange={(event) => patch({ location: event.target.value })}
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "transparent", color: "inherit" }}
            />
          </label>
        )}
        {shown.has("experienceLevel") && (
          <label className={field}>
            Experience level
            <select
              className={control}
              required
              value={draft.experienceLevel}
              onChange={(event) =>
                patch({
                  experienceLevel: event.target.value as GapDraft["experienceLevel"],
                })
              }
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "var(--seeker-raised)", color: "inherit" }}
            >
              <option value="">Select level</option>
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </label>
        )}
        {shown.has("phone") && (
          <label className={field}>
            Phone
            <input
              className={control}
              required
              minLength={6}
              maxLength={30}
              inputMode="tel"
              value={draft.phone}
              onChange={(event) => patch({ phone: event.target.value })}
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "transparent", color: "inherit" }}
            />
          </label>
        )}
        {shown.has("education") && (
          <label className={`${field} sm:col-span-2`}>
            Education
            <input
              className={control}
              required
              minLength={3}
              maxLength={200}
              placeholder="Degree · School"
              value={draft.education}
              onChange={(event) => patch({ education: event.target.value })}
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "transparent", color: "inherit" }}
            />
          </label>
        )}
        {shown.has("skills") && (
          <label className={`${field} sm:col-span-2`}>
            Skills
            <input
              className={control}
              required
              placeholder="React, Communication, Project management"
              value={draft.skills}
              onChange={(event) => patch({ skills: event.target.value })}
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "transparent", color: "inherit" }}
            />
          </label>
        )}
        {shown.has("about") && (
          <label className={`${field} sm:col-span-2`}>
            About you
            <textarea
              className={control}
              required
              minLength={30}
              maxLength={2000}
              rows={3}
              value={draft.about}
              onChange={(event) => patch({ about: event.target.value })}
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "transparent", color: "inherit" }}
            />
          </label>
        )}
        {shown.has("linkedin") && (
          <label className={field}>
            LinkedIn profile link
            <input
              className={control}
              required
              type="url"
              placeholder="https://www.linkedin.com/in/..."
              value={draft.linkedin}
              onChange={(event) => patch({ linkedin: event.target.value })}
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "transparent", color: "inherit" }}
            />
          </label>
        )}
        {shown.has("resumeUrl") && (
          <label className={field}>
            Resume link
            <input
              className={control}
              required
              type="url"
              placeholder="https://"
              value={draft.resumeUrl}
              onChange={(event) => patch({ resumeUrl: event.target.value })}
              style={popup ? undefined : { borderColor: "var(--seeker-line)", background: "transparent", color: "inherit" }}
            />
          </label>
        )}
        {shown.has("preferredEmploymentTypes") && (
          <fieldset className={`${field} sm:col-span-2`}>
            <legend>Employment type</legend>
            <div className="flex flex-wrap gap-2 font-normal">
              {EMPLOYMENT_TYPES.map((type) => (
                <label key={type} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm" style={popup ? { borderColor: "#cbd5e1" } : { borderColor: "var(--seeker-line)" }}>
                  <input
                    type="checkbox"
                    checked={draft.preferredEmploymentTypes.includes(type)}
                    onChange={() =>
                      patch({
                        preferredEmploymentTypes: toggle(draft.preferredEmploymentTypes, type),
                      })
                    }
                  />
                  {LABELS[type]}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {shown.has("preferredWorkModes") && (
          <fieldset className={`${field} sm:col-span-2`}>
            <legend>Work mode</legend>
            <div className="flex flex-wrap gap-2 font-normal">
              {WORK_MODES.map((mode) => (
                <label key={mode} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm" style={popup ? { borderColor: "#cbd5e1" } : { borderColor: "var(--seeker-line)" }}>
                  <input
                    type="checkbox"
                    checked={draft.preferredWorkModes.includes(mode)}
                    onChange={() =>
                      patch({ preferredWorkModes: toggle(draft.preferredWorkModes, mode) })
                    }
                  />
                  {LABELS[mode]}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className={
          popup
            ? popupStyles.primary
            : `${styles.formButton} inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold`
        }
        style={popup ? undefined : { background: "#2563eb", color: "#fff", borderColor: "#2563eb" }}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {saving ? "Saving…" : "Save and show jobs"}
      </button>
    </form>
  );
}
