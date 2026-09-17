"use client";

import {
  LayoutDashboard,
  Search,
  FileText,
  Mail,
  Bookmark,
  CalendarCheck,
  UserRound,
  Settings,
  Bell,
} from "lucide-react";
import styles from "@/app/dashboard/seeker/seeker.module.css";
import DashboardSidebarShell from "./DashboardSidebarShell";

export default function SeekerSidebar() {
  return (
    <DashboardSidebarShell
      sidebarClassName={styles.sidebar}
      menuButtonClassName={styles.menuButton}
      brandLogo
      mobileTabs={[
        {
          label: "Home",
          href: "/dashboard/seeker",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Jobs",
          href: "/dashboard/seeker/suggested",
          icon: Search,
        },
        {
          label: "Applied",
          href: "/dashboard/seeker/applications",
          icon: FileText,
        },
      ]}
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
              label: "Suggested Jobs",
              href: "/dashboard/seeker/suggested",
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
              label: "Cover letters",
              href: "/dashboard/seeker/cover-letters",
              icon: Mail,
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
            {
              label: "Learning prefs",
              href: "/dashboard/seeker/preferences",
              icon: Bell,
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
