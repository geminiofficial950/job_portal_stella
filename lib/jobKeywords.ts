/**
 * Job title / keyword typeahead catalog for /jobs search.
 */

const ROLE_KEYWORDS = [
  "Software Engineer",
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Web Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Engineer",
  "Data Analyst",
  "Data Scientist",
  "Business Analyst",
  "Product Manager",
  "Project Manager",
  "Program Manager",
  "Account Manager",
  "Sales Manager",
  "Sales Representative",
  "Sales",
  "Marketing Manager",
  "Marketing",
  "Digital Marketing",
  "Social Media Manager",
  "Content Writer",
  "Graphic Designer",
  "UI Designer",
  "UX Designer",
  "UI/UX Designer",
  "Product Designer",
  "Customer Service",
  "Customer Support",
  "Support Specialist",
  "Help Desk",
  "Administrator",
  "Administrative Assistant",
  "Office Manager",
  "Receptionist",
  "Accountant",
  "Bookkeeper",
  "Financial Analyst",
  "HR Manager",
  "Recruiter",
  "Talent Acquisition",
  "Nurse",
  "Registered Nurse",
  "Teacher",
  "Tutor",
  "Chef",
  "Cook",
  "Warehouse",
  "Logistics",
  "Driver",
  "Truck Driver",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Mechanic",
  "Engineer",
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Manager",
  "Team Leader",
  "Supervisor",
  "Coordinator",
  "Consultant",
  "Analyst",
  "Developer",
  "Designer",
  "Remote",
  "Internship",
  "Graduate",
  "Apprentice",
];

function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Ranked keyword suggestions while typing. Empty query → none.
 */
export function suggestJobKeywords(
  query: string,
  extraTerms: string[] = [],
  limit = 8,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const pool = new Map<string, string>();
  for (const term of [...ROLE_KEYWORDS, ...extraTerms]) {
    const cleaned = term.replace(/\s+jobs$/i, "").trim();
    if (!cleaned || cleaned.length < 2) continue;
    const key = cleaned.toLowerCase();
    if (!pool.has(key)) pool.set(key, titleCase(cleaned));
  }

  const scored: { label: string; score: number }[] = [];

  for (const [key, label] of pool) {
    let score = 0;
    if (key === q) score = 1000;
    else if (key.startsWith(q)) score = 800;
    else if (key.includes(` ${q}`)) score = 600;
    else if (key.includes(q)) score = 400;

    // Prefer multi-word roles that still start with the typed prefix
    if (score > 0 && label.includes(" ")) score += 20;
    if (score > 0) scored.push({ label, score });
  }

  scored.sort(
    (a, b) => b.score - a.score || a.label.localeCompare(b.label),
  );

  return scored.slice(0, limit).map((s) => s.label);
}
