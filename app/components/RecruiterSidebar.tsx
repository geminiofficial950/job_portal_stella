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

export default function RecruiterSidebar() {
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
              className="h-2 w-2 rounded-full shadow-[0_0_8px_#5850ec]"
              style={{ background: DASH.accent }}
            />
            <p className="text-xs font-bold text-white">Workspace Active</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">
            Post jobs, review applications & manage candidates.
          </p>
        </div>
      }
    />
  );
}
