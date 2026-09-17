export type ExperienceEntry = { company: string; title: string; description: string; skills: string[] };
export type EducationEntry = {
  institution: string;
  degree: string;
  level: string;
  yearCompleted: string;
  description: string;
  skills: string[];
};

export const EDUCATION_LEVELS = [
  "High school",
  "Certificate",
  "Diploma",
  "Bachelor",
  "Graduate diploma",
  "Master",
  "Doctorate",
  "Other",
] as const;

export function emptyEducation(): EducationEntry {
  return {
    institution: "",
    degree: "",
    level: "",
    yearCompleted: "",
    description: "",
    skills: [],
  };
}

export function validateHistory(experiences: unknown, educations: unknown): string | null {
  for (const [label, entries, name] of [["Experience", experiences, "company"], ["Education", educations, "institution"]] as const) {
    if (!Array.isArray(entries) || entries.length > 20) return `${label}: maximum 20 entries`;
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") return `Invalid ${label.toLowerCase()} entry`;
      if (typeof entry[name] !== "string" || !entry[name].trim() || entry[name].length > 200) return `${label}: ${name} is required (max 200 characters)`;
      const title = label === "Experience" ? entry.title : entry.degree;
      if (typeof title !== "string" || title.length > 200) return `${label}: title must be under 200 characters`;
      if (label === "Education") {
        const level = typeof entry.level === "string" ? entry.level : "";
        if (level && !EDUCATION_LEVELS.includes(level as (typeof EDUCATION_LEVELS)[number])) {
          return "Education: choose a valid level";
        }
        const year = typeof entry.yearCompleted === "string" ? entry.yearCompleted.trim() : "";
        const currentYear = new Date().getFullYear();
        if (year && (!/^\d{4}$/.test(year) || Number(year) < 1950 || Number(year) > currentYear)) {
          return `Education: year completed must be between 1950 and ${currentYear}`;
        }
      }
      if (typeof entry.description !== "string" || entry.description.length > 2000) return `${label}: description must be under 2000 characters`;
      if (!Array.isArray(entry.skills) || entry.skills.length > 30 || entry.skills.some((skill: unknown) => typeof skill !== "string" || !skill.trim() || skill.length > 80)) return `${label}: use up to 30 skills of 80 characters each`;
    }
  }
  return null;
}
