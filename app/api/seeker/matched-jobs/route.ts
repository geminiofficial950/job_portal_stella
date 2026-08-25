import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { User } from "@/models/User";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";

function normalizeSkill(s: string) {
  return s.trim().toLowerCase();
}

export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    await connectDB();

    const user = await User.findById(result.auth.sub)
      .select("seekerProfile.skills")
      .lean();

    const skills = (user?.seekerProfile?.skills || [])
      .map((s) => normalizeSkill(String(s)))
      .filter(Boolean);

    if (!skills.length) {
      return NextResponse.json({
        success: true,
        count: 0,
        companies: [],
        hasSkills: false,
      });
    }

    const skillSet = new Set(skills);
    const jobs = await Job.find({ status: "open" })
      .select("skills companyId title")
      .sort({ createdAt: -1 })
      .limit(120)
      .lean();

    const matched = jobs.filter((job) =>
      (job.skills || []).some((s) => skillSet.has(normalizeSkill(String(s))))
    );

    const companyIds = [
      ...new Set(matched.map((j) => String(j.companyId))),
    ].slice(0, 4);

    const companies = await Company.find({ _id: { $in: companyIds } })
      .select("name logoUrl")
      .lean();

    const companyMap = new Map(companies.map((c) => [String(c._id), c]));

    return NextResponse.json({
      success: true,
      count: matched.length,
      hasSkills: true,
      companies: companyIds
        .map((id) => {
          const c = companyMap.get(id);
          if (!c) return null;
          return {
            name: c.name,
            logoUrl: c.logoUrl || "",
            initial: (c.name || "?").charAt(0).toUpperCase(),
          };
        })
        .filter(Boolean),
    });
  } catch (error) {
    console.error("Matched jobs GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load matched jobs" },
      { status: 500 }
    );
  }
}
