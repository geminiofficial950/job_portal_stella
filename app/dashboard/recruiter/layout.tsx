import { requireAuth } from "@/lib/requireAuth";
import { getRecruiterCompanyAccess } from "@/lib/recruiterCompanyAccess";
import RecruiterSidebar from "@/app/components/RecruiterSidebar";
import RecruiterAccessShell from "@/app/components/RecruiterAccessShell";
import ApplicationNotifications from "@/app/components/ApplicationNotifications";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
    <div data-seeker-finish="matte" className={`${seekerStyles.workspace} ${seekerStyles.creamCanvas} min-h-screen font-[family-name:var(--font-ui)]`}>
      <div className="flex min-h-screen">
        <RecruiterSidebar access={access} />
        <div className={`${seekerStyles.mainContent} min-w-0 flex-1 overflow-x-hidden`}>
          <header className={`${seekerStyles.topbar} ${styles.toolbar}`}>
            <div className={seekerStyles.breadcrumb}>Workspace <span>/</span> <strong>Recruiter</strong></div>
            <div className={seekerStyles.headerActions}>
              <SeekerThemeToggle />
              <Link href="/dashboard/recruiter/company" className={seekerStyles.account} aria-label="View your company profile">
                <span className={seekerStyles.avatar}>{auth.name.trim().charAt(0).toUpperCase()}</span>
                <span>{auth.name}<small>Hiring workspace</small></span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </header>
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
