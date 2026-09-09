import { connectDB } from "@/lib/db";
import { Company, type CompanyStatus } from "@/models/Company";
import { NextResponse } from "next/server";

export type RecruiterCompanyAccess = {
  hasCompany: boolean;
  approved: boolean;
  status: CompanyStatus | null;
  companyName: string;
  rejectionReason: string;
};

export async function getRecruiterCompanyAccess(
  recruiterId: string,
): Promise<RecruiterCompanyAccess> {
  await connectDB();
  const company = await Company.findOne({ ownerId: recruiterId })
    .select("name status rejectionReason")
    .lean();

  if (!company) {
    return {
      hasCompany: false,
      approved: false,
      status: null,
      companyName: "",
      rejectionReason: "",
    };
  }

  return {
    hasCompany: true,
    approved: company.status === "approved",
    status: company.status,
    companyName: company.name || "",
    rejectionReason: company.rejectionReason || "",
  };
}

/** API guard — recruiter actions require an admin-approved company. */
export async function requireApprovedRecruiterCompany(recruiterId: string) {
  const access = await getRecruiterCompanyAccess(recruiterId);
  if (access.approved) return { access, error: null as NextResponse | null };

  const message = !access.hasCompany
    ? "Complete your company profile and wait for admin approval before using hiring tools."
    : access.status === "rejected"
      ? "Your company profile was not approved. Update your details and resubmit for review."
      : "Your company profile is awaiting admin approval. Hiring tools unlock once you’re approved.";

  return {
    access,
    error: NextResponse.json({ success: false, message }, { status: 403 }),
  };
}
