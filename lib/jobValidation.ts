import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  SALARY_PERIODS,
  WORK_MODES,
  type EmploymentType,
  type ExperienceLevel,
  type JobStatus,
  type SalaryPeriod,
  type WorkMode,
} from "@/models/Job";

export type ParsedJobInput = {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
  vacancies: number;
  skills: string[];
  benefits: string;
  applicationDeadline: Date | null;
  status: JobStatus;
};

function asString(value: unknown) {
  return String(value ?? "").trim();
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function includes<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value);
}

export function parseJobBody(body: Record<string, unknown>): {
  data?: ParsedJobInput;
  error?: string;
} {
  const title = asString(body.title);
  const description = asString(body.description);
  const requirements = asString(body.requirements);
  const responsibilities = asString(body.responsibilities);
  const location = asString(body.location);
  const category = asString(body.category);
  const employmentType = asString(body.employmentType);
  const workMode = asString(body.workMode);
  const experienceLevel = asString(body.experienceLevel);
  const salaryCurrency = asString(body.salaryCurrency || "AUD").toUpperCase();
  const salaryPeriod = asString(body.salaryPeriod || "year");
  const benefits = asString(body.benefits);
  const statusRaw = asString(body.status || "open");

  const salaryMin = Number(body.salaryMin);
  const salaryMax = Number(body.salaryMax);
  const vacancies = Number(body.vacancies ?? 1);

  const skillsRaw = body.skills;
  let skills: string[] = [];
  if (Array.isArray(skillsRaw)) {
    skills = skillsRaw.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof skillsRaw === "string") {
    skills = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let applicationDeadline: Date | null = null;
  const deadlineRaw = asString(body.applicationDeadline);
  if (deadlineRaw) {
    const d = new Date(deadlineRaw);
    if (Number.isNaN(d.getTime())) {
      return { error: "Invalid application deadline" };
    }
    applicationDeadline = d;
  }

  if (!title || title.length < 3) {
    return { error: "Job title is required (min 3 characters)" };
  }

  const plainDescription = stripHtml(description);
  const plainRequirements = stripHtml(requirements);
  const plainResponsibilities = stripHtml(responsibilities);

  if (!plainDescription || plainDescription.length < 20) {
    return { error: "Description is required (min 20 characters)" };
  }
  if (!plainRequirements || plainRequirements.length < 10) {
    return { error: "Requirements are required" };
  }
  if (!plainResponsibilities || plainResponsibilities.length < 10) {
    return { error: "Responsibilities are required" };
  }
  if (!location) {
    return { error: "Location is required" };
  }
  if (!category) {
    return { error: "Category is required" };
  }
  if (!includes(EMPLOYMENT_TYPES, employmentType)) {
    return { error: "Valid employment type is required" };
  }
  if (!includes(WORK_MODES, workMode)) {
    return { error: "Valid work mode is required" };
  }
  if (!includes(EXPERIENCE_LEVELS, experienceLevel)) {
    return { error: "Valid experience level is required" };
  }
  if (!Number.isFinite(salaryMin) || salaryMin < 0) {
    return { error: "Valid minimum salary is required" };
  }
  if (!Number.isFinite(salaryMax) || salaryMax < 0) {
    return { error: "Valid maximum salary is required" };
  }
  if (salaryMax < salaryMin) {
    return { error: "Maximum salary must be greater than or equal to minimum" };
  }
  if (!salaryCurrency || salaryCurrency.length !== 3) {
    return { error: "Salary currency is required (e.g. AUD)" };
  }
  if (!includes(SALARY_PERIODS, salaryPeriod)) {
    return { error: "Valid salary period is required" };
  }
  if (!Number.isFinite(vacancies) || vacancies < 1) {
    return { error: "At least 1 vacancy is required" };
  }
  if (!includes(JOB_STATUSES, statusRaw)) {
    return { error: "Valid job status is required" };
  }

  return {
    data: {
      title,
      description,
      requirements,
      responsibilities,
      location,
      category,
      employmentType,
      workMode,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      vacancies: Math.floor(vacancies),
      skills,
      benefits,
      applicationDeadline,
      status: statusRaw,
    },
  };
}
