import { requireAuth } from "@/lib/requireAuth";
import { getRecruiterCompanyAccess } from "@/lib/recruiterCompanyAccess";
import RecruiterSidebar from "@/app/components/RecruiterSidebar";
import RecruiterAccessShell from "@/app/components/RecruiterAccessShell";
import ApplicationNotifications from "@/app/components/ApplicationNotifications";
import { cookies } from "next/headers";
import SeekerThemeToggle, { SeekerThemeProvider } from "@/app/components/SeekerTheme";
import seekerStyles from "../seeker/seeker.module.css";
import styles from "./recruiter.module.css";

export default async function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAuth(["recruiter"]);
  const access = await getRecruiterCompanyAccess(auth.sub);
  const preferences = await cookies();
  const theme = (preferences.get("recruiter-theme") ?? preferences.get("seeker-theme"))?.value === "dark" ? "dark" : "light";

  return (
    <SeekerThemeProvider initialTheme={theme} cookieName="recruiter-theme">
    <div className={`${seekerStyles.workspace} min-h-screen font-[family-name:var(--font-ui)]`}>
      <div className="flex min-h-screen">
        <RecruiterSidebar access={access} />
        <div className="min-w-0 flex-1 overflow-x-hidden">
          <div className={styles.toolbar}><SeekerThemeToggle /></div>
          <div className={styles.content}>
          <RecruiterAccessShell access={access}>{children}</RecruiterAccessShell>
          </div>
        </div>
      </div>
      {access.approved ? <ApplicationNotifications /> : null}
    </div>
    </SeekerThemeProvider>
  );
}
