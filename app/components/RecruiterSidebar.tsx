"use client";

import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  FileText,
  Users,
  CalendarCheck,
  Building2,
  Settings,
} from "lucide-react";
import DashboardSidebarShell from "./DashboardSidebarShell";
import { DASH } from "@/app/lib/dashboardTheme";
import type { RecruiterCompanyAccess } from "@/lib/recruiterCompanyAccess";

export default function RecruiterSidebar({
  access,
}: {
  access: RecruiterCompanyAccess;
}) {
  const footerTitle = access.approved
    ? "Workspace Active"
    : !access.hasCompany
      ? "Profile required"
      : access.status === "rejected"
        ? "Approval needed"
        : "Awaiting approval";

  const footerCopy = access.approved
    ? "Post jobs, review applications & manage candidates."
    : !access.hasCompany
      ? "Complete your company profile, then wait for admin approval."
      : access.status === "rejected"
        ? "Update your company details and resubmit for review."
        : "Hiring tools unlock after an admin approves your company.";

  return (
    <DashboardSidebarShell
      brandEyebrow="Hiring Workspace"
      brandTitle="Recruiter Panel"
      brandIcon={Briefcase}
      groups={[
        {
          label: "Main Menu",
          items: [
            {
              label: "Overview",
              href: "/dashboard/recruiter",
              icon: LayoutDashboard,
              exact: true,
            },
            {
              label: "Post a Job",
              href: "/dashboard/recruiter/jobs/new",
              icon: PlusCircle,
            },
            {
              label: "My Jobs",
              href: "/dashboard/recruiter/jobs",
              icon: Briefcase,
              exact: true,
            },
          ],
        },
        {
          label: "Hiring",
          items: [
            {
              label: "Applications",
              href: "/dashboard/recruiter/applications",
              icon: FileText,
            },
            {
              label: "Candidates",
              href: "/dashboard/recruiter/candidates",
              icon: Users,
            },
            {
              label: "Interviews",
              href: "/dashboard/recruiter/interviews",
              icon: CalendarCheck,
            },
          ],
        },
        {
          label: "Account",
          items: [
            {
              label: "Company",
              href: "/dashboard/recruiter/company",
              icon: Building2,
            },
            {
              label: "Settings",
              href: "/dashboard/recruiter/settings",
              icon: Settings,
            },
          ],
        },
      ]}
      footer={
        <div
          className="overflow-hidden rounded-2xl border border-white/10 p-4"
          style={{ background: DASH.panelSoft }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                access.approved
                  ? "bg-[#34d399] shadow-[0_0_8px_#34d399]"
                  : access.status === "rejected"
                    ? "bg-[#f87171] shadow-[0_0_8px_#f87171]"
                    : "bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]"
              }`}
            />
            <p className="text-xs font-bold text-white">{footerTitle}</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">
            {footerCopy}
          </p>
        </div>
      }
    />
  );
}
