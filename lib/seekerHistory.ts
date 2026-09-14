export type ExperienceEntry = { company: string; title: string; description: string; skills: string[] };
export type EducationEntry = { institution: string; degree: string; description: string; skills: string[] };

export function validateHistory(experiences: unknown, educations: unknown): string | null {
  for (const [label, entries, name] of [["Experience", experiences, "company"], ["Education", educations, "institution"]] as const) {
    if (!Array.isArray(entries) || entries.length > 20) return `${label}: maximum 20 entries`;
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") return `Invalid ${label.toLowerCase()} entry`;
      if (typeof entry[name] !== "string" || !entry[name].trim() || entry[name].length > 200) return `${label}: ${name} is required (max 200 characters)`;
      const title = label === "Experience" ? entry.title : entry.degree;
      if (typeof title !== "string" || title.length > 200) return `${label}: title must be under 200 characters`;
      if (typeof entry.description !== "string" || entry.description.length > 2000) return `${label}: description must be under 2000 characters`;
      if (!Array.isArray(entry.skills) || entry.skills.length > 30 || entry.skills.some((skill: unknown) => typeof skill !== "string" || !skill.trim() || skill.length > 80)) return `${label}: use up to 30 skills of 80 characters each`;
    }
  }
  return null;
}
