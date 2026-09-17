"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  UserCog,
  BadgeCheck,
  GraduationCap,
  Mail,
} from "lucide-react";
import DashboardSidebarShell from "./DashboardSidebarShell";
import styles from "@/app/dashboard/seeker/seeker.module.css";

export default function AdminSidebar() {
  return (
    <DashboardSidebarShell
      sidebarClassName={styles.sidebar}
      menuButtonClassName={styles.menuButton}
      brandLogo
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
            {
              label: "Verification",
              href: "/dashboard/admin/verification",
              icon: BadgeCheck,
            },
            {
              label: "Learning",
              href: "/dashboard/admin/learning",
              icon: GraduationCap,
            },
            {
              label: "Messages",
              href: "/dashboard/admin/messages",
              icon: Mail,
            },
          ],
        },
      ]}
    />
  );
}
