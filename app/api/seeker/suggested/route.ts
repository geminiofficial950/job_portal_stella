import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { rateSkillMatch } from "@/lib/skill-match";
import { Job, serializeJob } from "@/models/Job";
import { Company } from "@/models/Company";
import { User } from "@/models/User";
import { Application } from "@/models/Application";
import { BoardApplication } from "@/models/BoardApplication";

export const maxDuration = 60;

type CandidateJob = {
  id: string;
  source: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  category: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  skills: string[];
  applyUrl: string;
  createdAt: string | null;
  company: {
    name: string;
    logoUrl: string;
    location: string;
    industry: string;
    about: string;
  };
};

function boardExternalKey(source: string, id: string) {
  return `${source || "board"}:${id}`.slice(0, 200);
}

function asCandidateFromStella(
  job: Record<string, unknown>,
  company: {
    name?: string;
    logoUrl?: string;
    location?: string;
    industry?: string;
    about?: string;
  } | null,
): CandidateJob {
  const serialized = serializeJob(
    job as unknown as Parameters<typeof serializeJob>[0],
  );
  return {
    id: serialized.id,
    source: "stella",
    title: serialized.title,
    description: serialized.description || "",
    requirements: serialized.requirements || "",
    responsibilities: serialized.responsibilities || "",
    location: serialized.location || "",
    category: serialized.category || "",
    employmentType: serialized.employmentType || "",
    workMode: serialized.workMode || "",
    experienceLevel: serialized.experienceLevel || "",
    salaryMin: serialized.salaryMin ?? null,
    salaryMax: serialized.salaryMax ?? null,
    salaryCurrency: serialized.salaryCurrency || "AUD",
    salaryPeriod: serialized.salaryPeriod || "",
    skills: serialized.skills || [],
    applyUrl: "",
    createdAt: serialized.createdAt || null,
    company: {
      name: company?.name || "Company",
      logoUrl: company?.logoUrl || "",
      location: company?.location || "",
      industry: company?.industry || "",
      about: company?.about || "",
    },
  };
}

function asCandidateFromBoard(job: Record<string, unknown>): CandidateJob {
  const company =
    job.company && typeof job.company === "object"
      ? (job.company as Record<string, unknown>)
      : {};
  return {
    id: String(job.id || ""),
    source: String(job.source || "board"),
    title: String(job.title || "Role"),
    description: String(job.description || ""),
    requirements: String(job.requirements || ""),
    responsibilities: String(job.responsibilities || ""),
    location: String(job.location || ""),
    category: String(job.category || ""),
    employmentType: String(job.employmentType || ""),
    workMode: String(job.workMode || ""),
    experienceLevel: String(job.experienceLevel || ""),
    salaryMin:
      typeof job.salaryMin === "number" && Number.isFinite(job.salaryMin)
        ? job.salaryMin
        : null,
    salaryMax:
      typeof job.salaryMax === "number" && Number.isFinite(job.salaryMax)
        ? job.salaryMax
        : null,
    salaryCurrency: String(job.salaryCurrency || "AUD"),
    salaryPeriod: String(job.salaryPeriod || ""),
    skills: Array.isArray(job.skills)
      ? job.skills.map((s) => String(s)).filter(Boolean)
      : [],
    applyUrl: String(job.applyUrl || ""),
    createdAt: job.createdAt ? String(job.createdAt) : null,
    company: {
      name: String(company.name || "Company"),
      logoUrl: String(company.logoUrl || ""),
      location: String(company.location || ""),
      industry: String(company.industry || ""),
      about: String(company.about || ""),
    },
  };
}

function mentionsSkill(job: CandidateJob, skill: string) {
  const needle = skill.trim().toLowerCase();
  if (!needle) return false;
  const hay = [
    job.title,
    job.category,
    job.description,
    job.requirements,
    ...(job.skills || []),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    await connectDB();

    const user = await User.findById(result.auth.sub)
      .select("seekerProfile.skills")
      .lean();

    const profileSkills = (user?.seekerProfile?.skills || [])
      .map((s) => String(s).trim())
      .filter(Boolean);

    if (!profileSkills.length) {
      return NextResponse.json({
        success: true,
        hasSkills: false,
        jobs: [],
        message: "Add skills to your profile to see suggested roles.",
      });
    }

    const skillQueries = profileSkills.slice(0, 4);
    const byId = new Map<string, CandidateJob>();

    // 1) Stella open roles
    const stellaJobs = await Job.find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();
    const companyIds = [
      ...new Set(stellaJobs.map((j) => String(j.companyId))),
    ];
    const companies = await Company.find({ _id: { $in: companyIds } })
      .select("name logoUrl location industry about")
      .lean();
    const companyMap = new Map(companies.map((c) => [String(c._id), c]));

    for (const job of stellaJobs) {
      const candidate = asCandidateFromStella(
        job as unknown as Record<string, unknown>,
        companyMap.get(String(job.companyId)) || null,
      );
      byId.set(candidate.id, candidate);
    }

    // 2) Live board listings for each top skill (same pool as /jobs)
    const [
      { fetchAdzunaJobs },
      { fetchHimalayasJobs },
      { fetchJoobleJobs },
    ] = await Promise.all([
      import("@/lib/adzuna"),
      import("@/lib/himalayas"),
      import("@/lib/jooble"),
    ]);

    await Promise.all(
      skillQueries.map(async (skill) => {
        const [adzuna, himalayas, jooble] = await Promise.allSettled([
          fetchAdzunaJobs({
            country: "au",
            q: skill,
            resultsPerCountry: 40,
          }),
          fetchHimalayasJobs({
            country: "au",
            q: skill,
            jobsPerCountry: 60,
          }),
          fetchJoobleJobs({
            country: "au",
            q: skill,
            jobsPerCountry: 30,
          }),
        ]);

        const packs = [adzuna, himalayas, jooble];
        for (const pack of packs) {
          if (pack.status !== "fulfilled" || !pack.value?.jobs) continue;
          for (const raw of pack.value.jobs) {
            const candidate = asCandidateFromBoard(
              raw as unknown as Record<string, unknown>,
            );
            if (!candidate.id) continue;
            if (!byId.has(candidate.id)) byId.set(candidate.id, candidate);
          }
        }
      }),
    );

    const candidates = [...byId.values()];

    const scored = candidates
      .map((job) => {
        const match = rateSkillMatch(profileSkills, {
          skills: job.skills,
          title: job.title,
          category: job.category,
          description: job.description,
          requirements: job.requirements,
        });

        // Extra boost when a profile skill is clearly named in the role
        let score = match.score;
        let matchedSkills = [...match.matchedSkills];
        for (const skill of profileSkills) {
          if (mentionsSkill(job, skill)) {
            if (
              !matchedSkills.some(
                (m) => m.toLowerCase() === skill.toLowerCase(),
              )
            ) {
              matchedSkills.push(skill);
            }
            score = Math.max(score, 55);
          }
        }

        return {
          job,
          match: {
            ...match,
            score,
            matchedSkills,
          },
        };
      })
      .filter(
        (row) =>
          row.match.score >= 15 ||
          row.match.matchedSkills.length > 0 ||
          profileSkills.some((skill) => mentionsSkill(row.job, skill)),
      )
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 60);

    const stellaIds = scored
      .filter((row) => row.job.source === "stella")
      .map((row) => row.job.id);
    const boardKeys = scored
      .filter((row) => row.job.source !== "stella")
      .map((row) => boardExternalKey(row.job.source, row.job.id));

    const [stellaApps, boardApps] = await Promise.all([
      stellaIds.length
        ? Application.find({
            seekerId: result.auth.sub,
            jobId: { $in: stellaIds },
          })
            .select("jobId status")
            .lean()
        : Promise.resolve([]),
      boardKeys.length
        ? BoardApplication.find({
            seekerId: result.auth.sub,
            externalKey: { $in: boardKeys },
          })
            .select("externalKey status")
            .lean()
        : Promise.resolve([]),
    ]);

    const appliedStella = new Map(
      stellaApps.map((a) => [String(a.jobId), a.status]),
    );
    const appliedBoard = new Map(
      boardApps.map((a) => [a.externalKey, a.status]),
    );

    return NextResponse.json({
      success: true,
      hasSkills: true,
      jobs: scored.map(({ job, match }) => {
        const appliedStatus =
          job.source === "stella"
            ? appliedStella.get(job.id) || null
            : appliedBoard.get(boardExternalKey(job.source, job.id)) || null;

        return {
          id: job.id,
          source: job.source,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          location: job.location,
          category: job.category,
          employmentType: job.employmentType,
          workMode: job.workMode,
          experienceLevel: job.experienceLevel,
          salaryMin: job.salaryMin ?? 0,
          salaryMax: job.salaryMax ?? 0,
          salaryCurrency: job.salaryCurrency,
          salaryPeriod: job.salaryPeriod,
          skills: job.skills,
          applyUrl: job.applyUrl,
          createdAt: job.createdAt,
          applied: Boolean(appliedStatus),
          applicationStatus: appliedStatus,
          matchScore: match.score,
          matchTier: match.tier,
          matchTitle: match.title,
          matchedSkills: match.matchedSkills,
          company: job.company,
        };
      }),
    });
  } catch (error) {
    console.error("Seeker suggested jobs GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load suggested jobs" },
      { status: 500 },
    );
  }
}
