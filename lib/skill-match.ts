export type SkillMatchTier =
  | "perfect"
  | "good"
  | "wildcard"
  | "future"
  | "none";

export type SkillMatchResult = {
  tier: SkillMatchTier;
  title: string;
  description: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  /** Skills used as the job side of the comparison */
  jobSkills: string[];
  /** Where job-side skills came from */
  skillsSource: "listed" | "extracted" | "profile-in-job" | "none";
  profileSkillCount: number;
};

export const SKILL_MATCH_COPY: Record<
  SkillMatchTier,
  { title: string; description: string }
> = {
  perfect: {
    title: "Perfect Match",
    description:
      "Meets every single requirement and nice-to-have skill.",
  },
  good: {
    title: "Good Fit",
    description:
      "Has all core skills but lacks minor preferences.",
  },
  wildcard: {
    title: "Wildcard",
    description:
      "Has different industry experience but strong transferable skills.",
  },
  future: {
    title: "Future Pool",
    description:
      "High potential but better suited for later roles.",
  },
  none: {
    title: "No Match",
    description:
      "Your current skills don’t align with this role’s requirements.",
  },
};

export function normalizeSkill(skill: string): string {
  return skill
    .trim()
    .toLowerCase()
    .replace(/[+/_.]/g, " ")
    .replace(/\s+/g, " ");
}

/** Soft match: exact, contains, or multi-word overlap */
export function skillsOverlap(a: string, b: string): boolean {
  const na = normalizeSkill(a);
  const nb = normalizeSkill(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 3 && nb.length >= 3) {
    if (na.includes(nb) || nb.includes(na)) return true;
  }
  const wa = new Set(na.split(" ").filter((w) => w.length > 2));
  const wb = nb.split(" ").filter((w) => w.length > 2);
  if (wa.size && wb.length) {
    const hits = wb.filter((w) => wa.has(w)).length;
    if (hits >= Math.min(2, wb.length) && hits / wb.length >= 0.5) return true;
  }
  return false;
}

function uniqueSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const skill of skills) {
    const cleaned = skill.trim();
    if (!cleaned) continue;
    const key = normalizeSkill(cleaned);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

function jobSearchText(job: {
  title?: string;
  category?: string;
  description?: string;
  requirements?: string;
}): string {
  return [
    job.title || "",
    job.category || "",
    job.requirements || "",
    (job.description || "").replace(/<[^>]+>/g, " "),
  ]
    .join(" ")
    .toLowerCase();
}

function skillFoundInText(skill: string, text: string): boolean {
  const key = normalizeSkill(skill);
  if (key.length < 2) return false;
  if (text.includes(key)) return true;

  // Word-boundary-ish check for short tokens
  const parts = key.split(" ").filter(Boolean);
  if (parts.length > 1) {
    return parts.every((part) => part.length < 3 || text.includes(part));
  }
  return false;
}

/**
 * Explicit job.skills when present; otherwise empty.
 */
export function getListedJobSkills(job: {
  skills?: string[] | null;
}): string[] {
  return uniqueSkills(job.skills || []).slice(0, 20);
}

/**
 * Common skills we can safely detect in free-text job descriptions
 * (Adzuna / Himalayas). Longer phrases are matched first.
 */
const JOB_TEXT_SKILL_VOCAB: string[] = [
  // Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "Go",
  "Golang",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Scala",
  "R",
  "SQL",
  "HTML",
  "CSS",
  "Bash",
  "Shell",
  // Frontend / mobile
  "React Native",
  "React",
  "Next.js",
  "Vue.js",
  "Vue",
  "Angular",
  "Svelte",
  "Nuxt",
  "Redux",
  "Tailwind CSS",
  "Tailwind",
  "Bootstrap",
  "jQuery",
  "Flutter",
  "iOS",
  "Android",
  "UI/UX",
  "UX Design",
  "UI Design",
  "Figma",
  "Sketch",
  "Adobe XD",
  "Wireframing",
  "Prototyping",
  // Backend / data
  "Node.js",
  "Node",
  "Express",
  "NestJS",
  "Django",
  "Flask",
  "FastAPI",
  "Spring Boot",
  "Spring",
  "Laravel",
  "Rails",
  ".NET",
  "ASP.NET",
  "GraphQL",
  "REST",
  "REST API",
  "gRPC",
  "Microservices",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "DynamoDB",
  "Cassandra",
  "Oracle",
  "SQLite",
  "Prisma",
  "Sequelize",
  "Kafka",
  "RabbitMQ",
  "Spark",
  "Hadoop",
  "Airflow",
  "dbt",
  "Snowflake",
  "BigQuery",
  "Redshift",
  "ETL",
  "Data Engineering",
  "Data Science",
  "Machine Learning",
  "Deep Learning",
  "NLP",
  "Computer Vision",
  "PyTorch",
  "TensorFlow",
  "Scikit-learn",
  "Pandas",
  "NumPy",
  "SciPy",
  "SymPy",
  "LaTeX",
  "Jupyter",
  "Matplotlib",
  "Power BI",
  "Tableau",
  "Looker",
  "Excel",
  // Cloud / DevOps
  "AWS",
  "Azure",
  "GCP",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitHub Actions",
  "CI/CD",
  "DevOps",
  "Linux",
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Nginx",
  "Serverless",
  "Lambda",
  // Product / business (avoid vague soft skills — they appear in every JD)
  "Agile",
  "Scrum",
  "Kanban",
  "Jira",
  "Confluence",
  "Product Management",
  "Project Management",
  "Stakeholder Management",
  "Customer Service",
  "SEO",
  "SEM",
  "Content Writing",
  "Copywriting",
  "Accounting",
  "Bookkeeping",
  "Financial Analysis",
  "Salesforce",
  "HubSpot",
  "SAP",
  "CRM",
  "ERP",
  "Cybersecurity",
  "Information Security",
  "Penetration Testing",
  "Networking",
  "QA",
  "Quality Assurance",
  "Selenium",
  "Cypress",
  "Playwright",
  "Jest",
  "Unit Testing",
];

const SORTED_VOCAB = [...JOB_TEXT_SKILL_VOCAB].sort(
  (a, b) => b.length - a.length,
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Pull known skills mentioned in job free text. */
export function extractSkillsFromJobText(text: string): string[] {
  if (!text.trim()) return [];
  const haystack = text.toLowerCase();
  const found: string[] = [];
  const seen = new Set<string>();

  for (const skill of SORTED_VOCAB) {
    const key = normalizeSkill(skill);
    if (!key || seen.has(key)) continue;

    // Word-boundary style match; allow # + . / in skill names
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(key)}([^a-z0-9]|$)`,
      "i",
    );
    if (!pattern.test(haystack)) continue;

    seen.add(key);
    found.push(skill);
    if (found.length >= 16) break;
  }

  return found;
}

function tierFromRatio(
  matchedCount: number,
  totalCount: number,
  transferableHits = 0,
): SkillMatchTier {
  if (totalCount <= 0) return "none";
  const ratio = matchedCount / totalCount;
  const coreCount = Math.max(1, Math.ceil(totalCount * 0.7));

  if (matchedCount === totalCount) return "perfect";
  if (matchedCount >= coreCount && ratio >= 0.7) return "good";
  if (ratio >= 0.35 || (matchedCount >= 2 && transferableHits >= 1)) {
    return "wildcard";
  }
  if (matchedCount > 0 || transferableHits >= 2) return "future";
  return "none";
}

export function rateSkillMatch(
  profileSkills: string[],
  job: {
    skills?: string[] | null;
    title?: string;
    category?: string;
    description?: string;
    requirements?: string;
  },
): SkillMatchResult {
  const profile = uniqueSkills(profileSkills);
  const listed = getListedJobSkills(job);
  const text = jobSearchText(job);

  if (!profile.length) {
    return {
      tier: "none",
      title: SKILL_MATCH_COPY.none.title,
      description:
        "Add skills to your profile to see how you match this role.",
      score: 0,
      matchedSkills: [],
      missingSkills: listed,
      jobSkills: listed,
      skillsSource: listed.length ? "listed" : "none",
      profileSkillCount: 0,
    };
  }

  // Path A: job has listed skills → compare profile against those
  if (listed.length > 0) {
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const jobSkill of listed) {
      if (profile.some((p) => skillsOverlap(p, jobSkill))) {
        matchedSkills.push(jobSkill);
      } else {
        missingSkills.push(jobSkill);
      }
    }

    let transferableHits = 0;
    for (const p of profile) {
      if (matchedSkills.some((m) => skillsOverlap(m, p))) continue;
      if (skillFoundInText(p, text)) transferableHits += 1;
    }

    const tier = tierFromRatio(
      matchedSkills.length,
      listed.length,
      transferableHits,
    );

    return {
      tier,
      ...SKILL_MATCH_COPY[tier],
      score: Math.round((matchedSkills.length / listed.length) * 100),
      matchedSkills,
      missingSkills,
      jobSkills: listed,
      skillsSource: "listed",
      profileSkillCount: profile.length,
    };
  }

  // Path B: no listed skills (Adzuna / Himalayas) →
  // extract known skills from job text, then compare to profile.
  const extracted = extractSkillsFromJobText(text);

  if (extracted.length > 0) {
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const jobSkill of extracted) {
      if (profile.some((p) => skillsOverlap(p, jobSkill))) {
        matchedSkills.push(jobSkill);
      } else {
        missingSkills.push(jobSkill);
      }
    }

    // Tier bump only — do NOT add these to matched chips (keeps % in sync)
    let transferableHits = 0;
    for (const p of profile) {
      if (matchedSkills.some((m) => skillsOverlap(m, p))) continue;
      if (skillFoundInText(p, text)) transferableHits += 1;
    }

    const tier = tierFromRatio(
      matchedSkills.length,
      extracted.length,
      transferableHits,
    );
    const score = Math.round((matchedSkills.length / extracted.length) * 100);

    return {
      tier,
      ...SKILL_MATCH_COPY[tier],
      score,
      matchedSkills,
      missingSkills: missingSkills.slice(0, 10),
      jobSkills: extracted,
      skillsSource: "extracted",
      profileSkillCount: profile.length,
    };
  }

  // Path C: vocab found nothing — fall back to profile skills in text
  const matchedSkills: string[] = [];

  for (const skill of profile) {
    if (skillFoundInText(skill, text)) matchedSkills.push(skill);
  }

  if (matchedSkills.length === 0) {
    return {
      tier: "none",
      ...SKILL_MATCH_COPY.none,
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      jobSkills: [],
      skillsSource: "profile-in-job",
      profileSkillCount: profile.length,
    };
  }

  const tier = tierFromRatio(matchedSkills.length, profile.length);
  const score = Math.round((matchedSkills.length / profile.length) * 100);

  return {
    tier,
    ...SKILL_MATCH_COPY[tier],
    score,
    matchedSkills,
    // Without extracted job skills we can't know role gaps
    missingSkills: [],
    jobSkills: matchedSkills,
    skillsSource: "profile-in-job",
    profileSkillCount: profile.length,
  };
}
