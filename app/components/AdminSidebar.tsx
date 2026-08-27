"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  UserCog,
  Shield,
} from "lucide-react";
import DashboardSidebarShell from "./DashboardSidebarShell";

export default function AdminSidebar() {
  return (
    <DashboardSidebarShell
      brandEyebrow="Platform Control"
      brandTitle="Admin Panel"
      brandIcon={Shield}
      groups={[
        {
          label: "Main Menu",
          items: [
            {
              label: "Overview",
              href: "/dashboard/admin",
              icon: LayoutDashboard,
              exact: true,
            },
            {
              label: "Users",
              href: "/dashboard/admin/users",
              icon: Users,
            },
            {
              label: "Recruiters",
              href: "/dashboard/admin/recruiters",
              icon: UserCog,
            },
            {
              label: "Companies",
              href: "/dashboard/admin/companies",
              icon: Building2,
            },
            {
              label: "Jobs",
              href: "/dashboard/admin/jobs",
              icon: Briefcase,
            },
          ],
        },
      ]}
    />
  );
}
