import { cookies } from "next/headers";
import { SeekerThemeProvider } from "@/app/components/SeekerTheme";
import { requireAuth } from "@/lib/requireAuth";
import SeekerSidebar from "@/app/components/SeekerSidebar";
import MatchedJobsNotification from "@/app/components/MatchedJobsNotification";
import ApplicationNotifications from "@/app/components/ApplicationNotifications";
import styles from "./seeker.module.css";

export default async function SeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(["user"]);

  const theme = (await cookies()).get("seeker-theme")?.value === "light" ? "light" : "dark";

  return (
    <SeekerThemeProvider initialTheme={theme}>
    <div
      className={`${styles.workspace} min-h-screen font-[family-name:var(--font-ui)]`}
    >
      <div className="flex min-h-screen">
        <SeekerSidebar />
        <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
      </div>
      <MatchedJobsNotification />
      <ApplicationNotifications />
    </div>
    </SeekerThemeProvider>
  );
}
