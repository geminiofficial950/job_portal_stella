import type { EducationEntry, ExperienceEntry } from "@/lib/seekerHistory";

export const EMPLOYMENT_TYPES = ["full-time", "part-time", "casual", "contract"] as const;
export const WORK_MODES = ["onsite", "hybrid", "remote"] as const;

export type GapKey =
  | "headline"
  | "location"
  | "experienceLevel"
  | "about"
  | "skills"
  | "education"
  | "preferredEmploymentTypes"
  | "preferredWorkModes"
  | "linkedin"
  | "resumeUrl"
  | "phone";

export type GapSource = {
  headline?: string | null;
  location?: string | null;
  experienceLevel?: string | null;
  about?: string | null;
  skills?: string[] | null;
  education?: string | null;
  educations?: EducationEntry[] | null;
  experiences?: ExperienceEntry[] | null;
  preferredEmploymentTypes?: string[] | null;
  preferredWorkModes?: string[] | null;
  linkedin?: string | null;
  resumeUrl?: string | null;
  phone?: string | null;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

export function educationLine(source: GapSource) {
  const fromEntries = (source.educations || [])
    .map((entry) => [entry.degree, entry.institution].filter(Boolean).join(" - "))
    .filter(Boolean)
    .join("; ")
    .trim();
  return fromEntries || text(source.education);
}

function validHttp(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validLinkedIn(value: string) {
  if (!validHttp(value)) return false;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "").toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

export function profileGapKeys(source: GapSource, options?: { includePhone?: boolean; includeResumeUrl?: boolean }) {
  const gaps: GapKey[] = [];
  if (text(source.headline).length < 5) gaps.push("headline");
  if (text(source.location).length < 2) gaps.push("location");
  if (!["entry", "mid", "senior"].includes(text(source.experienceLevel))) gaps.push("experienceLevel");
  if (text(source.about).length < 30) gaps.push("about");
  if (!(source.skills || []).some((skill) => text(skill))) gaps.push("skills");
  if (educationLine(source).length < 3) gaps.push("education");
  if (!(source.preferredEmploymentTypes || []).length) gaps.push("preferredEmploymentTypes");
  if (!(source.preferredWorkModes || []).length) gaps.push("preferredWorkModes");
  if (!validLinkedIn(text(source.linkedin))) gaps.push("linkedin");
  if (options?.includeResumeUrl !== false && !validHttp(text(source.resumeUrl))) gaps.push("resumeUrl");
  if (options?.includePhone && text(source.phone).length < 6) gaps.push("phone");
  return gaps;
}
