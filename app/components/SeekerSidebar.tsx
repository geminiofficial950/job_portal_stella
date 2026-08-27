"use client";

import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  CalendarCheck,
  UserRound,
  Settings,
  Briefcase,
} from "lucide-react";
import DashboardSidebarShell from "./DashboardSidebarShell";

export default function SeekerSidebar() {
  return (
    <DashboardSidebarShell
      brandEyebrow="Career Workspace"
      brandTitle="Job Seeker Panel"
      brandIcon={Briefcase}
      groups={[
        {
          label: "Main Menu",
          items: [
            {
              label: "Overview",
              href: "/dashboard/seeker",
              icon: LayoutDashboard,
              exact: true,
            },
            {
              label: "Find Jobs",
              href: "/dashboard/seeker/jobs",
              icon: Search,
            },
          ],
        },
        {
          label: "Career",
          items: [
            {
              label: "Applications",
              href: "/dashboard/seeker/applications",
              icon: FileText,
            },
            {
              label: "Saved Jobs",
              href: "/dashboard/seeker/saved",
              icon: Bookmark,
            },
            {
              label: "Interviews",
              href: "/dashboard/seeker/interviews",
              icon: CalendarCheck,
            },
          ],
        },
        {
          label: "Account",
          items: [
            {
              label: "Profile",
              href: "/dashboard/seeker/profile",
              icon: UserRound,
            },
            {
              label: "Settings",
              href: "/dashboard/seeker/settings",
              icon: Settings,
            },
          ],
        },
      ]}
    />
  );
}
