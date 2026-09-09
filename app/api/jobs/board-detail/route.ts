import { NextResponse } from "next/server";
import { parseAdzunaJobId } from "@/lib/adzuna-url";

export const maxDuration = 30;

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function mapBoardJob(job: {
  id: string;
  source: string;
  title: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  location?: string;
  category?: string;
  employmentType?: string;
  workMode?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  skills?: string[];
  createdAt?: string | null;
  applyUrl?: string;
  countryLabel?: string;
  company?: {
    name?: string;
    logoUrl?: string;
    about?: string;
  };
}) {
  return {
    id: job.id,
    source: job.source,
    title: job.title,
    description: job.description || "",
    requirements: job.requirements || "",
    responsibilities: job.responsibilities || "",
    location: job.location || "",
    category: job.category || "",
    employmentType: job.employmentType || "",
    workMode: job.workMode || "",
    experienceLevel: job.experienceLevel || "",
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    salaryCurrency: job.salaryCurrency || "AUD",
    salaryPeriod: job.salaryPeriod || "",
    skills: Array.isArray(job.skills) ? job.skills : [],
    createdAt: job.createdAt || null,
    applyUrl: job.applyUrl || "",
    countryLabel: job.countryLabel || "",
    company: {
      name: job.company?.name || "Company",
      logoUrl: job.company?.logoUrl || "",
      about: job.company?.about || "",
    },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim() || "";
    const title = searchParams.get("title")?.trim() || "";
    const sourceParam = (searchParams.get("source")?.trim() || "").toLowerCase();
    const applyUrl = searchParams.get("applyUrl")?.trim() || "";

    if (!id && !title) {
      return badRequest("id or title is required");
    }

    const inferredSource =
      sourceParam ||
      (parseAdzunaJobId(id)
        ? "adzuna"
        : id.startsWith("himalayas-")
          ? "himalayas"
          : id.startsWith("jooble-")
            ? "jooble"
            : /adzuna\./i.test(applyUrl)
              ? "adzuna"
              : /himalayas\.app/i.test(applyUrl)
                ? "himalayas"
                : "board");

    if (inferredSource === "adzuna" || parseAdzunaJobId(id)) {
      const params = new URLSearchParams({ id: id || "adzuna-au-0" });
      if (applyUrl) params.set("applyUrl", applyUrl);
      if (title) params.set("title", title);
      const base = new URL(request.url).origin;
      const res = await fetch(`${base}/api/jobs/adzuna-detail?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.job) {
        return NextResponse.json(
          {
            success: false,
            message: data.message || "Could not load Adzuna job",
          },
          { status: res.status || 404 },
        );
      }
      return NextResponse.json({
        success: true,
        job: mapBoardJob({ ...data.job, source: "adzuna" }),
        descriptionHtml: data.descriptionHtml || "",
        descriptionSource: data.descriptionSource || "",
      });
    }

    if (inferredSource === "himalayas") {
      const { findHimalayasJobDetail } = await import("@/lib/himalayas");
      const job = await findHimalayasJobDetail({ id, title });
      if (!job) {
        return NextResponse.json(
          { success: false, message: "Himalayas job not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        job: mapBoardJob(job),
      });
    }

    if (inferredSource === "jooble") {
      const { findJoobleJobDetail } = await import("@/lib/jooble");
      const job = await findJoobleJobDetail({ id, title });
      if (!job) {
        return NextResponse.json(
          { success: false, message: "Jooble job not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        job: mapBoardJob(job),
      });
    }

    return NextResponse.json(
      { success: false, message: "Unsupported job source" },
      { status: 404 },
    );
  } catch (error) {
    console.error("Board detail GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load job details" },
      { status: 500 },
    );
  }
}
